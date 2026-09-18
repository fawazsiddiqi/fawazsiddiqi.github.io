# fawazsiddiqi.dev

Personal site. Jekyll on GitHub Pages: no build pipeline, no npm, no Actions.
Push to the repo and GitHub builds it.

## Editing content

Each nav item is its own page: `/` (the hero), `/about/`, `/career/`, `/skills/`,
`/work/` and `/writing/`. Everything on them comes from these files; nothing is
hardcoded in the templates.

| What | File |
|---|---|
| Bio (the About page) | `pages/about.md` |
| Hero tagline | `pages/index.md` (`tagline:`) |
| Job history, newest first | `_data/timeline.yml` |
| Degrees | `_data/education.yml` |
| Leadership & community | `_data/highlights.yml` |
| Mentorships & hackathons | `_data/mentor.yml` |
| Skills, in groups (plain names, no levels) | `_data/skills.yml` |
| Certifications: name, issuer, optional year | `_data/certifications.yml` |
| GitHub repos shown under Work | `_data/github-projects.yml` |
| Social links, in order | `_data/social.yml` |
| Projects | `_projects/*.md` (front matter: `name`, `order`, `tools`, `description`, optional `redirect_to`) |
| Posts | `_posts/YYYY-MM-DD-title.md`. A post with `redirect_to:` points its card at Medium (and forwards `/blog/<slug>` there); a post with a body renders normally. |
| Title, description, domain | `_config.yml` |
| One page's text in search results | `description:` at the top of that page's file in `pages/` |

The current role in the hero chip is just the first entry of `_data/timeline.yml`,
so a promotion is a one-line edit.

Refresh stars, descriptions and years for the GitHub cards:

```bash
python3 tools/refresh-repos.py          # add GITHUB_TOKEN=... to avoid the 60/hour limit
```

Project cards link out only when the project has `redirect_to`. For per-project
pages instead, set `output: true` for the collection in `_config.yml` and give each
project `layout: page` plus a body.

## Adding content

`_templates/` has a ready-to-copy example for every section — a blog post, an
external article, a project, a job, a certification and the rest — each with the
fields explained and where it goes. Start from its README.

## Deploying to a new repo

1. Push this folder to the repo.
2. Settings → Pages → Build and deployment → **Deploy from a branch**, branch `main`, folder `/`.
3. Set `repository:` in `_config.yml` to `<user>/<repo>`.
4. Custom domain: keep `CNAME` and leave `baseurl: ""`. Without one, set
   `baseurl: "/<repo>"` and `url: "https://<user>.github.io"`.

Old URLs keep working: `/projects/` redirects to `/work/`, and `/blog/` and
`/blog/tags` redirect to `/writing/`.

## Previewing locally

With Docker (this is the same image GitHub Pages builds with):

```bash
docker run --rm -v "$PWD":/github/workspace \
  -e JEKYLL_ENV=production -e PAGES_REPO_NWO=fawazsiddiqi/fawazsiddiqi.github.io \
  --entrypoint /usr/local/bundle/bin/github-pages ghcr.io/actions/jekyll-build-pages:v1.0.13 \
  build --source /github/workspace --destination /github/workspace/_site
python3 -m http.server -d _site 4000
```

Or with Ruby: `bundle install && bundle exec jekyll serve`.

## How the design works

- `assets/css/site.css` — theme tokens, glass materials, layout. Both themes are
  defined in full at the top; everything else uses the tokens.
- `assets/js/site.js` — theme toggle, the mobile menu, pointer-tracked highlights,
  and the SVG displacement map that makes Chromium refract the backdrop behind the
  nav. Safari and Firefox get frosted glass instead, since only Chromium supports
  SVG filters inside `backdrop-filter`.
- Page transitions are CSS only (`@view-transition` in `site.css`): the nav holds
  still, the page cross-fades, and the active pill slides to the new nav item.
  Browsers without cross-document view transitions simply load the page.
- `assets/js/liquid.js` — the WebGL background. Colours come from the CSS tokens, so
  changing a `--pool-*` value changes the background too. Falls back to a CSS
  gradient when WebGL is unavailable, and renders one static frame for visitors who
  ask for reduced motion. It keeps one clock per visit, so it carries on across pages
  instead of restarting.

Accessibility: `prefers-reduced-motion` and `prefers-reduced-transparency` are both
honored, text keeps 4.5:1 contrast over the glass, and the site is keyboard navigable.
