---
title: "Multinomial Probability Mass Function in TI-BASIC"
date: 2013-11-30
tags: ["TI-BASIC", "Algorithm", "Statistics"]
slug: tibasic-stat-multinom
---
<img src="/blog/post/tibasic-stat-multinom/MULTINOM.png" alt="" align="right"/>
Another TI-BASIC challenge proposed to me by the same person who asked me
[last time](/blog/post/tibasic-stat-lmode/) was to calculate the
[probability mass function of a multinomial distribution](http://en.wikipedia.org/wiki/Multinomial_distribution#Probability_mass_function). The formula is:
<div>$$\frac{n!}{x_1 \cdots x_k} p_1^{x_1}\cdots p_k^{x\_k}
    \mbox{ where }
    n = \sum\_{i=1}^k x_i$$</div>
The naïve way of calculating this is to read
$x\_1$ and $p\_1$ through $x\_k$ and $p\_k$ and then crunch the numbers.
However, this necessitates a list to keep track of all the numbers and
an extra loop at the end to crunch them. Since we don't actually need
the numbers, there's an easier way.
<!--more-->

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
<table class="table table-condensed">
	<tr><td><code>N</code></td><td>$n$</td></tr>
	<tr><td><code>D</code></td><td>$denominator$ ($x_1 \cdots x_k$)</td></tr>
	<tr><td><code>M</code></td><td>$multiplier$ ($p_1^{x_1}\cdots p_k^{x_k}$)</td></tr>
	<tr><td><code>P</code></td><td>$p\_i$</td></tr>
	<tr><td><code>O</code></td><td>$\sum_{i=1}^k p_i$</td></tr>
	<tr><td><code>X</code></td><td>$x\_i$</td></tr>
	<tr><td><code>W</code></td><td>$\sum_{i=1}^k x_i$</td></tr>
</table>

## The Program
Download: [MULTINOM.8Xp](./MULTINOM.8Xp) 

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

## Example
> In a recent three-way election for a large country, candidate A received 20% of the votes, candidate B received 30% of the votes, and candidate C received 50% of the votes. If six voters are selected randomly, what is the probability that there will be exactly one supporter for candidate A, two supporters for candidate B and three supporters for candidate C in the sample?
> (<a href="https://en.wikipedia.org/wiki/Multinomial_distribution#Example">source</a>)

To find the solution using `prgmMULTINOM`:
<table class="table table-compact">
	<tr><td><code>N=?<kbd>6</kbd>  </td><td> Number of supporters (1+2+3)</td></tr>
	<tr><td><code>X=?<kbd>1</kbd>  </td><td> Supporters for candidate A</td></tr>
	<tr><td><code>P=?<kbd>.2</kbd> </td><td> Votes for candidate A</td></tr>
	<tr><td><code>X=?<kbd>2</kbd>  </td><td> Supporters for candidate B</td></tr>
	<tr><td><code>P=?<kbd>.3</kbd> </td><td> Votes for candidate B</td></tr>
	<tr><td><code>X=?<kbd>3</kbd>  </td><td> Supporters for candidate C</td></tr>
	<tr><td><code>P=?<kbd>.5</kbd> </td><td> Votes for candidate C</td></tr>
	<tr><td><code>X=?<kbd>0</kbd>  </td><td> End of input</td></tr>
	<tr><td><code>.135</td><td> Result</td></tr>
</table>

> Update December 2015: Added example of how to use the program, since I couldn't remember how myself.
