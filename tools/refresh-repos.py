#!/usr/bin/env python3
"""Refresh _data/github-projects.yml from the GitHub API, keeping the order in that file.

    python3 tools/refresh-repos.py

Unauthenticated calls are limited to 60/hour. To use a token:
    GITHUB_TOKEN=ghp_xxx python3 tools/refresh-repos.py
"""
import json, os, re, subprocess, sys, pathlib

DATA = pathlib.Path(__file__).resolve().parent.parent / "_data" / "github-projects.yml"
OWNER = "fawazsiddiqi"

# names may be quoted or not, so a bare `- name: my-repo` line is enough to add a repo
order = re.findall(r'^- name:\s*"?([^"\n]+?)"?\s*$', DATA.read_text(), re.M)
if not order:
    sys.exit(f"no repos listed in {DATA}")

cmd = ["curl", "-sS", f"https://api.github.com/users/{OWNER}/repos?per_page=100&type=owner"]
if os.environ.get("GITHUB_TOKEN"):
    cmd += ["-H", f"Authorization: Bearer {os.environ['GITHUB_TOKEN']}"]
payload = json.loads(subprocess.run(cmd, capture_output=True, text=True).stdout)
if isinstance(payload, dict):
    sys.exit("GitHub API error: " + payload.get("message", str(payload)))

by = {r["name"]: r for r in payload}
missing = [n for n in order if n not in by]
if missing:
    sys.exit("not found on GitHub (renamed or private?): " + ", ".join(missing))

def q(s):
    return '"' + (s or "").replace("\\", "\\\\").replace('"', '\\"').strip() + '"'

out = ["# Repos shown in the Work section, in the order listed here.",
       "# Refresh stars / descriptions / years:  python3 tools/refresh-repos.py  (see README)", ""]
for n in order:
    r = by[n]
    out += [f"- name: {q(r['name'])}",
            f"  url: {q(r['html_url'])}",
            f"  description: {q(r['description'])}",
            f"  language: {q(r['language'] or '')}",
            f"  stars: {r['stargazers_count']}",
            f"  year: {q(r['pushed_at'][:4])}",
            f"  fork: {'true' if r['fork'] else 'false'}", ""]
DATA.write_text("\n".join(out))
print(f"updated {len(order)} repos in {DATA}")
