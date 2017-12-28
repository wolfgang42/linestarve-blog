---
title: "FRC 2015 Control System Notes"
date: 2014-12-17
tags: ["FRC", "FRC2015"]
slug: frc-2015-control-system-notes
---
These are notes I took while watching the FRC Behind the Lines episode "2015 Control System Beta Teams" (<https://www.youtube.com/watch?v=uUYlS2Vkyuo>)
They are organized into broad categories, but are otherwise not cleaned up.
<!--more-->

Hardware
--------

* RoboRio (hardware)
	* CAN built in
	* NXP port
		* add additional I/O
		* Integrated w/ WpiLib - hardware ports are 0-9; NXP is 10+
		* Must be broken out w/ custom PCB
* CAN
	* Asynchronous - refreshes automatically
		* Default refresh rates (configurable)
			* Jaguar: 20ms
			* CAN talon: 10ms
	* Monitoring on driver station
	* Can check % utilization & other statistics on webdash (below), to determine fault causes
* Power distribution board
	* Blinky yellow light for brownout
	* More intelligent (connects to RoboRIO via CAN)
	* Per-port current sensing - see what's using power
* Voltage regulator module
	* 2A spec is max peak (momentary) - only 1½A continuous
	* RoboRio prevents itself from switching off by detecting brownout and switching off other subsystems
		* 6.3-6.8V — 5v power rail — servos, sensors
		* 4.5-6.3V — PWM/CAN controllers, relays
			* This can cause stuttering as they cause brownouts, switch off, recover; lather, rinse, repeat.
		* Lower voltages: RoboRIO itself switches off, then WiFi bridge
		* Recovers quickly (<100ms?)
* Weidmuller connectors
	* Wire whiskers can cause intermittent shorts
		* Will mostly occur on the field, not in pits, due to vibration
	* Wires: strip to 8mm; shorter sizes can cause issues. Recommend tinning wires
	* Insertion/removal can cause wires to bunch up and not connect as well


Software
--------

* RoboRio - Software
	* User button - can be programmed to do anything
		* e.g. reset sticky faults (see below)
	* Web Dashboard
		* <http://roborio-3173/>
		* Update RoboRio firmware
		* CAN bus:
			* List devices
			* Update firmwares
			* See device info
			* control devices manually
		* Sticky faults
			* Must be cleared manually
			* e.g.: brownouts cause yellow blinky light on PDB
			* Can also reset faults from code
		* Many other features
	* Running Linux; configured as real-time OS
		* Can set priorities on tasks (e.g. drives=very important; logging=not as important)
		* 3rd party libraries (e.g. OpenCV)
		* Has package mananger: ```opkg```
			* Connect RoboRio to Internet, use to download & install additional software
		* Can install anything you like manually
	* 2 cores! - spin up another thread via WpiLib tasks or Linux pthreads API
* Driver station
	* Lots more data displayed
	* Multicast DNS (mDNS)
		* Special dlink setup tool (like last year)
		* dlink now has DHCP server, issues IP addresses to any connected device
			* no more manual IP configuration! — Plug & play!
		* Reserved block for manual allocation if necessary
* Programming — Java SE 8 embedded (up from JRE 1.3 (!))
	* Lambda expressions! Enums! Etc! (No more MissingMath!)
	* API - WPIlib
		* Very backward-compatible
		* 0-indexed instead of 1
