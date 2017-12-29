#!/bin/bash
set -e

HUGO_ENV=production hugo
rsync -avz --delete public/ www.linestarve.com:/srv/src/linestarve-blog-content/
