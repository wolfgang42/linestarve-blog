#!/bin/bash
set -e

curl --silent https://search.feep.dev/blog/index.rss > posts/feep-blog.rss

ENV=production node ./build.mjs
rsync -avz --delete public/blog/ www.linestarve.com:/srv/src/linestarve-blog-content/
