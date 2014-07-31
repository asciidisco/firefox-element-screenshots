/** Config **/

// Your firefox binary
var firefoxBinary = '/Applications/Firefox.app/Contents/MacOS/firefox-bin';

// URL you want to open
var urlToCrawl = 'https://www.qivicon.com/';

// Elements 
// Key will be the filename (.png ext is added automatically)
// Value is the selector for that element
var elementsToCapture = {
  'siteSearch': '#site-search',
  'thatPartnerBar': '.partner-bar'
};

// Libs 
var Marionette = require('marionette-client');
var rimraf = require('rimraf');
var spawn = require('child_process').spawn;
var fs = require('fs');

var client, ffprocess;
var driver = new Marionette.Drivers.Tcp({});
var queue = Object.keys(elementsToCapture);

// write fresh firefox profile
var prefs = 'user_pref("browser.shell.checkDefaultBrowser", false);\n';
prefs += 'user_pref("marionette.contentListener", false);\n';
prefs += 'user_pref("marionette.defaultPrefs.enabled", true);\n';
prefs += 'user_pref("browser.shell.checkDefaultBrowser", false);\n';
prefs += 'user_pref("browser.sessionstore.resume_from_crash", false);\n';
prefs += 'user_pref("browser.bookmarks.restore_default_bookmarks", false);\n';
prefs += 'user_pref("marionette.defaultPrefs.port", "2828");\n';
fs.mkdirSync(__dirname + '/profile');
fs.writeFileSync(__dirname + '/profile/prefs.js', prefs);

// start firefox
ffprocess = spawn(firefoxBinary, ['-profile', __dirname + '/profile', '-marionette', '-turbo', '-no-remote', '-url', 'about:blank']);

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
      openUrl(urlToCrawl);
    });
  });
  
}, 1000);

// points the browser to an URL
// starts queue worker afterwards
var openUrl = function (_url) {
  console.log('[INFO]', 'Opening url:', _url);
  client.goUrl(_url, function (err, url) {
    if (err) {
       return kill();
    }
    
    // clear previously taken screenshots
    rimraf.sync(__dirname + '/shots');
    // rebuild shots dir
    fs.mkdirSync(__dirname + '/shots');
    
    popQueueDoScreenshot();
  });
};

// 
var popQueueDoScreenshot = function () {
  console.log('');
  if (!queue.length) {
    console.log('All done, thanks for watching!');
    return kill();
  }
  
  // Take queue items, FIFO
  var selectorKey = queue.shift();
  
  // Discover elements
  console.log('[INFO]', 'Fetching element:', elementsToCapture[selectorKey]);
  client.findElement(elementsToCapture[selectorKey], function (err, element) {
    if (err) {
      console.log('[ERR]', 'Failure loading Element:', elementsToCapture[selectorKey], 'Reason:', err);
      return kill();
    }
    
    // get screenshot
    client.screenshot({
      element: element
    }, function (err, raw) {
      if (err) {
        console.log('[ERR]', 'Failure loading screenshot:', selectorKey + '.png' ,' for ', elementsToCapture[selectorKey], 'Reason:', err);
        return kill();
      }
      
      // remove some shit from the base64 string
      var base64Data = raw.replace(/^data:image\/png;base64,/, '');
      console.log('[INFO]', 'Writing screenshot:', selectorKey + '.png' ,' for ', elementsToCapture[selectorKey]);
      
      // save da file
      fs.writeFile(__dirname + '/shots/' + selectorKey + '.png', base64Data, 'base64', function(err) {
        if (err) {
          console.log('[ERR]', 'Failure writing screenshot:', selectorKey + '.png' ,' for ', elementsToCapture[selectorKey], 'Reason:', err);
          return kill();
        }
        
        // RECURSION FTW!!!
        popQueueDoScreenshot();
      });
      
    });
  });
};

// closes the runner session
// clear profile
// kills the firefox process
var kill = function () {
  client.deleteSession();
  rimraf.sync(__dirname + '/profile');
  ffprocess.kill('SIGTERM');
};