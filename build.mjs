import fs from 'node:fs/promises'
import RssParser from 'rss-parser'
import MarkdownIt from 'markdown-it'
import MarkdownItHighlightjs from 'markdown-it-highlightjs'
import Yaml from 'yaml'
import pug from 'pug'

const markdown = MarkdownIt({
	html: true,
})
markdown.use(MarkdownItHighlightjs, {auto: false, code: false, inline: true})

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {dateStyle: 'long'})
const urlize = str => str.replaceAll(/ /g, '-').replaceAll(/[:'<>]/g, '')
const RENDER_TYPE = {
	html: text => text,
	md: text => markdown.render(text),
}

await fs.rm('./public', {force: true, recursive: true})
await fs.mkdir('./public')
await fs.mkdir('./public/blog')
await fs.mkdir('./public/blog/post')
await fs.mkdir('./public/blog/css')
await fs.link('./theme/style.css', './public/blog/css/style.css')
await fs.link('./redirects.conf', './public/blog/redirects.conf')

async function read_post_entry(filename) {
	const filematch = filename.match(/^(?<date>[0-9]{4}-[0-9]{2}-[0-9]{2})-(?<slug>[^.]+)(?:\.(?<ext>html|md))?$/)
	if (!filematch) throw new Error('failed to match on post name')
	const {date, slug, ext} = filematch.groups
	
	let postfile = `${postdir}/${filename}`
	let assets = []
	if (ext === undefined) {
		let found = false
		for (const subfile of await fs.readdir(postfile)) {
			if (subfile === `${date}-${slug}.md` || subfile === `${date}-${slug}.html`) {
				if (found) throw new Error('Found multiple post files')
				postfile += '/'+subfile
				found = true
			} else {
				assets.push({path: `${postdir}/${filename}/${subfile}`, filename: subfile})
			}
		}
		if (!found) throw new Error('Failed to find post file')
	}
	const filetype = postfile.split('.').at(-1)
	if (!(filetype in RENDER_TYPE)) throw new Error('unknown file type')
	
	return {date, slug, filetype, filename: postfile, assets}
}

async function parse_post(post) {
	const lines = (await fs.readFile(post.filename, 'utf-8')).split('\n')
	if (lines.shift() !== '---') throw new Error('missing front matter start indicator')
	
	let line
	let frontmatter_raw = ''
	while ((line = lines.shift()) !== undefined) {
		if (line === '---') break
		frontmatter_raw += line+'\n'
	}
	
	let body_truncated = '', body = '', after_break = false
	for (const line of lines) {
		if (line === '<!--more-->') {
			if (after_break) throw new Error('multiple breaks in post')
			after_break = true
			body += '\n'
		} else {
			body += line+'\n'
			if (!after_break) body_truncated += line+'\n'
		}
	}
	
	const frontmatter = {
		...Yaml.parse(frontmatter_raw),
		short: !after_break,
	}
	const render = RENDER_TYPE[post.filetype]
	
	return {
		...post,
		link: `/blog/post/${post.slug}/`,
		tags: [], // TODO default in case frontmatter does not define
		...frontmatter,
		htmlBody: render(body),
		htmlSummary: render(body_truncated),
	}
}

const postdir = './posts'
const posts = await Promise.all((await fs.readdir(postdir))
.filter(filename => filename !== 'feep-blog.rss')
.map(async filename => {
	try {
		return parse_post(await read_post_entry(filename))
	} catch (e) {
		console.error(`error in ${filename}:`)
		throw e
	}
}))

const feep_posts = await new RssParser().parseString(await fs.readFile('posts/feep-blog.rss', 'utf-8'))
for (const item of feep_posts.items) {
	posts.push({
		title: item.title,
		syndicated: 'search.feep.dev',
		date: item.isoDate.split('T')[0],
		link: new URL(item.link, 'https://search.feep.dev/blog/index.rss').toString(),
		tags: [], // TODO
		assets: [],
	})
}

posts.sort((a, b) => a.date > b.date ? -1 : 1)
const posts_by_tag = {}
for (const post of posts) {
	for (const tag of post.tags) {
		(posts_by_tag[tag] ||= []).push(post)
	}
}

const templateGlobals = {
	ENV: process.env.ENV,
	asset: f => `/blog/${f}`,
	urlize,
	formatDate: d => DATE_FORMATTER.format(new Date(d+'T00:00:00')),
}

const renderPost = pug.compileFile(`./theme/post.pug`)
for (const post of posts) {
	if (post.syndicated) continue
	const html = renderPost({
		post,
		...templateGlobals,
	})
	
	await fs.mkdir(`public/blog/post/${post.slug}`, {recursive: true}) // NOTE: recursive only to suppress EEXIST
	await fs.writeFile(`public/blog/post/${post.slug}/index.html`, html)
	for (const asset of post.assets) {
		await fs.cp(asset.path, `public/blog/post/${post.slug}/${asset.filename}`, {recursive: true, preserveTimestamps: true})
	}
}

const renderTag = pug.compileFile(`./theme/tag.pug`)
for (const [tag, posts] of Object.entries(posts_by_tag)) {
	const html = renderTag({
		tag,
		posts,
		...templateGlobals,
	})
	await fs.mkdir(`public/blog/tags/${urlize(tag)}`, {recursive: true}) // NOTE: recursive only to suppress EEXIST
	await fs.writeFile(`public/blog/tags/${urlize(tag)}/index.html`, html)
}

await fs.writeFile(`public/blog/index.html`, pug.renderFile(`./theme/index.pug`, {
	posts,
	...templateGlobals,
}))
await fs.writeFile(`public/blog/index.xml`, pug.renderFile(`./theme/index.xml.pug`, {
	posts,
	...templateGlobals,
}))
await fs.writeFile(`public/blog/tags/index.html`, pug.renderFile(`./theme/tags.pug`, {
	posts,
	posts_by_tag,
	...templateGlobals,
}))
await fs.writeFile(`public/blog/sitemap.xml`, pug.renderFile(`./theme/sitemap.xml.pug`, {
	posts,
	posts_by_tag,
	...templateGlobals,
}))
await fs.writeFile(`public/blog/summary.html`, pug.renderFile(`./theme/index-summary.pug`, {
	posts,
	...templateGlobals,
}))
