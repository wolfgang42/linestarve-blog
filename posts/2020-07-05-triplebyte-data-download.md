---
title: "The Triplebyte data download doesn’t give you all your data"
tags: []
---

In May of last year I decided to start looking for a new job, and started by taking [Triplebyte](https://triplebyte.com/)’s quiz. Having passed that, I spent the next three months going through the rest of their process, from a [two-hour remote interview](https://triplebyte.com/interview_guide) all the way through to final negotiations with the company whose offer I selected. Throughout the process they were extremely competent and helpful, and at the end of it all I had only good things to say about them. They made the whole process go extremely smoothly, answered all the questions I had and gave me a ton of advice on the whole process, and their screening process was not only great from the my perspective but also gave me confidence in the quality of all their candidates. 

<!--more-->

Then, a little over a month ago, I got an email announcing the upcoming launch of Triplebyte’s new public profiles. I thought they were was a neat idea, and made a note that I should turn mine on next time I started a job hunt. Then someone [posted the email on Hacker News](https://news.ycombinator.com/item?id=23279837), pointing out that buried in the middle of the email was the fact that these new profiles were going to be opt-*out,* and unless I turned it off in the next week my profile would become public. This understandably caused an uproar, which the Triplebyte CEO Ammon [completely misinterpreted](https://news.ycombinator.com/item?id=23280460), posting a series of [inflammatory comments](https://news.ycombinator.com/item?id=23280120) that [misunderstood what people were upset about](https://news.ycombinator.com/item?id=23280472) before vanishing. A few days later he came back with a very apologetic email explaining that they weren’t going to go through with it after all, though it received [mixed reactions](https://news.ycombinator.com/item?id=23303037), with a lot of people being concerned that the idea had been considered at all.

In the midst of all this, I submitted a request through the [Triplebyte privacy center](https://triplebyte.com/privacy-center) to download my data. (I considered deleting my account, but decided to give them the benefit of the doubt until things settled down.) After approving the request by clicking an email link, I was informed that it might take up to 30 days to complete my request, so I settled down to wait. As the weeks passed, I thought that the sudden influx of requests must have overwhelmed whoever was responsible for gathering the data from all the systems it was stored in.

Then, 36 days after I first submitted the request, I got an email informing me that my data was now ready to be downloaded. I clicked the link in the email, and then another link on the next page, and finally I got—

A 2,917 byte JSON blob.

*Odd,* I thought, *that seems like an awfully long time for so little data.* (It’s just over 81 bytes per day, in fact, though I realize that’s a silly metric.) Still, I was relieved to know that they hadn’t been gathering reams of data about me behind my back. Scanning over the minified data, it looked like all they had was my address, some information I’d given them about my past jobs and preferred languages, and a couple of recent IP addresses. Seemingly they hadn’t even kept any information at all about my job search with them.

Then I opened up the file in a JSON viewer and gradually realized: *this was not all the information they had.* It wasn’t even all of the information they were *willing to admit* they had—it was missing some obvious things, like the text descriptions on the `education` and `work experience` objects, which were prominently displayed on my profile page. As far as I can tell, all I got was a sloppy attempt at making it look at a casual glance like they’d given me what I asked for.

This raises serious concerns for me about Triplebyte, even more so than their plan to make profiles public by default, which started this all. That may well have been born of overenthusiastic naïvité, and was quickly rescinded after being exposed to public comment. After that fiasco, though, I would have expected them to double down on making sure that they were taking privacy seriously. They had over a month before sending me this data to fix any issues with the system, and instead they sent me some slapdash attempt at maybe giving me a whiff of my data.

Triplebyte (as they explain in their privacy center) “care deeply about how your personal information is used and shared,” but apparently not enough to actually put effort into getting it right when you ask for it.

(I’ve sent them an email asking what happened to the rest of the data, and will update this post when I get a response. As it’s the weekend I may not hear back for a few days.)
