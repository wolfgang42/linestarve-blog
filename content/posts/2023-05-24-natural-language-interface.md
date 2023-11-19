---
title: "Ambiguity in natural language interfaces for programming"
slug: ai-programming-ambiguity
date: 2023-05-24
tags: [Programming, AI, Business processes]
canonical: https://news.ycombinator.com/item?id=36052870
---
There’s been a lot of discussion recently about whether conversational AI will replace programmers any time soon. One of the arguments against this happening is that natural language is inherently ambiguous; you need to very precisely specify what you want, and that looks like... a programming language, with all of the inherent complexity that programmers are there to manage. I think this rather misses the point: programmers *also* provide a natural language interface to their users, and somehow usually manage the ambiguity and complexity OK.

<small>(This post is a lightly edited version of a [Hacker News discussion](https://news.ycombinator.com/item?id=36052870)).</small>

<!--more-->

In my experience, a lot of support requests for bespoke/in-house software go like this:

> User: Why is my wibble being quarked? This shouldn’t be happening!
>
> Dev: Wibble ID, please?
>
> User: ID 234567. This is terrible!
>
> Dev: *[rummages in git blame]* Well, this wibble is frobnicated, and three years ago *[links to Slack thread]* you said that all frobnicated wibbles should be automatically quarked.
>
> User: Yes, but that was before we automated the Acme account. We *never* quark *their* wibbles!
>
> Dev: ...so, is there a way for me to tell if a client wants their wibbles unquarked, or should I hard-code an exception for Acme?

(And then, six months later: “Why are none of Acme’s wibbles being quarked automatically?”)

If you could introduce an AI assistant that could answer these questions instantly (instead of starting with a support ticket), it’d cut the feedback loop from hours or days down to seconds, and the users (who are generally pretty smart in their field, even if my frustration is showing above) would have a much better resource for understanding the black box they’ve been given and why it works the way it does. 

Obviously the computer can’t find answers that have been lost to the mists of time; pointing to a specific discussion is a best-case scenario, and relies on a good commit history. But even just providing a brief explanation of the current code would be a great help (even if it gets confused and gives bad answers occasionally; so do I sometimes!); and even when the history is vague you can usually pull useful information like “this was last changed eight years ago, here’s a ticket number” or “it’s worked like this since the feature was added, I have no idea what they were thinking at the time” or “the change that caused this to start happening claims to be a refactor, but seems to have accidentally inverted a condition in the process”.

In a magical world where the AI is handling this entire conversation automatically, it would also naturally write a good commit message for itself, quoting the discussion with the relevant user, so it has something to point to when the topic comes up again. (And it’d be in all the Slack channels, so when someone mentions in #sales-na-east that Acme has asked about quarking services, it can drop into the conversation and point out that the Wibble Manager might need changing before that turns into an urgent change request because we’ve accidentally sent them a batch of unquarked wibbles. Well, one can dream, anyway.) 
