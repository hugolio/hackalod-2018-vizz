
/**
 * throttle
 * Source: https://github.com/m-gagne/limit.js
 * @param {integer} milliseconds This param indicates the number of milliseconds
 *     to wait between calls before calling the original function.
 * @param {object} What "this" refers to in the returned function.
 * @return {function} This returns a function that when called will wait the
 *     indicated number of milliseconds between calls before
 *     calling the original function.
 */
Function.prototype.throttle = function (milliseconds, context) {
    var baseFunction = this,
        lastEventTimestamp = null,
        limit = milliseconds;

    return function () {
        var self = context || this,
            args = arguments,
            now = Date.now();

        if (!lastEventTimestamp || now - lastEventTimestamp >= limit) {
            lastEventTimestamp = now;
            baseFunction.apply(self, args);
        }
    };
};

/**
 * IdleTracker for Ximpel will reset Ximpel to its initial state after some
 * idle time, measured as time without any clicks/taps or mouse moves.
 *
 * Basic usage:
 *
 *    var app = new ximpel.XimpelApp( ... );
 *    var idleTracker = new IdleTracker({
 *      mousemove: false,   // don't track mousemove events
 *      limit: 120          // 120 second idle time limit before the app is reset
 *    });
 *    idleTracker.setXimpelApp(app);
 *
 * Idle time limits can also vary depending on the Ximpel content being displayed
 * by specifying a list of `rules` that match the 'id' attributes of the Ximpel subjects.
 * A use case is if you have some videos that are longer than the default idle time limit.
 * The user might watch the whole video without generating any activity measure.
 *
 * Example: Set the idle time limit to 300 seconds for all Ximpel subjects having
 * an 'id' attribute starting with "video:" (note that the pattern is a regexp):
 *
 *    var idleTracker = new IdleTracker({
 *      mousemove: false,
 *      limit: 120,
 *      rules: [
 *        {
 *          pattern: /^video:/,
 *          limit: 300
 *        }
 *      ]
 *    });
 *
 * Alternatively, the timer can be paused altogether by setting `pause: true`.
 * Then the timer will continue (from zero) once the Ximpel subject ends.
 *
 *    var idleTracker = new IdleTracker({
 *      mousemove: false,
 *      limit: 120,
 *      rules: [
 *        {
 *          pattern: /^video:/,
 *          pause: true
 *        }
 *      ]
 *    });
 *
 */
IdleTracker = function (options) {

  // Configuration
  this.options = options || {}
  this.options.limit = options.limit || 600;              // Timeout in seconds
  this.options.rules = options.rules || {};               // Special timeouts for Ximpel content
  this.options.tickInterval = options.tickInterval || 5;  // Number of seconds between each check
  this.options.click = (options.click !== undefined) ? options.click : true;              // reset on 'click' events
  this.options.mousemove = (options.mousemove !== undefined) ? options.mousemove : true;  // reset on 'mousemove' events

  // console.log('[IdleTracker] Initialize');
  // console.info('Tip of the day: idleTracker.stop(), idleTracker.start(), idleTracker.restart()');

  this.timer = null;
  this.idleTime = 0;
  this.currentSubject = null;
  this.app = null;
  this.analytics = null;

  // No need to call onActivity for *every* event. Only call it it's been
  // some time (1000 msecs) since last time.
  this.onActivityThrottled = this.onActivity.bind(this).throttle(1000);

  // Subscribe to click events so we can reset the idleTime when a click is made.
  // This won't register click events in iframes, so we need to subscribe to those
  // independently, see onIframeOpen below.
  if (this.options.mousemove) {
    window.addEventListener( 'mousemove', this.onActivityThrottled );
  }
  if (this.options.click) {
    // We listen to 'mousedown' and 'touchstart' rather than 'click' since these
    // also cover drags.
    window.addEventListener( 'mousedown', this.onActivityThrottled );
    window.addEventListener( 'touchstart', this.onActivityThrottled );
  }
}

/**
 * Set a reference to the Ximpel app, so we can subscribe to its events.
 */
IdleTracker.prototype.setXimpelApp = function (app) {
  this.app = app;

  // Subscribe to 'swipe' events from Ximpel
  app.ximpelPlayer.addEventHandler( 'swipe', this.onActivityThrottled );

  // Subscribe to 'subject_playing' events from Ximpel
  app.ximpelPlayer.addEventHandler( 'subject_playing', function( data ){
    this.currentSubject = data.subjectId;
  }.bind(this));

  // Subscribe to 'iframe_open' events from Ximpel
  app.ximpelPlayer.addEventHandler( 'iframe_open', this.onIframeOpen.bind(this) );

  // Should we also support the old iframe thing?
  // app.ximpelPlayer.sequencePlayer.mediaPlayer.addEventHandler( 'iframe_open', this.onIframeOpen.bind(this) );
}

/**
 * Set a reference to the Analytics/Microticks object, so we can subscribe to
 * its events. This is optional.
 */
IdleTracker.prototype.setAnalytics = function (analytics) {
  this.analytics = analytics;
}

/**
 * Stop the timer and reset the idle time to zero.
 */
IdleTracker.prototype.stop = function () {
  if (this.timer) {
    console.log( '[IdleTracker] Stopping' );
    clearTimeout(this.timer);
    this.timer = null;
    this.idleTime = 0;
  }
}

/**
 * Called whenever some activity is measured. Resets the idle time and starts
 * the timer if not started already.
 */
IdleTracker.prototype.onActivity = function (q) {
  console.log(q);
  if (this.timer) {
    clearTimeout(this.timer);
    this.timer = null;
    console.log( '[IdleTracker] Resetting' );
  } else {
    console.log( '[IdleTracker] Starting' );
  }

  this.idleTime = 0;
  this.tick();
}

/**
 * Reset the Ximpel app to its initial state.
 */
IdleTracker.prototype.resetXimpelApp = function () {

  if (this.analytics) {
    this.analytics.stopSession('timeout');
  }
  this.stop();

  if (this.app && $('.urlDisplay').length) {
    // Workaround to remove iframe that is not removed when calling app.stopPlayer()
    $('.urlDisplay').remove();
    this.app.ximpelPlayer.resume();
  }

  setTimeout(function() {
    this.app.stopPlayer();
    this.app.startPlayer();
  }.bind(this), 500);
}

/**
 * Update the idle time and check if it has surpassed the idle time limit.
 */
IdleTracker.prototype.tick = function () {
  clearTimeout(this.timer);  // just in case
  var localLimit = this.options.limit;
  var timerIsPaused = false;
  this.options.rules.forEach(function(rule) {
    if (this.currentSubject && this.currentSubject.match(rule.pattern)) {
      localLimit = rule.limit;
      if (rule.pause) {
        timerIsPaused = true;
      }
    }
  }.bind(this));
  if (timerIsPaused) {
    console.log('[IdleTracker] Timer is paused.');
    this.timer = setTimeout(this.tick.bind(this), this.options.tickInterval * 1000);
    return;
  }
  var timeLeft = localLimit - this.idleTime;
  if (timeLeft <= 0) {
    this.resetXimpelApp();
  } else {
    console.log('[IdleTracker] Waited ' + this.idleTime + ' of ' + localLimit, ' seconds.');
    this.timer = setTimeout(this.tick.bind(this), this.options.tickInterval * 1000);
  }

  // Update idle time
  this.idleTime += this.options.tickInterval;
}

/**
 * When an iframe is opened, we need to subscribe to the click events of that window.
 */
IdleTracker.prototype.onIframeOpen = function (data) {
  if (data.$iframe) {
    if (this.options.mousemove) {
      data.$iframe[0].contentWindow.addEventListener( 'mousemove', this.onActivityThrottled, true );
    }
    if (this.options.click) {
      data.$iframe[0].contentWindow.addEventListener( 'mousedown', this.onActivityThrottled, true );
      data.$iframe[0].contentWindow.addEventListener( 'touchstart', this.onActivityThrottled, true );
    }
  }
}
