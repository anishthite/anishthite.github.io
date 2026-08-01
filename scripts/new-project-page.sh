#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: scripts/new-project-page.sh <slug-or-file.html> <Project title>" >&2
  echo "Example: scripts/new-project-page.sh cafe-map \"Cafe Map\"" >&2
  exit 1
fi

slug="$1"
shift
title="$*"

if [[ "$slug" != *.html ]]; then
  slug="${slug}.html"
fi

if [[ ! "$slug" =~ ^[a-zA-Z0-9._-]+\.html$ ]]; then
  echo "Use a root-level html filename with letters, numbers, dots, underscores, or hyphens." >&2
  exit 1
fi

if [ -e "$slug" ]; then
  echo "$slug already exists." >&2
  exit 1
fi

cp _project-template.html "$slug"
PROJECT_TITLE="$title" perl -0pi -e 's/Project title/$ENV{PROJECT_TITLE}/g' "$slug"

echo "Created $slug"
echo "Next: edit $slug, then add a matching entry in js/projects-data.js with url: \"$slug\"."
