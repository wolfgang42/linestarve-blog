---
title: "Using Airbrake with Electron"
date: 2016-05-02
tags: ["Airbrake", "Electron", "NodeJS"]
---
Just a quick tip on how to use [Airbrake] to report errors in an [Electron] renderer process.
[Airbrake]: https://airbrake.io/
[Electron]: http://electron.atom.io/

<!--more-->

This code has been tested with `electron@1.2.0` and `airbrake-js@0.5.9`.

First of all, install [`airbrake-js`](https://www.npmjs.com/package/airbrake-js):
```
npm install --save airbrake-js
```

Then, create an `AirbrakeClient` instance in the renderer script
(*not* the main process—for that I think you would want to use [node-airbrake](https://github.com/airbrake/node-airbrake) instead):

```javascript
var AirbrakeClient = require('airbrake-js')
var airbrake = new AirbrakeClient({projectId: /*id*/, projectKey: /*your-key-here*/});
```

  Now you can use `airbrake.notify()` etc. as described in the `airbrake-js` documentation.
However, `airbrake-js` will *not* catch and report errors automatically for you, as it would in the browser.
This is because Electron has already added a `window.onerror` handler and Airbrake avoids overwriting any handlers
that are already using this event.

To report uncaught exceptions, just add the following code:

```javascript
// Electron hooks into `window.onerror`
// and emits an `uncaughtException` event on `global.process` instead.
process.on('uncaughtException', function(e) {
	// First log the exception to the console so it shows up as usual
	console.error('Uncaught exception:', e.stack)
	// In addition, report it to Airbrake.
	airbrake.notify({error: e})
})
```

Airbrake will now report any uncaught exceptions in your code.
