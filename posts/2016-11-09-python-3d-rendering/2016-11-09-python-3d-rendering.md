---
title: Rendering a 3D shape with Python
tags: ["Python", "OpenSCAD", "3D Printing", "Algorithm"]
---

<figure style="float:right;margin:30px 0"><img src="/blog/post/python-3d-rendering/figure/2f3b6b2d2cdb460bb8169b306c99e216be3789dd-1.png" alt="" srcset="/blog/post/python-3d-rendering/figure/2f3b6b2d2cdb460bb8169b306c99e216be3789dd-2x-1.png 2x, /blog/post/python-3d-rendering/figure/2f3b6b2d2cdb460bb8169b306c99e216be3789dd-3x-1.png 3x"/></figure>

A friend wanted to 3D-print a shape to demonstrate using calculus to find the volume of solids of known cross-section.
The shape he wanted was a graph of $sin(x)$ vs $x^2$,
where each vertical slice of the intersection was a square.
Here's the graph, with $y_1 = sin(x)$ and $y_2 = x^2$. The blue lines show the edge of each square.
He couldn't figure out how to do this in a CAD program (I'm not even sure if it's possible),
so he asked me if I could write some code to render it.

<div class='well'>This post was written in literate Python. Download <a href="/blog/post/python-3d-rendering/buildshape.py">buildshape.py</a> and run it yourself!</div>

<!-- XXX WARNING XXX: This post (and its ancillary files) was auto-generated from a source file! See the README in the post's directory for information before editing this file. -->
<!--more-->

The first attempt I made was written directly in [OpenSCAD](http://www.openscad.org/);
I wrote a small loop to union together a collection of `cube()` calls, one for each slice.
This had several problems, however.
First, because I was using cubes it looked very chunky unless the slices were very small.
Second, I ran into [a bug in OpenSCAD](https://github.com/openscad/openscad/issues/350)
which causes something like $O(n^2)$ performance for this scenario
and the file took about 2 hours to render.
Finally, the STL file it emitted was 1.8 MB and crashed the slicer.

Clearly, this solution was not going to work.
Instead, I wrote a python script to output an OpenSCAD file containing a single polyhedron,
which I could then render into an STL file and hand off to him to slice and print.
In addition to not crashing the slicer,
this approach also had the advantage of allowing the resolution to be much coarser
while still avoiding the 'stair-step' problem of the original multiple `cube()` approach.


## Setting up
First, the formulae:

<figure class="highlight python"><table><tr><td class="gutter"><pre><span class="line">38</span><br><span class="line">39</span><br></pre></td><td class="code"><pre><span class="line"><span class="function"><span class="keyword">def</span> <span class="title">y1</span><span class="params">(x)</span>:</span> <span class="keyword">return</span> math.sin(x)</span><br><span class="line"><span class="function"><span class="keyword">def</span> <span class="title">y2</span><span class="params">(x)</span>:</span> <span class="keyword">return</span> x*x</span><br></pre></td></tr></table></figure>

$sin(x) = x^2$ is true for $x = 0$ and $x \approx 0.876$, so that's where I'll start and stop.

<figure class="highlight python"><table><tr><td class="gutter"><pre><span class="line">42</span><br><span class="line">43</span><br></pre></td><td class="code"><pre><span class="line">START = <span class="number">0</span></span><br><span class="line">END = <span class="number">0.876726</span></span><br></pre></td></tr></table></figure>

I'll draw 50 slices, and scale everything up by 30.

<figure class="highlight python"><table><tr><td class="gutter"><pre><span class="line">46</span><br><span class="line">47</span><br></pre></td><td class="code"><pre><span class="line">SLICES = <span class="number">50</span></span><br><span class="line">SCALE = <span class="number">30</span></span><br></pre></td></tr></table></figure>

OpenSCAD's [`polyhedron()` function](https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Primitive_Solids#polyhedron)
takes two arguments, `points` and `triangles`.
(Versions 2014.03 and later can also take `faces` instead of `triangles`, but I'm still using 2014.01.)
`points` is a list of $[x, y, z]$ triplets, and `triangles` then indexes into the list of points to build the triangles.
I therefore make a function <code>point(<var>x</var>, <var>y</var>, <var>z</var>)</code>
which will save the point into the list and return the index into this list.
Most of the program then works using these indexes, rather than the actual point coordinates.

<figure class="highlight python"><table><tr><td class="gutter"><pre><span class="line">56</span><br><span class="line">57</span><br><span class="line">58</span><br><span class="line">59</span><br></pre></td><td class="code"><pre><span class="line">points = []</span><br><span class="line"><span class="function"><span class="keyword">def</span> <span class="title">point</span><span class="params">(x, y, z)</span>:</span></span><br><span class="line">	points.append( (x*SCALE,y*SCALE,z*SCALE) )</span><br><span class="line">	<span class="keyword">return</span> len(points)<span class="number">-1</span></span><br></pre></td></tr></table></figure>

## Slicing the shape

<figure style="float:right;margin:30px 0"><img src="/blog/post/python-3d-rendering/figure/9d766802b89baaa4653064000f5a46e7b401fade-1.png" alt="" srcset="/blog/post/python-3d-rendering/figure/9d766802b89baaa4653064000f5a46e7b401fade-2x-1.png 2x, /blog/post/python-3d-rendering/figure/9d766802b89baaa4653064000f5a46e7b401fade-3x-1.png 3x"/></figure>
The first step is to slice the shape and get a list of squares.
(OpenSCAD expects the points on a triangle to be clockwise when looking at them from the outside,
so throughout the program I maintain this clockwise orientation.) Here's the square; line $\overline{P_2 P_3}$ is the part of the square that sits on the graph. The remainder of the square sits above it.

I slice the shape into <code>SLICES</code> slices, and output the above square for each slice.
This is also where I convert the coordinates into point-list indexes as explained above.

<figure class="highlight python"><table><tr><td class="gutter"><pre><span class="line">68</span><br><span class="line">69</span><br><span class="line">70</span><br><span class="line">71</span><br><span class="line">72</span><br><span class="line">73</span><br><span class="line">74</span><br><span class="line">75</span><br></pre></td><td class="code"><pre><span class="line"><span class="function"><span class="keyword">def</span> <span class="title">get_slices</span><span class="params">()</span>:</span></span><br><span class="line">	<span class="keyword">for</span> x <span class="keyword">in</span> scipy.arange(START, END, (END-START)/SLICES):</span><br><span class="line">		<span class="keyword">yield</span> (</span><br><span class="line">			point(x, y1(x), y1(x)-y2(x)),</span><br><span class="line">			point(x, y2(x), y1(x)-y2(x)),</span><br><span class="line">			point(x, y2(x), <span class="number">0</span>),</span><br><span class="line">			point(x, y1(x), <span class="number">0</span>),</span><br><span class="line">		)</span><br></pre></td></tr></table></figure>

## Building the polyhedron
All of these slices I have are *inside* the shape,
which isn't the part that's visible.
The next step is to get all of the faces of the polyhedron
by connecting the edge of adjoining slices into quadrilaterals.

First, I make an "end cap" using the slice at the start of the shape.
This is necessary because otherwise the end will be left 'open' if the first slice is not of size 0,
and the shape [cannot be exported](https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/STL_Import_and_Export#STL_Export_2)
because it is not a valid 2-manifold.

<figure class="highlight python"><table><tr><td class="gutter"><pre><span class="line">90</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">yield</span> slices[<span class="number">0</span>]</span><br></pre></td></tr></table></figure>


<figure style="float:right;margin:30px 0"><img src="/blog/post/python-3d-rendering/figure/7f97826bc4ddd9cfef3e874d903f1759bf0f8fd2-1.png" alt="" srcset="/blog/post/python-3d-rendering/figure/7f97826bc4ddd9cfef3e874d903f1759bf0f8fd2-2x-1.png 2x, /blog/post/python-3d-rendering/figure/7f97826bc4ddd9cfef3e874d903f1759bf0f8fd2-3x-1.png 3x"/></figure>

Next I generate quadrilaterals conecting each of the sides of ajoining slices.
Doing this is relatively simple:

<div>$$
\mbox{Given slices}
\substack {
	\square T_0 T_1 T_2 T_3 \\
	\square P_0 P_1 P_2 P_3
}
\mbox{, emit faces}
\substack {
	\square T_0 P_0 P_1 T_1 \\
	\square T_1 P_1 P_2 T_2 \\
	\square T_2 P_2 P_3 T_3 \\
	\square T_3 P_3 P_0 T_0
}.
$$</div>

(Notice that they all go clockwise when facing outward.)

<figure class="highlight python"><table><tr><td class="gutter"><pre><span class="line">111</span><br><span class="line">112</span><br><span class="line">113</span><br><span class="line">114</span><br><span class="line">115</span><br><span class="line">116</span><br><span class="line">117</span><br><span class="line">118</span><br><span class="line">119</span><br><span class="line">120</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">for</span> this <span class="keyword">in</span> slices[<span class="number">1</span>:]:</span><br><span class="line">		<span class="function"><span class="keyword">def</span> <span class="title">face</span><span class="params">(a, b)</span>:</span> <span class="keyword">return</span> (</span><br><span class="line">			this[a], prev[a],</span><br><span class="line">			prev[b], this[b],</span><br><span class="line">		)</span><br><span class="line">		<span class="keyword">yield</span> face(<span class="number">0</span>, <span class="number">1</span>)</span><br><span class="line">		<span class="keyword">yield</span> face(<span class="number">1</span>, <span class="number">2</span>)</span><br><span class="line">		<span class="keyword">yield</span> face(<span class="number">2</span>, <span class="number">3</span>)</span><br><span class="line">		<span class="keyword">yield</span> face(<span class="number">3</span>, <span class="number">0</span>)</span><br><span class="line">		prev = this</span><br></pre></td></tr></table></figure>
The last step in making the polyhedron is to cap off the back end the same as I did with the front end (see above).

<figure class="highlight python"><table><tr><td class="gutter"><pre><span class="line">122</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">yield</span> prev</span><br></pre></td></tr></table></figure>

## Convert quadrilaterals into triangles

<figure style="float:right;margin:30px 0"><img src="/blog/post/python-3d-rendering/figure/1444037eaf59bacfcc2da383f6af0ab4a207ce49-1.png" alt="" srcset="/blog/post/python-3d-rendering/figure/1444037eaf59bacfcc2da383f6af0ab4a207ce49-2x-1.png 2x, /blog/post/python-3d-rendering/figure/1444037eaf59bacfcc2da383f6af0ab4a207ce49-3x-1.png 3x"/></figure>

I now have a list of faces for the polyhedron. For newer versions of OpenSCAD I could just pass this list in to the `polyhedron()` function; unfortunately as I mentioned before my version of OpenSCAD only accepts a list of triangles.
Therefore, I take each face (a quadrilateral $\square F_0 F_1 F_2 F_3$) and divide it into two triangles, $\triangle F_0 F_1 F_3$ and $\triangle F_1 F_2 F_3$. (Again, I'm being very careful to keep them in clockwise order.)

<figure class="highlight python"><table><tr><td class="gutter"><pre><span class="line">128</span><br><span class="line">129</span><br><span class="line">130</span><br><span class="line">131</span><br></pre></td><td class="code"><pre><span class="line"><span class="function"><span class="keyword">def</span> <span class="title">get_triangles</span><span class="params">()</span>:</span></span><br><span class="line">	<span class="keyword">for</span> face <span class="keyword">in</span> get_faces():</span><br><span class="line">		<span class="keyword">yield</span> (face[<span class="number">0</span>], face[<span class="number">1</span>], face[<span class="number">3</span>])</span><br><span class="line">		<span class="keyword">yield</span> (face[<span class="number">1</span>], face[<span class="number">2</span>], face[<span class="number">3</span>])</span><br></pre></td></tr></table></figure>

## Write the file
Finally, I print out the OpenSCAD file, which simply consists of a single call to `polyhedron()`:

<figure class="highlight python"><table><tr><td class="gutter"><pre><span class="line">135</span><br><span class="line">136</span><br><span class="line">137</span><br><span class="line">138</span><br><span class="line">139</span><br><span class="line">140</span><br><span class="line">141</span><br><span class="line">142</span><br><span class="line">143</span><br><span class="line">144</span><br><span class="line">145</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">print</span> <span class="string">"polyhedron("</span></span><br><span class="line"><span class="keyword">print</span> <span class="string">"	convexity = 1,"</span></span><br><span class="line"><span class="keyword">print</span> <span class="string">"	triangles = ["</span></span><br><span class="line"><span class="keyword">for</span> triangle <span class="keyword">in</span> get_triangles():</span><br><span class="line">	<span class="keyword">print</span> <span class="string">"		[{0}, {1}, {2}],"</span>.format(*triangle)</span><br><span class="line"><span class="keyword">print</span> <span class="string">"	],"</span></span><br><span class="line"><span class="keyword">print</span> <span class="string">"	points = ["</span></span><br><span class="line"><span class="keyword">for</span> point <span class="keyword">in</span> points:</span><br><span class="line">	<span class="keyword">print</span> <span class="string">"		[{0}, {1}, {2}],"</span>.format(*point)</span><br><span class="line"><span class="keyword">print</span> <span class="string">"	]"</span></span><br><span class="line"><span class="keyword">print</span> <span class="string">");"</span></span><br></pre></td></tr></table></figure>

And finally, here's what the shape looks like when it's printed out.
In addition to the Python program linked at the top of this post,
you can also download
[the OpenSCAD file](shape.scad) and
[the STL file](shape.stl).

<img src="photo-graph2.jpeg" width="400" height="227" alt="" style="margin: 1em"/>
<img src="photo-graph.jpeg" width="400" height="328" alt="" style="margin: 1em"/>

