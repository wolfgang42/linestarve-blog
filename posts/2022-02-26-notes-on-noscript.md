---
title: "Notes on <noscript>"
tags: [HTML5]
canonical: https://news.ycombinator.com/item?id=30474411
---
My experience has been that <code>&lt;noscript&gt;</code> is too unreliable to be usable: the problem is that a lot of users browsing “with JavaScript turned off” are actually browsing with it turned *on* but not executing (some arbitrary subset of!) the <code>&lt;script&gt;</code> tags on the page.

The way to achieve the same effect without this problem is to include the nojs content unconditionally, and then have your script delete it from the DOM somewhere far enough through execution that you're confident that your script and its dependencies are all running properly. Otherwise you end up in situations where the JS is broken because something is being blocked, but it's working just well enough that the browser isn't showing the nice message you wrote explaining what the problem is.

<small>(This post is a mirror of a [Hacker News comment I wrote](https://news.ycombinator.com/item?id=30474411).)</small>
