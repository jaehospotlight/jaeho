"""Build Reading data from the owner's GitHub issues; no third-party packages."""

import json
import os
from pathlib import Path
import re
import subprocess
import urllib.parse


URL_PATTERN = re.compile(r"https?://[^\s<>\"`]+", re.IGNORECASE)
TWEET_HOSTS = {"x.com", "www.x.com", "twitter.com", "www.twitter.com", "mobile.twitter.com"}
TWEET_PATH = re.compile(r"/(?:[A-Za-z0-9_]+|i/web)/status/(\d+)/?$")


def normalize_url(raw):
    """Return a safe URL and a deduplication key, including Twitter/X aliases."""
    raw = raw.rstrip(".,;:!?)]}")
    try:
        parsed = urllib.parse.urlsplit(raw)
        if parsed.scheme.lower() not in {"http", "https"} or not parsed.hostname:
            return None
        if parsed.username or parsed.password or parsed.port is not None:
            return None
    except ValueError:
        return None
    host = parsed.hostname.lower()
    tweet = TWEET_PATH.fullmatch(parsed.path) if host in TWEET_HOSTS else None
    if tweet:
        tweet_id = tweet.group(1)
        path = parsed.path.rstrip("/").replace("/i/web/status/", "/i/status/")
        return f"https://x.com{path}", f"tweet:{tweet_id}"
    url = urllib.parse.urlunsplit((parsed.scheme.lower(), host, parsed.path, parsed.query, ""))
    return url, url


def extract_note(body):
    """Only publish text explicitly supplied as a personal note, never a summary."""
    lines = []
    in_note = False
    for line in body.splitlines():
        personal_note = re.match(r"^\s*Personal note:\s*(.*)$", line, re.IGNORECASE)
        personal_heading = re.fullmatch(r"\s*#{1,6}\s+Personal note\s*:?[ \t]*", line, re.IGNORECASE)
        if not in_note:
            if personal_note or personal_heading:
                in_note = True
                if personal_note:
                    lines.append(personal_note.group(1))
            continue
        # Stop at the next issue field; summaries can appear after a personal note.
        if re.match(r"^\s*#{1,6}\s+", line) or re.match(
            r"^\s*(?:summary|description|notes?|personal note|url|link|tweet(?: url)?|article(?: url)?|source):",
            line, re.IGNORECASE,
        ):
            break
        lines.append(line)
    note = "\n".join(lines).strip()
    return "" if note == "_No response_" else note


def reading_entries(issues, author):
    entries = []
    seen = set()
    # When the same link is submitted twice, prefer the newest submission.
    for issue in sorted(issues, key=lambda item: item["number"], reverse=True):
        if "pull_request" in issue or issue.get("user", {}).get("login", "").lower() != author.lower():
            continue
        labels = {label["name"].lower() for label in issue.get("labels", [])}
        if "reading-ignore" in labels:
            continue
        title = issue.get("title", "").strip()
        explicitly_reading = "reading" in labels or title.lower().startswith("[reading]")
        body = issue.get("body") or ""
        candidates = []
        for match in URL_PATTERN.finditer(body):
            raw = match.group().rstrip(".,;:!?)]}")
            normalized = normalize_url(raw)
            if normalized and (explicitly_reading or normalized[1].startswith("tweet:")):
                candidates.append((raw, *normalized))
        if not candidates:
            continue
        raw, url, key = candidates[0]
        if key in seen:
            continue
        seen.add(key)
        entries.append({
            "title": re.sub(r"^\[reading\]\s*", "", title, flags=re.IGNORECASE) or "Saved reading",
            "url": url,
            "note": extract_note(body),
            "added": issue["created_at"][:10],
            "issue_number": issue["number"],
        })
    return entries


def fetch_issues(repository):
    # gh is preinstalled on GitHub's Ubuntu runners and handles pagination/auth.
    # Closed issues remain published; use reading-ignore to remove an entry.
    response = subprocess.run(
        ["gh", "api", "--paginate", "--slurp", f"repos/{repository}/issues?state=all&per_page=100"],
        capture_output=True, text=True, check=True, timeout=120,
    )
    return [issue for page in json.loads(response.stdout) for issue in page]


def main():
    repository = os.environ["GITHUB_REPOSITORY"]
    author = os.environ.get("READING_AUTHOR", repository.split("/")[0])
    entries = reading_entries(fetch_issues(repository), author)
    output = Path("_data/reading_submissions.json")
    output.parent.mkdir(exist_ok=True)
    output.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Imported {len(entries)} Reading entries.")


if __name__ == "__main__":
    main()
