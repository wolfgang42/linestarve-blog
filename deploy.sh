#!/bin/bash
set -e

ENV=production node ./build.mjs
rsync -avz --delete public/blog/ www.linestarve.com:/srv/src/linestarve-blog-content/
