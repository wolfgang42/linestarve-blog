'use strict';
const hexo_util = require('hexo-util')
const sha1 = require('sha1')
const fs = require('fs')
const startsWith = require('starts-with')
const proc = require('child_process')
const glob = require('glob')
const path = require('path')

const
	STATE_NORMAL = 0,
	STATE_TIKZ = 1,
	STATE_CODE = 2

let state = STATE_NORMAL

const code = fs.createWriteStream('buildshape.py')
const post = fs.createWriteStream('./2016-11-09-python-3d-rendering.md')

let tikz_current_block
let code_current_block = ""
let codeblock_hidden
let codeblock_first_line
let code_current_line = 1
let code_prev_blank = true

function exportTikz(tikz_code) {
	const file = 'figure/'+sha1(tikz_code)
	// Generate the picture asynchronously,
	// since there isn't anything else in this generator that needs the actual file.
	fs.stat(file+'-1.png', (err, stats) => {
		if (err && err.code != 'ENOENT') throw err;
		if (err && err.code == 'ENOENT') {
			console.log('Building '+file)
			fs.writeFile(file+'.tex',
				"\\documentclass[crop,tikz]{standalone}\n"+
				"\\renewcommand{\\familydefault}{\\sfdefault}\n"+
				"\\usepackage{pgfplots}\n"+
				"\\usepgfplotslibrary{groupplots}\n"+
				"\\usepgfplotslibrary{patchplots}\n"+
				"\\usetikzlibrary{arrows,positioning,pgfplots.polar,matrix}\n"+
				"\\pgfplotsset{\n"+
				"  compat=newest,\n"+
				"  y axis style/.style={yticklabel style=#1, ylabel style=#1, y axis line style=#1, ytick style=#1},\n"+
				"  legend style={draw=none, legend pos=outer north east, font=\\small }\n"+
				"}\n"+
				"\\begin{document}\n"+
				tikz_code+
				"\\end{document}\n",
				(err) => {
					if (err) throw err;
					const tex = proc.spawn('pdflatex', [sha1(tikz_code)+'.tex'], {cwd: 'figure/'});
					let alive = true;
					
					tex.stdout.on('data', function (data) {
						const ds = data.toString();
						
						if (ds[ds.length - 2] === '?') {
							alive = false;
							console.warn(ds);
							tex.stdin.write('x\n');
						}
					});
					
					tex.stderr.on('data', function (data) {
						console.warn(data.toString());
					});
					
					tex.on('exit', function (code) {
						if (!alive) return
						
						const original = file+'.pdf'
						const temporaries = file+'.*'
						
						glob(temporaries, function (err, files) {
							if (err) {
								return self.emit('error', err);
							}
							
							files.forEach(function (file) {
								if (path.normalize(file) !== path.normalize(original)) {
									fs.unlinkSync(file);
								}
							});
							proc.spawn('pdftocairo', ['-svg', file+'.pdf', file+'.svg'])
							//proc.spawn('inkscape', ['--export-area-page', '--export-plain-svg='+file+'.svg', file+'.pdf'])
							proc.spawn('pdftocairo', ['-png', '-r', '96', file+'.pdf', file])
							proc.spawn('pdftocairo', ['-png', '-r', '192', file+'.pdf', file+'-2x'])
							proc.spawn('pdftocairo', ['-png', '-r', '288', file+'.pdf', file+'-3x'])
						});
					});
			})
		}
	})
	return file
}

function writeCode(content) {
	if (content === '\n') {
		if (code_prev_blank === true) return // Don't print multiple blank lines
		code_prev_blank = true
	} else {
		code_prev_blank = false
	}
	code.write(content)
	code_current_line++
}

writeCode('#!/usr/bin/env python\n')
writeCode('# This post was written as literate Python.\n')

fs.readFileSync('python-3d-rendering.md.literate', {encoding: 'utf8'}).split('\n').forEach(function(line) {
	line = line + '\n'
	if (STATE_NORMAL == state) {
		if (startsWith(line, '```python')) {
			codeblock_first_line = code_current_line
			codeblock_hidden = startsWith(line, '```python hidden')
			state = STATE_CODE
		} else if (startsWith(line, '\\begin{tikzpicture}')) {
			tikz_current_block = line
			state = STATE_TIKZ
		} else if (startsWith(line, '%%LITERATE')) {
			post.write("<div class='well'>This post was written in literate Python. Download <a href=\"/blog/post/python-3d-rendering/buildshape.py\">buildshape.py</a> and run it yourself!</div>\n\n")
			post.write("<!-- XXX WARNING XXX: This post (and its ancillary files) was auto-generated from a source file! See the README in the post's directory for information before editing this file. -->")
		} else {
			if (line == '\n') {
				writeCode('\n')
			} else if (line != '<!-- more -->\n') {
				writeCode('# '+line)
			}
			post.write(line)
		}
	} else if (STATE_CODE == state) {
		if (startsWith(line, '```')) {
			if (!codeblock_hidden) {
				post.write('\n'+
					hexo_util.highlight(code_current_block.trim(), {
						firstLine: codeblock_first_line,
						lang: 'python',
						hljs: true,
					}) +
					'\n'
				)
			}
			code_current_block = ''
			state = STATE_NORMAL
		} else {
			writeCode(line)
			code_current_block += line
		}
	} else if (STATE_TIKZ == state) {
		tikz_current_block += line
		if (startsWith(line, '\\end{tikzpicture}')) {
			const file = exportTikz(tikz_current_block)
			// I'd love to use SVG, but the images come out *extremely* blurry on both Chrome and Firefox.
			// pdftocairo does an excellent job of rendering sharp PNGs, though, so that's what we'll use.
			post.write('\n<figure style="float:right;margin:30px 0"><img src="/blog/post/python-3d-rendering/'+file+'-1.png" alt="" srcset="/blog/post/python-3d-rendering/'+file+'-2x-1.png 2x, /blog/post/python-3d-rendering/'+file+'-3x-1.png 3x"/></figure>\n')
			
			state = STATE_NORMAL
		}
	} else {
		throw new Error("Invalid state: "+state)
	}
})
