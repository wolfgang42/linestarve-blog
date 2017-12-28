---
title: "Calculating the mode of a list in TI-BASIC"
date: 2013-09-28
tags: ["TI-BASIC", "Algorithm", "Statistics"]
slug: tibasic-stat-lmode
---
<img src="/blog/post/tibasic-stat-lmode/LMODE.png" alt="" align="right"/>
Recently, someone challenged me to write a program to find the mode (or
modes) of a list in TI-BASIC. I picked up my TI-83+ and whipped this program up
in about half an hour. Somebody else asked me for a copy, so I figured I'd post
it on my website.
<!--more-->

## How it works
The program operates in two passes. For the first pass, it finds how many times
the most frequent number appears. This is facilitated by grouping the numbers
by sorting them, so only one number needs to be counted at a time.

Once it has found the number of times the numbers of the mode appears, it passes
through the list a second time and moves all of the numbers of the mode into an
output list.

## Variables used
<table class="table table-condensed">
	<tr><td><code><sub>L</sub>ZMODE</code></td>
	<td>Input list. Will be sorted in ascending order.</td></tr>
	<tr><td><code><sub>L</sub>MODE</code></td>
	<td>Output list. Contains the modes of <code><sub>L</sub>ZMODE</code>.</td></tr>
	<tr><td><code>I</code></td>
	<td>Generic counter variable, used in <code>For</code> loops.</td></tr>
	<tr><td><code>C</code></td>
	<td>(for <strong>C</strong>ount) How many times the current number (stored
	in <code>N</code>) has appeared so far.</td></tr>
	<tr><td><code>N</code></td>
	<td>The current number being counted.</td></tr>
	<tr><td><code>M</code></td>
	<td>(For <strong>M</strong>ax) How large the largest C has been so far.</td></tr>
	<tr><td><code>D</code></td>
	<td>(For <strong>D</strong>im) For pass 2, the current position in <code><sub>L</sub>MODE</code>.</td></tr>
</table>

## The Program
Download: [LMODE.8Xp](./LMODE.8Xp)

<pre>Prompt <sub>L</sub>ZMODE
SortA(<sub>L</sub>ZMODE
0→C:0→M:<sub>L</sub>ZMODE(1)→N
For(I,1,dim(<sub>L</sub>ZMODE
If <sub>L</sub>ZMODE(I)=N:Then
C+1→C
Else
If C&gt;M:C→M
1→C
<sub>L</sub>ZMODE(I)→N
End:End
If C&gt;M:C→M
"PASS 2
If M=1:Then
Disp "NO MODE"
Return:End
0→C:<sub>L</sub>ZMODE(1)→N:1→D:{0}→<sub>L</sub>MODE
For(I,1,dim(<sub>L</sub>ZMODE
If <sub>L</sub>ZMODE(I)=N:Then
C+1→C
Else
If C=M:Then
N→<sub>L</sub>MODE(D):D+1→D:End
<sub>L</sub>ZMODE(I)→N
1→C
End:End
If C=M:N→<sub>L</sub>MODE(D
"RETURN":<sub>L</sub>MODE</pre>

> Update December 2015: The original version of this program had a bug: if the largest number in the list was a mode of that list, it would not be included in the output.
For example, if the list was `{4, 3, 4}` the program would output `NO MODE` instead of `{4}`.
>
> I discovered this problem right after I wrote this post, and simply worked around it thereafter.
> However it's been bugging me ever since and I finally sat down and fixed it.
