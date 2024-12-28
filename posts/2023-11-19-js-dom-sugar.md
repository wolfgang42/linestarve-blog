---
title: "A bit of DOM sugar"
tags: [JavaScript, DOM]
---
I’ve been carrying this snippet around in my head for years, embedding it in projects where I just need a tiny bit of JS:

```javascript
function $e(t,p,c) {
	const e=document.createElement(t)
	Object.assign(e,p)
	e.append(...c)
	return e
}
```

Usage:

```javascript
const button = $e('button', {onclick: () => alert('click!')}, [
	$e('img', {src: '/assets/icon-lightbulb.png'}, []),
	'Ding!',
])
```

Judging from the comments when I’ve posted this, it seems to have been independently invented by a lot of different people, frequently down to calling it `$e`. It also matches the signature of `jsxFactory`, so can be used with a React-compatible transpiler; for example TypeScript can be configured with `{"jsxFactory": "$e"}`{.json}.

(Discussed [here](https://news.ycombinator.com/item?id=23589704) and [here](https://news.ycombinator.com/item?id=34831126).)
