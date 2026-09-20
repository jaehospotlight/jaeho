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


def extract_note(body, source_url):
    lines = []
    for line in body.splitlines():
        line = line.strip()
        # Support a plain link, a Markdown link, or a "URL: ..." field.
        without_link = re.sub(r"\[[^\]]*\]\(" + re.escape(source_url) + r"\)", "", line)
        without_link = without_link.replace(source_url, "").strip()
        field = re.sub(r"^[#\s]+|[:\s]+$", "", without_link).lower()
        if not field or field in {"url", "link", "tweet", "tweet url", "article url", "_no response_"}:
            continue
        if re.fullmatch(r"#{1,6}\s+(?:summary|notes?|personal note)", line, re.IGNORECASE):
            continue
        line = re.sub(r"^(?:summary|notes?|personal note):\s*", "", line, flags=re.IGNORECASE)
        lines.append(line)
    return " ".join(lines)


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
            "note": extract_note(body, raw),
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
