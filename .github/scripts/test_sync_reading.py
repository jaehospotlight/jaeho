import unittest
from unittest.mock import patch

from sync_reading import fetch_issues, normalize_url, reading_entries


def issue(number=1, **changes):
    result = {
        "number": number,
        "user": {"login": "jaehospotlight"},
        "title": "Gokul Rajaram - Growth founders: hire a near-peer",
        "body": "https://x.com/gokulr/status/2072856480336986393?s=20\n\nSummary: Hire a near-peer.",
        "labels": [],
        "created_at": "2026-09-20T00:42:21Z",
    }
    result.update(changes)
    return result


class ReadingTests(unittest.TestCase):
    def test_existing_instinct_format(self):
        entry, = reading_entries([issue()], "jaehospotlight")
        self.assertEqual(entry["url"], "https://x.com/gokulr/status/2072856480336986393")
        self.assertEqual(entry["note"], "Hire a near-peer.")
        self.assertEqual(entry["added"], "2026-09-20")

    def test_only_owner_issues_can_publish(self):
        submissions = [issue(user={"login": "stranger"}), issue(pull_request={}), issue(body="A normal bug report")]
        self.assertEqual(reading_entries(submissions, "jaehospotlight"), [])

    def test_non_tweet_links_need_reading_marker(self):
        article = issue(body="https://example.com/article\n\nNote: Worth a read.")
        self.assertEqual(reading_entries([article], "jaehospotlight"), [])
        for marker in ({"labels": [{"name": "reading"}]}, {"title": "[Reading] Good article"}):
            entry, = reading_entries([{**article, **marker}], "jaehospotlight")
            self.assertEqual(entry["url"], "https://example.com/article")
            self.assertEqual(entry["note"], "Worth a read.")

    def test_newest_duplicate_wins_across_x_and_twitter(self):
        newer = issue(2, body="https://twitter.com/other/status/2072856480336986393\nNote: My newer note")
        entries = reading_entries([issue(), newer], "jaehospotlight")
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]["note"], "My newer note")

    def test_closed_issue_remains_and_ignore_removes(self):
        self.assertEqual(len(reading_entries([issue(state="closed")], "jaehospotlight")), 1)
        self.assertEqual(reading_entries([issue(labels=[{"name": "reading-ignore"}])], "jaehospotlight"), [])

    def test_markdown_and_form_fields(self):
        body = "### Tweet URL\n[Original tweet](https://x.com/gokulr/status/123)\n\n### Note\nKeep this idea."
        entry, = reading_entries([issue(body=body)], "jaehospotlight")
        self.assertEqual(entry["note"], "Keep this idea.")
        self.assertEqual(entry["url"], "https://x.com/gokulr/status/123")

    def test_credentials_and_non_http_links_rejected(self):
        for url in ("javascript:alert(1)", "https://x.com@evil.com:bad/path", "https://name:secret@x.com/a/status/123"):
            self.assertIsNone(normalize_url(url))
        self.assertEqual(reading_entries([issue(body="https://x.com.evil.com/a/status/123")], "jaehospotlight"), [])

    def test_edit_is_reflected_on_next_build(self):
        entry, = reading_entries([issue(title="Updated title", body="https://x.com/a/status/123\nNote: Updated note")], "jaehospotlight")
        self.assertEqual(entry["title"], "Updated title")
        self.assertEqual(entry["note"], "Updated note")

    @patch("sync_reading.subprocess.run")
    def test_fetches_every_page_including_closed_issues(self, run):
        import json
        run.return_value.stdout = json.dumps([[issue(i) for i in range(100)], [issue(101)]])
        self.assertEqual(len(fetch_issues("owner/repo")), 101)
        command = run.call_args.args[0]
        self.assertIn("--paginate", command)
        self.assertIn("state=all", command[-1])


if __name__ == "__main__":
    unittest.main()
