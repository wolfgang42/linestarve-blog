---
layout: post
title: "Compiling SleepyHead on Ubuntu Trusty"
date: 2014-09-26 16:48:42 -0400
tags: ["Ubuntu", "SleepyHead"]
---
I wanted to install SleepyHead on my new computer (running Ubuntu 14.04 Trusty),
but there's no package in the Ubuntu repositories.
SleepyHead has instructions for [building from source](http://sleepyhead.sourceforge.net/wiki/index.php/Build_from_source)
on their wiki, but they don't tell you which packages you need, which is the difficult bit of the process.
After some trial and error, I arrived at the following instructions, which worked for me
and which I believe to be accurate.
<!-- more -->

You'll need the following packages installed:
`qt5-qmake` `qtbase5-dev` `libqt5-serialport5-dev` `libqt5webkit5-dev` `libudev-dev`.

Now that those are installed, cd to whichever directory you keep source in and run:
	```bash
	mkdir sleepyhead
	cd sleepyhead
	git clone http://git.code.sf.net/p/sleepyhead/code sleepyhead-code
	mkdir build
	cd build
	export QT_SELECT=qt5
	qmake ../sleepyhead-code/SleepyHeadQT.pro
	make -j2 # -j is how many cores you have (adjust as appropriate)
	```

Assuming `make` returned 0, you should now have a directory called `build/sleepyhead`
and an executable called `build/sleepyhead/SleepyHead`.
The easiest way to use SleepyHead is to simply run that executable.
