# jaeho.com

Personal website and blog. Built with Jekyll, hosted on GitHub Pages.

## Automatic Reading publishing

Instinct can publish to **Reading** by creating an issue in `jaehospotlight/jaeho`
using the `jaehospotlight` GitHub account. Use the issue title as the entry title,
put the tweet URL in the body, and optionally add a `Summary:` or `Note:` below it.
No label is required for X/Twitter links. For other articles, add the `reading`
label or start the issue title with `[Reading]`.

GitHub Actions imports the issues and publishes the site automatically after an
issue is created, edited, reopened, labeled, unlabeled, or deleted. It also runs
on pushes to `main` and can be run manually from the Actions tab. No running Mac,
Codex session, personal access token, or approval step is needed.

- Everything appears at `/reading/`, alongside the existing reading list.
- Only issues authored by `jaehospotlight` are imported; pull requests are ignored.
- Duplicate tweet links are consolidated, with the newest submission taking precedence.
- Edit the issue title/body to update an entry. Comments are not imported.
- Closing an issue keeps its entry. Add `reading-ignore` or delete the issue to remove it.
- Issues remain the source of truth. `_data/reading_submissions.json` is generated
  during builds and is not committed. Existing curated links stay in `_data/articles.yml`.
- If the import or build fails, the last successful website remains live. Check
  **Actions → Publish website and Reading** for the error and rerun after fixing it.

Suggested instruction for Instinct:

> Whenever I ask you to save a tweet or article to my website, create a GitHub
> issue in jaehospotlight/jaeho titled `[Reading] <short descriptive title>`.
> Put the original URL on its own line, followed by any summary and my note.
> If I change my note, edit the original issue body. GitHub publishes it automatically.

Pages uses **GitHub Actions** as its publishing source, via `.github/workflows/pages.yml`.

---

## Quick Start — Deploy to GitHub Pages

### 1. Create a GitHub repo

Go to [github.com/new](https://github.com/new) and create a new repository.

- Name it anything (e.g., `personal-site` or `jaeho.com`)
- Make it **public** (required for free GitHub Pages)

### 2. Push this code

```bash
cd site
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Under "Source", select **GitHub Actions**
3. Push to `main` or run **Publish website and Reading** from the Actions tab.

Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO/` within a minute or two.

---

## Connect Your Custom Domain

### 1. In GitHub

1. Go to repo → **Settings** → **Pages**
2. Under "Custom domain", enter your domain (e.g., `jaeho.com`)
3. Check **Enforce HTTPS**

### 2. With Your Domain Registrar

Add these DNS records:

**For apex domain (jaeho.com):**

| Type | Name | Value |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

**For www subdomain (optional):**

| Type | Name | Value |
|------|------|-------|
| CNAME | www | YOUR_USERNAME.github.io |

DNS can take up to 24 hours to propagate. HTTPS may take a bit longer after that.

### 3. Add a CNAME file

Create a file called `CNAME` in the root of your repo containing just your domain:

```
jaeho.com
```

---

## Writing Blog Posts

### Create a new post

1. Add a new file in the `_posts/` folder
2. Name it: `YYYY-MM-DD-your-post-title.md`
3. Add this at the top:

```yaml
---
layout: post
title: "Your Post Title"
subtitle: "Optional subtitle"
date: YYYY-MM-DD
---
```

4. Write your content in Markdown below the `---`
5. Commit and push — GitHub Pages auto-builds in ~1 minute

### Markdown cheatsheet

```markdown
**bold text**
*italic text*
[link text](https://url.com)

## Heading

> Blockquote

- Bullet point
1. Numbered list

![Alt text](image-url.jpg)
```

---

## Customizing

### Update your bio

Edit `index.html` — the hero section at the top contains your name, bio text, and social links.

### Update site title

Edit `_config.yml` — change the `title` and `description` fields.

### Change colors / fonts

Edit `assets/css/style.css` — all styles are in one file with clear section comments.

---

## File Structure

```
├── _config.yml          # Site settings
├── _layouts/
│   ├── default.html     # Base layout (nav + footer)
│   └── post.html        # Blog post layout
├── _posts/              # Your blog posts (Markdown)
│   └── 2026-03-07-example.md
├── assets/
│   └── css/
│       └── style.css    # All styles
├── blog/
│   └── index.html       # Blog listing page
├── index.html           # Home page
├── CNAME                # Custom domain (add after setup)
└── README.md
```
