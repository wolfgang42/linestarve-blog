---
title: "Eventual consistency in package tracking numbers"
tags: [Distributed systems, Business processes, Retrocompting]
canonical: https://news.ycombinator.com/item?id=38662681
---
<small>(This post is a mirror of a [Hacker News comment](https://news.ycombinator.com/item?id=38662681) I wrote.)</small>

> The "invalid tracking number" thing drives me nuts. Both Fedex and UPS do it. How hard is it to stick a record in the database the moment a tracking number is generated so that I don't get a "This tracking number is invalid" message? And it's not like it's invalid for a few minutes; I've had tracking numbers remain "invalid" for almost a day. Absolutely insane.

A lot of the systems involved were designed in an era before ubiquitous connectivity, when electronic data transfer involved calling a mainframe over the phone with a modem or sometimes even mailing magnetic tape. In that world the answer to “how hard is it to stick a record in the database” is “surprisingly complicated,” so these systems tend to work on the principle of “very eventual consistency.” I used to work for a company that had been doing eCommerce since the early 2000s, so can give an example of the way this happened:

<!--more-->

FedEx had given us a prefix in their tracking number range. When we printed a shipping label, the server sitting in a corner of the warehouse just allocated a tracking number and added a note to the order information in its database. Since this is a local-only operation, the data transfer method to synchronize state between our server and FedEx’s was the physical package: they didn’t have any way of knowing that we had used any given number until the label showed up in their truck and got scanned in. (IIRC it wasn’t until the monthly billing run that the two databases were actually compared to reconcile any differences.) This sometimes interacted poorly with ship notice emails, since our system sent those as part of its day close batch job and it didn’t have any way of knowing whether the truck had come by to pick up any given package yet.

Eventually we switched to a new warehouse management system that *did* make an API call out to FedEx as soon as it generated a label, but even then that transmission was best-effort only (to prevent an API outage from bringing down the entire shipping line). And there are a lot of legacy systems out there where integrating something like that just isn’t worth the effort versus answering a few extra emails from customers confused by the fallback message.
