---
layout: post
title: "Rendering HTML5 Video with Handbrake"
date: 2014-09-24 19:47:28 -0400
tags: ["HTML5", "HTML5 video", "HandBrake"]
---
For my [video server](http://github.com/wolfgang42/videoserver) project, I needed to
be able to show HTML5 videos in a wide variety of browsers.
I also didn't want to have to keep multiple copies of the video in different formats
(there were a lot of videos, and space constraints).
The closest I could get was using [MediaElement.js](http://mediaelementjs.com), which provides a Flash player fallback.
You *should* be able to put an MP4 encoded with the [h.264] video codec on your page, and have it work anywhere.
It turns out it's not that easy. (iPads, for instance, need a specific sound codec as well.)

After a lot of research, I came up with the following settings for [HandBrake](http://handbrake.fr),
which will create a video that works (in combination with MediaElement.js) on most if not all browsers,
looks good, and has a small size.
I've tested it on Windows using Firefox, Google Chrome, and Internet Explorer, on Linux using Firefox, and
on the iPad using Safari.
If you don't want to enter all of these settings manually, you can download a {% asset_link HTML5_preset.plist handbrake presets file %} instead.

<!-- more -->

I developed these settings with the help of [A “best settings” guide for Handbrake 0.9.9](http://mattgadient.com/2013/06/12/a-best-settings-guide-for-handbrake-0-9-9/) as well as other pages linked to in the appropriate sections.

## Output Settings

[http://trac.handbrake.fr/wiki/OutputSettings](http://trac.handbrake.fr/wiki/OutputSettings)

* **Container: Mp4**
* **Large File Size: Off**

	This enables 64bit support in the MP4 container. 

	* Advantages
		* Removes the 4GB file size limitation.
		* Encoded files will not be corrupted if they breach the 4GB barrier when this option is selected.
	* Disadvantages
		* Some players do not support 64bit mp4 files.

	This option is not currently turned on by default due to possible compatibility issues. This may change in future versions when it is deemed that older devices are less common place.
* **Web Optimized: On**

	This places the container header at the start of the file, optimizing it for streaming across the web. (This is what makes seeking without downloading the whole file possible.)
* **iPod 5G Support: Off**

	We don't need to support the iPod 5G, and this can apparently break compatibility with certain players.


## Picture
[http://trac.handbrake.fr/wiki/PictureSettings](http://trac.handbrake.fr/wiki/PictureSettings)

* **Anamorphic: Strict**

	Don't resize the video.

	Use **Loose** (and **Modulus 2**) to resize the video.
	(See [http://trac.handbrake.fr/wiki/AnamorphicGuide](http://trac.handbrake.fr/wiki/AnamorphicGuide)
	and section "On to the “Picture Settings” window" of [A “best settings” guide for Handbrake 0.9.9](http://mattgadient.com/2013/06/12/a-best-settings-guide-for-handbrake-0-9-9/) ).
* **Cropping: Automatic**
	Or **Manual**, if automatic doesn't work as well as you'd like. (If it leaves black bars, or chops off too much of the video)

## Filters
* **Detelecine: Default**

	This will automatically detect and handle telecining if necessary, but will have no impact if the video has not been telecined.

	[http://trac.handbrake.fr/wiki/Telecine](http://trac.handbrake.fr/wiki/Telecine)
* **Decomb: Default**

	This will automatically detect and remove combing if necessary, but will have no impact if the video does not have combing.
	
	[http://trac.handbrake.fr/wiki/Decomb](http://trac.handbrake.fr/wiki/Decomb)
* **Deinterlace: Off**

	Not needed; interlacing should be automatically removed by the **decomb** filter.
* **Denoise: Off**

	Removes 'speckling' and 'moving dots' from a video; only needed if the video has this and will degrade the quality otherwise.

	For details on configuring, see: [Fighting noise/grain in handbrake – custom denoise settings](http://mattgadient.com/2012/06/19/fighting-noisegrain-in-handbrake-custom-denoise-settings/)
* **Deblock: Off**

	Removes 'blocky' compression artifacts from a video by smoothing them out; only needed if the video has this and will degrade the quality otherwise.
	Moving it futher to the right will smooth the video out more.
* **Grayscale: Off**

	Turns the whole movie into grayscale. For movies which are already black and white, this doesn't seem to affect the quality or file size at all. (I only tested this with one movie.)

## Video

### Video
* **Video Codec: H.264 (x264)**
* **Framerate (FPS): Same as source**

	[http://trac.handbrake.fr/wiki/FramerateGuide](http://trac.handbrake.fr/wiki/FramerateGuide)
* **Variable Framerate**

	Allows a video to be encoded at multiple framerates (for example, 30fps for TV and 24fps for telecined content)

	[http://trac.handbrake.fr/wiki/VariableFrameRate](http://trac.handbrake.fr/wiki/VariableFrameRate)

### Quality
* **Constant Quality: 24**

	**Avg Bitrate** guarantees a particular file size, but doesn't do anything about quality. It is a bad idea. ([http://trac.handbrake.fr/wiki/AvgBitrateAndTargetSize](http://trac.handbrake.fr/wiki/AvgBitrateAndTargetSize))

	Higher numbers are less quality; DVDs are about 20 so anything lower than that is pointless. (After extensive testing, I determined that **24** was gave me the best size/quality tradeoff for DVDs; your opinion may vary.)

	[http://trac.handbrake.fr/wiki/ConstantQuality](http://trac.handbrake.fr/wiki/ConstantQuality)

### Optimise Video
[http://trac.handbrake.fr/wiki/x264VideoSettings](http://trac.handbrake.fr/wiki/x264VideoSettings)

* **x264 Preset: ?**

	This slider has the following options:

	Ultrafast — Superfast — **Very fast — Faster — Fast — Medium — Slow** — Slower — Very slow — Placebo

	Slower speeds create files which are smaller and higher quality; however, slower settings tend to give diminishing returns. The Handbrake manual suggests using something between **Very Fast** and **Slow** (highlighted above); **Medium** is a good balance, but use the slowest setting you can bear.
* **x264 Tune: None**

	This is supposed to adjust various settings to optimize the transcoder for e.g. film or animation. When I tried it, though, it just made the file *bigger* without improving the quality. It's probably better off left at **None**.
* **Fast Decode: Off**

	This option is only useful with slower devices which struggle to play video files. (If you are encoding your video with such devices in mind, you'll want to turn it on.)
* **H.264 Profile: Main**
* **H.264 Level: Auto**

## Audio
[http://trac.handbrake.fr/wiki/Encoders#Audio](http://trac.handbrake.fr/wiki/Encoders#Audio)

* **Auto Passthru:** Uncheck everything except **AAC**
* **Fallback: AAC (faac)**

	You must enable *Tools > Options > Audio and Subtitles > Show advanced audio passthru options* and restart Handbrake to see these options.

	The iPad requires the audio to be in AAC format. These options use the existing AAC audio from the DVD if possible, and re-encode the DVD audio into AAC (using the *faac* library) otherwise.

	There should be one track, with the following options:
* **Source: *(as preferrred, probably 'English')***
* **Codec: Auto Passthru**

