---
title: "Seeking on a UNIX pipe"
tags: [UNIX, C]
canonical: https://news.ycombinator.com/item?id=24421994
---
>> `tac` is `cat` spelled backwards it prints the contents in reverse order.
>
> How is input to a pipe reversed?

It’s written to a seekable tempfile first: [github.com/coreutils/.../tac.c](https://github.com/coreutils/coreutils/blob/6a3d2883fed853ee01079477020091068074e12d/src/tac.c#L542-L556)

<small>(This post is a mirror of a [Hacker News comment I wrote](https://news.ycombinator.com/item?id=24421994).)</small>
