---
title: "Working offline"
tags: [Offline, Vagrant, Ansible]
canonical: https://news.ycombinator.com/item?id=16700136
---
> How would you work offline on a bus ( or plane, or train )? [...]
>
> Which tools would you choose ? How would you set them up ?... Any suggestions to ease my life ( other than "change to a job closer to home" ) and make this commuting a more productive time ?
<!--more-->
I don't have a regular commute, but I usually work offline when travelling.

First, some non-programming things:

* Answer emails with an offline email client (e.g. GMail Offline, Thunderbird).

* Download things to read. Consider an RSS reader, Pocket, or just saving PDFs and eBooks. For times when I'm stuck on a project or don't feel like squishing myself into an awkward position to use my laptop I'll pull out my Kindle ($20 from a flea market) which has a bunch of public-domain books from Project Gutenberg, and papers that looked interesting to read. The YouTube app allows you to download videos to watch offline, too. (This may only apply if you have a YouTube Red subscription.)

* Take up knitting, or darn your socks.

Now the programming-related stuff. Working offline is very different than working with an Internet connection; not only do you have to have your documentation locally but also you have to figure out any problems without the help of StackOverflow. This generally results in less productivity, but a deeper understanding of the software you're using.

* Use [devdocs.io](https://devdocs.io) to keep an up-to-date offline version of any software you use. Also install the `-doc` packages (or your distro's equivalent) for any software you have.

* Find out how any package managers you use (e.g. apt, npm, pip, docker) cache packages. If you have even the remotest suspicion that you may want to use a package, put it in the cache when you're near an internet connection so you can install it later.

* Use git. For your own projects, you can commit offline and push to the server when you have a chance; for other programs/libraries having a copy of the source code is helpful when you're trying to track down why something isn't working and you can't just Google it.

* Whenever possible, set up a local copy of whatever you're deploying and make it as easy as possible to sync your local copy to the live version. If you're using Docker this is your Dockerfile; for servers I will keep a dev instance as a local VM managed by Vagrant, with the config stored as an Ansible playbook. This way I can get the Ansible playbook to do what I want in the VM and then deploy it to the live server later.

* This way of working will influence the software you write. If you're building a company you're likely to wind up using fewer cloud-based systems and more self-hosted (or at least self-hostable) ones, since you can test against a self-hosted service if you have a local instance. (Example: for error reporting, use Sentry rather than Airbrake or Rollbar. Even if you use the Sentry.io SaaS in production, you can set up a Sentry docker container for testing locally.) Even if you do have a dependency on an external service, you will have some sort of `OFFLINE` flag that disables that feature or turns off cache refreshing. 

<small>(Mirror of a [Hacker News comment I wrote](https://news.ycombinator.com/item?id=16699525).)</small>
