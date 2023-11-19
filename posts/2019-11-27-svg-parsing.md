---
title: "Parsing an SVG path command"
tags: [SVG, Parsing]
canonical: https://github.com/twbs/icons/issues/70#issuecomment-563923849
---
<small>(Mirror of a [comment I wrote](https://github.com/twbs/icons/issues/70#issuecomment-563923849) on a GitHub issue, responding to someone who was wondering how to parse the SVG path command `a8 8 0 100-16 8 8 0 000 16`, which looks at first glance like mangled data.)</small>

This arc command is correct and standards-conformant SVG; see [SVG 1.1 §8.3.9](https://www.w3.org/TR/SVG11/paths.html#PathDataBNF) for an exhaustive grammar, but the gist of it is that you can condense a *lot*.

<!--more-->

Relevant for this particular case are the following rules:

* flags are always exactly one character (`0`/`1`)
* Whitespace can be left out wherever it's not absolutely necessary (including after flags and before negative numbers and leading decimal points)
* If a command letter is not given, it's the same as the previous command (except in the case of `M`/`m`, where it's `L`/`l` instead)

That is, the string `a8 8 0 100-16 8 8 0 000 16` should parse as **two** arc commands:

"a"|nonnegative-number|comma-wsp?|nonnegative-number|comma-wsp?|number|comma-wsp|flag|flag|coordinate-pair
---|---|---|---|---|---|---|---|---|---
`a`|`8`|` `|`8`|` `|`0`|` `|`1`|`0`|`0`&nbsp;`-16`|
&nbsp;|`8`|` `|`8`|` `|`0`|` `|`0`|`0`|`0`&nbsp;` `&nbsp;`16`

<style>
article table{display: block;
  width: 100%;
  width: max-content;
  max-width: 100%;
  overflow: auto}article table td,article table th{border: 1px solid lightgrey; padding: 0.25em}
  article table th{text-align: center}
  article table code{background: #eee; white-space: break-spaces}</style>

[svg/svgo#1137](https://github.com/svg/svgo/issues/1137) discusses this same problem, and offers some optimizations that can be turned off to work around the Illustrator bugs.
