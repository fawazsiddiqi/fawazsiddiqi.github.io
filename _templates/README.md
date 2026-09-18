# Templates

Copy-and-edit examples for every section of the site. This folder is not published
(Jekyll skips folders that start with `_`), so nothing here shows up online.

| I want to… | Template | Where it goes |
|---|---|---|
| Write a blog post hosted on the site | `post.md` | new file in `_posts/`, named `YYYY-MM-DD-title.md` |
| List an article published elsewhere (Medium…) | `post-external.md` | new file in `_posts/` |
| Add a project card | `project.md` | new file in `_projects/` |
| Add a job | `data/timeline.yml` | top of `_data/timeline.yml` |
| Add a degree | `data/education.yml` | `_data/education.yml` |
| Add leadership / community work | `data/highlights.yml` | `_data/highlights.yml` |
| Add a mentorship or hackathon | `data/mentor.yml` | `_data/mentor.yml` |
| Add a skill or a skill group | `data/skills.yml` | `_data/skills.yml` |
| Add a certification | `data/certifications.yml` | `_data/certifications.yml` |
| Change the About page highlights | `data/about-highlights.yml` | `_data/about-highlights.yml` |
| Add a GitHub repo card | `data/github-projects.yml` | `_data/github-projects.yml` |
| Add or reorder a social link | `data/social.yml` | `_data/social.yml` |

Your bio is plain Markdown in `pages/about.md`, and the tagline under your name is
`tagline:` in `pages/index.md`.

YAML tips: indent with spaces (never tabs), keep the `- ` at the start of each entry,
and put quotes around text that contains a colon (`"Microsoft Certified: Azure Fundamentals"`).
