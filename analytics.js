
// Microticks consumer
//
// ########################################################################################################################################################
// General stuff:

// Run a function during the next tick of the event loop.
var nextTick = function(f) {
	setTimeout(f, 0);
};

Microticks = function ( hostname, consumer_key ) {

	// We will get a session ID from the server, that we can send with every request.
	this.sessionToken = null;

	// The microticks hostname (e.g. 'http://localhost:5000/')
	this.hostname = hostname;

	// Unique key for this instance
	this.consumerKey = consumer_key;

	// Queue of POST requests
	this.requests = [];

	// Are we currently working on requests from the queue?
	this.busy = false;

	// Is session starting?
	this.sessionStarting = false;

	// Reset state
	this.resetState();

	// Subscribe to events.
	if (this.hostname) {
		this.subscribeToEvents();
	} else {
		console.log('[Microticks] No microticks service configured');
	}
};

Microticks.prototype.subscribeToEvents = function () {
	// Override me
}

Microticks.prototype.resetState = function () {
	// Override me
}

// Utility method to join all the arguments using '/' as glue, and avoid double dashes
// if any of the arguments already contains '/'at the beginning or end.
Microticks.prototype.urljoin = function () {
	return [].reduce.call(arguments, function(acc, val) {
		// Convert all arguments to strings by adding  ''
		return (acc + '').replace(/\/+$/, '') + '/' + (val + '').replace(/^\/+/, '');
	});
}

// Make a request to the Microticks web API.
// Returns a jquery Promise.
Microticks.prototype.post = function ( path, payload ) {
	payload = payload || {};
	payload.ts = (new Date()).toISOString();

	var job = { path: path, payload: payload, deferred: $.Deferred() };

	this.requests.push(job);
	this.sendNextRequest();
	return job.deferred.promise();
}


Microticks.prototype.sendNextRequest = function () {
	if (this.busy || !this.requests.length) {
		return; // we only do one thing at the time
	}
	this.busy = true;
	var job = this.requests.shift();
	job.payload.token = this.sessionToken;
	// console.log('Sending request:', job.payload);
	return $.ajax({
		method: "POST",
		url: this.urljoin(this.hostname, job.path),
		dataType: "json",
		data: job.payload,
		cache: false
	})
	.then( function( data, textStatus, jqXHR ) {
		job.deferred.resolve( data, textStatus, jqXHR );
		this.busy = false;
		if (this.requests.length) {
			nextTick(this.sendNextRequest.bind(this));
		}
	}.bind(this), function( jqXHR, textStatus ){
		job.deferred.reject();
		this.busy = false;
		this.sessionStarting = false;
		console.error("Microticks.request(): Failed to make request (HTTP status='" + jqXHR.status + " " + jqXHR.statusText + "', message='" + textStatus + "', response='" + jqXHR.responseText + "')");
	}.bind(this));
}

Microticks.prototype.startSession = function () {
	if (this.busy || this.sessionStarting) {
		return;
	}
	sessionStarting = true;
	this.post('/sessions', {consumer_key: this.consumerKey}).then(function( data, textStatus, jqXHR ) {
		console.log('[Microticks] Session started');
		this.sessionToken = data.token;
		this.sessionStarting = false;
	}.bind(this));
}

Microticks.prototype.stopSession = function (reason) {

	this.resetState();

	if (!this.sessionToken) {
		return;
	}

	this.post('/events', {
		action: 'stopSession',
		data: JSON.stringify({reason: reason}),
	});

	return this.post('/sessions/stop').then( function () {
		console.log('[Microticks] Session stopped');
		this.sessionToken = null;
	}.bind(this));
}

Microticks.prototype.trackEvent = function ( action, data ) {
	if (!this.sessionToken) {
		this.startSession();
	}
	// console.log('[trackEvent]')
	this.post('/events', {
		action: action,
		data: JSON.stringify(data),
	});
}


// ########################################################################################################################################################
// ximpel.Analytics is a subclass of Microticks with Ximpel-specific functionality.


ximpel.Analytics = function(hostname, consumer_key) {

	// Whether to track clicks that do not cause any action
	this.trackMeaninglessClicks = false;

	Microticks.call(this, hostname, consumer_key);
}
ximpel.Analytics.prototype = Object.create(Microticks.prototype);
ximpel.Analytics.prototype.constructor = Microticks;

// subscribe() subscribes to events we want to track.
ximpel.Analytics.prototype.subscribeToEvents = function () {
	console.log('[ximpel.Analytics] subscribeToEvents');

	// A message event is sent from the book viewer iframe whenever the page changes.
	window.addEventListener('message', this.onMessage.bind(this));

	window.addEventListener('click', this.onClick.bind(this));
}

ximpel.Analytics.prototype.setXimpelApp = function (app) {
	console.log('[ximpel.Analytics] Subscribing to ximpelPlayer events');
	this.ximpelPlayer = app.ximpelPlayer;

	// New subject is playing
	this.ximpelPlayer.addEventHandler( 'subject_playing', function( subjectModel ) {
		this.onSubjectChange(subjectModel.subjectId);
	}.bind(this) );

	// Swipe
	this.ximpelPlayer.addEventHandler( 'swipe', this.onSwipe.bind(this) );

	// Iframe opens
	// this.ximpelPlayer.sequencePlayer.mediaPlayer.addEventHandler( 'iframe_open', this.onIframeOpen.bind(this) );
	this.ximpelPlayer.addEventHandler( 'iframe_open', this.onPdfViewerOpen.bind(this) );

	// Iframe closes
	// this.ximpelPlayer.sequencePlayer.mediaPlayer.addEventHandler( 'iframe_close', this.onIframeOpen.bind(this) );
	// this.ximpelPlayer.addEventHandler( 'iframe_close', this.onIframeClose.bind(this));

	// Reset state
	this.resetState();
}

ximpel.Analytics.prototype.resetState = function () {
	if (!this.ximpelPlayer) {
		return;
	}

	// Last subject
	this.previousSubjectId = null;

	// Current subject
	this.currentSubjectId = this.ximpelPlayer.currentSubjectModel ? this.ximpelPlayer.currentSubjectModel.subjectId : null;

	// Date of last subject change
	this.currentSubjectStartTime = null;
}

ximpel.Analytics.prototype.onPdfViewerOpen = function ( data ) {
	// Iframes in Ximpel are implemented differently from all the other views,
	// but for tracking purposes we can consider opening an iframe as equivalent
	// to playing a new subject. Since there's no subject model for the iframes, they
	// don't have IDs, but their URLs serve the same purpose for navigation with `leadsTo`,
	// so we treat the URls as subject IDs here.

	if (data.file) {
		var t = data.file.split('link=books/');
		if (t.length == 2) {
			this.onSubjectChange('ebook:' + t[1]);
		} else {
			this.onSubjectChange(data.file);
		}
	}

	// Use event capturing from window
	if (data.$iframe) {
		data.$iframe[0].contentWindow.addEventListener( 'click', this.onClick.bind(this), true );
	}
}

// ximpel.Analytics.prototype.onIframeClose = function ( evt, url ) {
// 	console.log('iframe close', evt, url);
// 	// The iframe overlay is closed. We effectively go back to the last active subject
// 	this.onSubjectChange(this.previousSubjectId);
// }

ximpel.Analytics.prototype.onMessage = function ( evt ) {
	try {
		var data = JSON.parse(evt.data);
		if (data.eventName && data.payload) {
			// Note to self: YouTube also posts messages using "infoDelivery"
			// as eventName, but without a "payload" parameter. We could make
			// a whitelist of eventNames that we would like to track, but then
			// it's easy to forget to update the list... so for now we track
			// everything that *looks* like it's coming from us (i.e. that has a
			// "payload" parameter). What can possibly go wrong..?
			console.log('From iframe:', data);
			data.payload.subject = this.currentSubjectId;
			this.trackEvent( data.eventName, data.payload );
		}
	} catch (e) {
		// If it wasn't JSON, we don't want it. YouTube sends lots of stuff.
	}
}

ximpel.Analytics.prototype.onClick = function ( evt ) {
	// Use nextTick to ensure onClick is handled *after* the onSubjectChange.
	nextTick(function() { this.onEvent('click', {
		subject: this.currentSubjectId,
		clickX: evt.center ? evt.center.x : evt.clientX,
		clickY: evt.center ? evt.center.y : evt.clientY,
	}); }.bind(this));
}

ximpel.Analytics.prototype.onSwipe = function ( evt ) {
	// Use nextTick to ensure onSwipeLeft is handled *after* the onSubjectChange.
	nextTick(function() { this.onEvent('swipe', {
		type: evt.type,
		subject: this.currentSubjectId,
		centerX: evt.center.x,
		centerY: evt.center.y,
		deltaX: evt.deltaX,
		deltaY: evt.deltaY,
	}); }.bind(this));
}

ximpel.Analytics.prototype.onEvent = function ( eventName, payload ) {
	var msecsSinceSubjectChange = new Date() - this.currentSubjectStartTime;
	if (msecsSinceSubjectChange < 300) {
		// We assume that the event caused the subject change
		payload.prevSubject = this.previousSubjectId;
		console.log( '[Analytics] A ' + eventName + ' caused a subject change from "' + this.previousSubjectId + '" to "' + this.currentSubjectId + '"');
		this.trackEvent( eventName, payload );
	} else {
		if (this.trackMeaninglessClicks) {
			console.log( '[Analytics] Tracking a meaningless ' + eventName + ' since trackMeaninglessClicks is true');
			this.trackEvent( eventName, payload );
		} else {
			console.log( '[Analytics] Ignoring a meaningless ' + eventName + ' since trackMeaninglessClicks is false');
		}
	}
}

ximpel.Analytics.prototype.onSubjectChange = function ( newSubjectId ) {
	this.currentSubjectStartTime = new Date();
	this.previousSubjectId = this.currentSubjectId;
	this.currentSubjectId = newSubjectId;
}

