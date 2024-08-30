---
title: "Hints for diagnosing memory leaks in NodeJS"
tags: [NodeJS]
short: true
---
A couple of things I keep having to rediscover when diagnosing crashes in Node problems caused by running out of memory:

* Set <code><a href="https://nodejs.org/api/cli.html#--max-old-space-sizesize-in-megabytes">--max-old-space-size</a>=100</code> (or some other smallish number of megabytes) to make the crash happen faster and reduce the chance of it bringing down other things on the system.
* Set <code><a href="https://nodejs.org/api/cli.html#--heapsnapshot-near-heap-limitmax_count">--heapsnapshot-near-heap-limit</a>=1</code> to generate a `*.heapsnapshot` file when the runtime thinks it’s close to running out of memory. This process takes a long time and a lot of memory of its own (seemingly roughly twice the heap size, more or less), so setting `max-old-space-size` to something relatively small seems mandatory when using this option, to avoid the snapshot process itself running out of memory.
* The resulting profile can be loaded in the Chrome developer tools’ Memory tab for viewing.
