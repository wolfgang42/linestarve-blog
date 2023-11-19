---
title: "Coping with inherited code"
date: 2018-11-28
slug: inherited-code
tags: ["Programming"]
canonical: https://mm.icann.org/pipermail/comments-org-renewal-18mar19/2019q2/002685.html
---
<small>(Mirror of [a comment I wrote](https://news.ycombinator.com/item?id=18555615) in response to the question “Have you ever inherited a codebase nobody on the team could understand? How did you deal with it?”)</small>

I inherited a suite of .NET/WinForms applications that managed warehouse shipments to major purchasers. They had been written and modified by a succession of programmers with wildly different opinions of how to write a program (from copy-paste duplication to massively overarchitected inheritance trees; fully denormalized tables to 6th normal form; and everything in between). I was the only software developer at the company, so there was nobody else to ask how any of this worked; I had to figure it all out from scratch. The steps I took were:

<!--more-->

- Pick the program with the most egregious errors. This was part of the suite that would upload tracking information to the purchaser, and cost us large fines when something went wrong.

- Find the user(s) of the software and pay them a visit. Solicit buy-in (there was some concern that the new IT director might have started this initiative in an effort to automate people out of their jobs) by explaining that I'm planning on making the software easier to use (easy, since it was awful and everyone hated it), and then have them walk me through exactly how they used it. This turned out to be a terribly inefficient process involving lots of paperwork shuffling, but I ignored that temporarily in favor of just finding out how it was supposed to work now, and what sort of ways it went wrong. Get a list of likely low-hanging-fruit bugs.

- Track down the source code to the program, and put it under version control. Fortunately I had a copy of the previous developer's computer, which had an up-to-date version once I found it. However I did have to test that it did everything it was supposed to by running it in production, which was a bit nerve wracking.

- Set up an automated updater (I used Microsoft's ClickOnce installer, which checks for updates on a shared SMB drive), and replace all the copies of the program I could find with auto-updating ones. (This required asking people to pass around word of a replacement by word-of-mouth as they heard other people were using it, since nobody had a list of all the users.)

- Buy ReSharper, and start doing mechanical refactorings on the codebase to fix the obvious and easy code smells. What the changes are doesn't really matter much; the point of this exercise is to start to get a feel of where everything is in the code. Since you're just using the ReSharper commands, there's no risk of breaking anything by doing this.¹

- Fix a few easy bugs, and push an update out to users. I started with making a list view sortable (literally a one-checkbox change that saved 30 minutes a day) and a few similar small issues. This immediately showed a previously unprecedented level of interest in the users' problems and also got them used to using the auto-updater before any more major changes came along.

- Continue with more major refactorings and bug fixes, pushing out a release every few weeks (faster if you can focus on just the one project). I usually tried to include at least a few user-facing changes in with the internal stuff, but occasionally the release notes were just "better performance" or "major internal improvements, so I can do feature X next week".

The really important part of this process is understanding not only how the software works (and how it's *suppose* to work)—which can probably only be done by refactoring instead of rewriting—but also getting to know how the users use it and what their actual needs are, so you can suggest improvements that wouldn't necessarily be obvious to someone who doesn't understand the entire system.

¹ A commenter noted:

> I love ReSharper, and it has been worth every penny that I've ever paid for updates, but you still have to be very careful. I've walked into a few very heinous bugs where simple refactorings have broken things badly. Mostly this was because of people doing evil things with reflection and dependency injection, that should never have been done, or because of arcane config-file based development, where even ReSharper's excellent "Find Usages" and code analysis engine cannot fully understand what is going on. 

This is true. Fortunately none of the code I worked with did anything like that, but it's definitely important to be aware of. 
