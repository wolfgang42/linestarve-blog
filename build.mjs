import fs from 'node:fs/promises'
import MarkdownIt from 'markdown-it'
import MarkdownItHighlightjs from 'markdown-it-highlightjs'
import Yaml from 'yaml'
import pug from 'pug'

const markdown = MarkdownIt({
	html: true,
})
markdown.use(MarkdownItHighlightjs, {auto: false, code: false})

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
await fs.cp('./static/', './public/blog/', {recursive: true})
await fs.link('./theme/style.css', './public/blog/css/style.css')

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
	let mode = 'start', frontmatter_raw = '', body_truncated = '', body = ''
	for (const line of lines) {
		if (mode === 'start') {
			if (line !== '---') throw new Error('missing front matter start indicator')
			mode = 'frontmatter'
		} else if (mode === 'frontmatter') {
			if (line === '---') {
				mode = 'body'
			} else {
				frontmatter_raw += line+'\n'
			}
		} else if (mode === 'body') {
			if (line === '<!--more-->') {
				body += '\n'
				mode = 'body_truncated'
			} else {
				body += line+'\n'
				body_truncated += line+'\n'
			}
		} else if (mode === 'body_truncated') {
			body += line+'\n'
		} else {
			throw new Error("can't happen")
		}
	}
	if (mode !== 'body' && mode !== 'body_truncated') throw new Error('failed to enter body mode')
	
	const frontmatter = Yaml.parse(frontmatter_raw)
	if ((!frontmatter.short) !== (mode === 'body_truncated')) throw new Error('short flag does not match truncation')
	const render = RENDER_TYPE[post.filetype]
	
	return {
		...post,
		tags: [], // TODO default in case frontmatter does not define
		...frontmatter,
		htmlBody: render(body),
		htmlSummary: render(body_truncated),
	}
}

const postdir = './posts'
const posts = await Promise.all((await fs.readdir(postdir))
.map(async filename => {
	try {
		return parse_post(await read_post_entry(filename))
	} catch (e) {
		console.error(`error in ${filename}:`)
		throw e
	}
}))

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
