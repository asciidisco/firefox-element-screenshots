# firefox-element-screenshots

> Screenshots single elements from Webpages

## Setup

`$ npm install` and you´re good to go.

## Configuration

This is the configuration that is on the top of the `screenshotElements.js` file.
Modify this.

```js
// Your firefox binary (this is the default on OSX)
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
```

## Run

> Important: The script itself needs to start Firefox, it must be closed. The script dies if FF is already open!

`$ node screenshotElements.js`

Screenshots will end up in the `shots` subdirectory.
