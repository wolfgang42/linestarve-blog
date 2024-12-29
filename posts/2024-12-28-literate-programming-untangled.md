---
title: "Literate programming, unTANGLEd"
slug: literate-programming-untangled
date: 2024-12-28
tags: [Programming, Literate programming]
---
When the topic of literate programming comes up, there’s a tendency to bemoan a lost art. A lot of people complain that, while [Knuth’s WEB system](https://en.wikipedia.org/wiki/Web_(programming_system)) allowed the user to write their code in whatever order made sense for the narrative, modern so-called “literate programming” tools more or less just extract all the code blocks from a markdown file, constraining the presentation format to whatever order the computer demands. What this analysis misses, I think, is that this is much less of a constraint with modern programming languages.
<!--more-->

## A tangled web—but why?

Most notably, Knuth was using Pascal, which has a very rigid structure for how it expects a program to be laid out:

```pascal
program ProgramName (FileList);
const (* Constants *)
type (* Type declarations *)
var (* Variables *)

function FunctionName;
	const (* Constants *)
	var (* Variables *)
	begin (* Function body *) end;

begin (* Main program *) end.
```

In addition to these syntactical limitations, Pascal also uses a single-pass parser. This was great for optimization on the low-powered computers of the day, but means that you can’t easily call a function before it’s defined, since at that point in the program the compiler doesn’t know about it yet. A large part of the value for WEB was circumventing these limitations: in the text, elements could be introduced as they were needed for the *reader’s* understanding, rather than for the *compiler’s;* a tool called TANGLE was used to rearrange the code into a form that the compiler would accept.

<style>blockquote{font-style: inherit}blockquote small {display: inline} blockquote small:before {content: none}</style>

For a concrete example, let’s take §8 of [Knuth’s Programming Pearls column](https://homepages.cwi.nl/~storm/teaching/reader/BentleyEtAl86.pdf) (of “Knuth v McIlroy” fame), “Strategic considerations,” which discusses the overall layout of the program:

> Therefore it makes sense to structure our program as follows:
>
> <div>⟨The main program <small>8</small>⟩ ≡</div><div style="padding-left: 2em">
>   <em>initialize;</em><br>
>   ⟨Establish the value of <em>max_words_to_print</em> <small>10</small>⟩;<br>
>   ⟨Input the text, maintaining a dictionary with frequency counts <small>34</small>⟩;<br>
>   ⟨Sort the dictionary by frequency <small>39</small>⟩;<br>
>   ⟨Output the results <small>41</small>⟩</div>
>
> <p style="margin-top: 0.5em"><small>This code is used in section 3.</small></p>

Each of the items in brackets references the number of another section, which will be inlined. Section <small>8</small>, in turn, is inlined into section <small>3</small>, which gives the standard outline for a Pascal program and places this code between `begin` and `end` keywords to form the main body of the program.

But this sort of textual inlining is unheard of in modern programs! It results in quite a large function body, with variables shared across different sections. For example, `max_words_to_print` is set in §10, and then used in §41; this works because they have been inlined into the same function, but is not obvious unless you consult the index to find how this variable is used. Nowadays, the accepted practice is to favor short functions that only do one thing; so we might write this section as:

```python
def main():
	initialize()
	max_words_to_print = read_int() or default_k
	word_counts = read_text()
	sorted_words = sort_by_frequency(word_counts)
	output_results(sorted_words, max_words_to_print)
```

In a modern language, this function is perfectly acceptable even if `output_results()` hasn’t been defined yet; the computer, like the reader, can keep it in mind and expect to find out exactly what it does later. For the most part the programmer already has the freedom to order their code blocks however they want, and doesn’t need a separate tool to make this possible. As McIlroy notes in his review of Knuth’s program:

> Perhaps the greatest strength of WEB is that it allows almost any sensible order of presentation. Even if you did not intend to include any documentation, and even if you had an ordinary cross-referencer at your disposal, it would make sense to program in WEB simply to circumvent the unnatural order forced by the syntax of Pascal.

## Weave your own way

Since we can now achieve better-structured programs without WEB, modern literate programming as a separate practice is left with writing particularly extensive and well-formatted comments. This doesn't make it any less useful; if anything, it means that it can be applied anywhere, without any special tools. Use it in a corner of your codebase, a single file, even just one function: if they help the reader, comments are useful no matter what you call them.

If it turns out that plain text isn't enough to express your thoughts, you may still be able to start with simple tools. For example, if you write your program as Markdown with code blocks, this brief script is all you need to extract those blocks into executable code:

```python
import sys
code = False
for line in sys.stdin.read().splitlines():
    if line == '```': code = False # End block
    if code: print(line) # Only output block contents
    if line == '```python': code = True # Start block
```

Alternately you can write the program with the “literate” parts as standard comments, and then postprocess it into a format that’s nicer for reading. This is what I did for a past post about [converting formulas to 3D-printable shapes](/blog/post/python-3d-rendering/); for that post, [the Python code](/blog/post/python-3d-rendering/buildshape.py) contains all of the markup, illustrations, and so on, and the blog post is actually generated by a script from that file. This has the advantage that the code is also the source of truth, which is convenient if you want to avoid introducing more steps into your build system.

While Knuth’s WEB system may no longer be as necessary as it once was, using comments and presentation for improved clarity is still useful. Modern improvements mean we can benefit from these techniques without being constrained by the need for specialized tools. I hope this post has shown that they needn’t be restricted only to specific programs or entire systems; literate programming can be a tool in your toolbox, pulled out and applied wherever it improves your code.
