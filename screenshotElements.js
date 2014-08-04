/**
 * Config
 */

// Your firefox binary
var firefoxBinary = '/Applications/Firefox.app/Contents/MacOS/firefox-bin';

// Folder for screenshots
var screenshotFolder = 'shots';

var elementsToCapture = {
  'siteSearch': '#site-search',
  'thatPartnerBar': '.partner-bar'
};

// Load configuration
var screenshotsConfig = require('./screenshots.config');

// Libs
var Marionette = require('marionette-client');
var rimraf = require('rimraf');
var spawn = require('child_process').spawn;
var fs = require('fs');

var client;
var ffprocess;
var driver = new Marionette.Drivers.Tcp({});

/**
 * Preferences for Firefox Profile
 */
var prefs = '' +
    'user_pref("browser.shell.checkDefaultBrowser", false);\n' +
    'user_pref("marionette.contentListener", false);\n' +
    'user_pref("marionette.defaultPrefs.enabled", true);\n' +
    'user_pref("browser.shell.checkDefaultBrowser", false);\n' +
    'user_pref("browser.sessionstore.resume_from_crash", false);\n' +
    'user_pref("browser.bookmarks.restore_default_bookmarks", false);\n' +
    'user_pref("marionette.defaultPrefs.port", "2828");\n';

fs.mkdirSync(__dirname + '/profile');
fs.writeFileSync(__dirname + '/profile/prefs.js', prefs);

// Start Firefox process
ffprocess = spawn(firefoxBinary, [
  '-profile',
  __dirname + '/profile',
  '-marionette',
  '-turbo',
  '-no-remote',
  '-url',
  'about:blank'
]);

// cheap fix for firefox startup time
// we could listen on to the stdout, but lets not over complicate things
// on slow machines, plaease tweak to suit your needs
setTimeout(function () {

  // connect to the marionette driver
  driver.connect(function(err) {
    if (err) {
      console.log(err);
      return;
    }

    // strat a client session
    client = new Marionette.Client(driver, {});
    client.startSession(function () {

      // Rebuild shots dir
      if (!fs.exists(__dirname + '/' + screenshotFolder)) {
        fs.mkdirSync(__dirname + '/' + screenshotFolder);
      }

      // Clear previously taken screenshots
      rimraf.sync(__dirname + '/' + screenshotFolder);

      openAndScreenshot(0);
    });
  });
}, 1000);

// Points the browser to an URL and starts queue worker afterwards
var openUrl = function (page, callback) {
  console.log('[INFO]', 'Opening url:', page.url);

  client.goUrl(page.url, function (err) {
    var queue = Object.keys(page.elements);

    if (err) {
       return kill();
    }

    popQueueDoScreenshot(page.elements, queue, callback);
  });
};

//
var popQueueDoScreenshot = function (elements, queue, callback) {

  // Done when ther is nothing to do anymore
  if (!queue.length) {
    callback();
  }

  // Take queue items, FIFO
  var selectorKey = queue.shift();

  // Discover elements
  console.log('[INFO]', 'Fetching element:', elements[selectorKey]);

  client.findElement(elements[selectorKey], function (err, element) {

    if (err) {
      console.log('[ERR]', 'Failure loading Element:', elements[selectorKey], 'Reason:', err);

      return;
    }

    // Get screenshot
    client.screenshot({
      element: element
    }, function (err, raw) {

      if (err) {
        console.log('[ERR]', 'Failure loading screenshot:', selectorKey + '.png' ,' for ', elements[selectorKey], 'Reason:', err);

        return;
      }

      // remove some shit from the base64 string
      var base64Data = raw.replace(/^data:image\/png;base64,/, '');

      console.log('[INFO] Writing screenshot:', __dirname + '/' + screenshotFolder + '/' + selectorKey + '.png' ,' for ', elements[selectorKey]);

      // Save file
      fs.writeFile(__dirname + '/' + screenshotFolder + '/' + selectorKey + '.png', base64Data, 'base64', function (err) {
        if (err) {
          console.log('[ERR]', 'Failure writing screenshot:', selectorKey + '.png' ,' for ', elements[selectorKey], 'Reason:', err);

          return;
        }

        // Recurstion
        popQueueDoScreenshot(elements, queue, callback);
      });

    });
  });
};


// Interate through all elements in screenshots configuration
var pagesToOpen = screenshotsConfig.length;

var openAndScreenshot = function (iteration) {

  var pageToOpen = screenshotsConfig[iteration];

  if (pagesToOpen === iteration) {
    console.log('All done, thanks for watching!');

    return kill();
  }

  openUrl(pageToOpen, function () {
    iteration++;
    openAndScreenshot(iteration);
  });

};

/**
 * closes the runner session, clear profile, kills the firefox process
 */
var kill = function () {
  client.deleteSession();
  rimraf.sync(__dirname + '/profile');
  ffprocess.kill('SIGTERM');
};
