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

await fs.rm('./public', {force: true, recursive: true})
await fs.mkdir('./public')
await fs.mkdir('./public/blog')
await fs.mkdir('./public/blog/post')
await fs.cp('./themes/startbootstrap-clean-blog/static/', './public/blog/', {recursive: true})
await fs.cp('./static/', './public/blog/', {recursive: true})

const postdir = './content/posts'
const posts = await Promise.all((await fs.readdir(postdir))
.filter(filename => ['.markdown', '.md', '.html'].some(ext => filename.endsWith(ext)))
.map(async filename => {
	try {
		const lines = (await fs.readFile(`${postdir}/${filename}`, 'utf-8')).split('\n')
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
		if (!filename.startsWith(frontmatter.date+'-')) throw new Error('filename does not match date')
		const post = {
			slug: urlize(frontmatter.title), // default if frontmatter doesn't specify
			tags: [], // TODO ditto default
			...frontmatter,
			filename,
			htmlBody: filename.endsWith('.html') ? body : markdown.render(body),
			htmlSummary: filename.endsWith('.html') ? body_truncated : markdown.render(body_truncated),
		}
		
		return post
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

for (const post of posts) {
	const html = pug.renderFile(`./theme/post.pug`, {
		post,
		...templateGlobals,
	})
	
	await fs.mkdir(`public/blog/post/${post.slug}`, {recursive: true}) // NOTE: recursive only to suppress EEXIST
	await fs.writeFile(`public/blog/post/${post.slug}/index.html`, html)
}

for (const [tag, posts] of Object.entries(posts_by_tag)) {
	const html = pug.renderFile(`./theme/tag.pug`, {
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
