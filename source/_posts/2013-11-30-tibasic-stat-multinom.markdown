---
layout: post
title: "Multinomial Probability Mass Function in TI-BASIC"
date: 2013-11-30 18:40
tags: ["TI-BASIC", "Algorithm", "Statistics"]
---

Another TI-BASIC challenge proposed to me by the same person who asked me
[last time](/post/tibasic-stat-lmode) was to calculate the
[probability mass function of a multinomial distribution](http://en.wikipedia.org/wiki/Multinomial_distribution#Probability_mass_function). The formula is:
{% math %}
\frac{n!}{x_1 \cdots x_k} p_1^{x_1}\cdots p_k^{x_k}
\mbox{ where }
n = \sum_{i=1}^k x_i
{% endmath %}
The naïve way of calculating this is to read
$x\_1$ and $p\_1$ through $x\_k$ and $p\_k$ and then crunch the numbers.
However, this necessitates a list to keep track of all the numbers and
an extra loop at the end to crunch them. Since we don't actually need
the numbers, there's an easier way.
<!-- more -->

## How it works
This formula can be broken down into three basic parts:

<div>$$\begin{align}
numerator &= n! \\\\
denominator &= x_1 \cdots x_k \\\\
multiplier &= p_1^{x_1}\cdots p_k^{x_k}
\end{align}$$</div>

For each $i$, $x\_i$ and $p\_i$ are read, and the new values of $numerator$
and $denominator$ are calculated. Once this is done, $x\_i$ and $p\_i$ are no longer needed.
Finally, once all of the numbers have been read in, the final answer is just
<div>$$\frac{n!}{denominator}multiplier$$</div>

This program also does some sanity checking to make sure that
$\sum\_{i=1}^k p\_i = 1$ and $\sum\_{i=1}^k x\_i = n$.

## Variables used
<table>
	<tr><td>N</td><td>$n$</td></tr>
	<tr><td>D</td><td>$denominator$ ($x_1 \cdots x_k$)</td></tr>
	<tr><td>M</td><td>$multiplier$ ($p_1^{x_1}\cdots p_k^{x_k}$)</td></tr>
	<tr><td>P</td><td>$p\_i$</td></tr>
	<tr><td>O</td><td>$\sum_{i=1}^k p_i$</td></tr>
	<tr><td>X</td><td>$x\_i$</td></tr>
	<tr><td>W</td><td>$\sum_{i=1}^k x_i$</td></tr>
</table>

## The Program
Download: {% asset_link MULTINOM.8Xp %} 

	Prompt N
	1→D:1→M:0→O:0→W:1→X
	While X≠0
	Prompt X
	If X≠0:Then
	Prompt P
	X+W→W:P+O→O
	D*(X!)→D
	M*(P^X)→M
	End:End
	If O≠1:Then
	Disp "E: sum(P)≠1
	Stop:End
	If W≠N:Then
	Disp "E: sum(X)≠N
	Stop:End
	((N!)/D)*M