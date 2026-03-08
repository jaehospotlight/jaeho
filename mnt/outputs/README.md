# jaeho.com

Personal website and blog. Built with Jekyll, hosted on GitHub Pages.

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
2. Under "Source", select **Deploy from a branch**
3. Choose **main** branch, root folder (`/`)
4. Click **Save**

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
