#!/bin/bash
set -e

rm -rf public/
HUGO_ENV=production hugo
rsync -avz --delete public/ www.linestarve.com:/srv/src/linestarve-blog-content/
