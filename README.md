# firefox-element-screenshots

> Screenshots single elements from Webpages

## Setup

`$ npm install` and you´re good to go.

## Configuration

You can configure the pages and elements you want to screenshots within
`screenshots.config.js`.

Each page needs an object within the export of the module which looks like this:

```js
{
  url: 'http://drublic.de/',
  elements: {
    'navigation': '.site-navigation'
  }
}
```

This is the configuration that is on the top of the `screenshotElements.js` file.
Please modify it if needed.

```js
// Your firefox binary (this is the default on OSX)
var firefoxBinary = '/Applications/Firefox.app/Contents/MacOS/firefox-bin';

// Folder for screenshots
var screenshotFolder = 'shots';
```

## Run

> Important: The script itself needs to start Firefox, it must be closed. The script dies if FF is already open!

`$ node screenshotElements.js`

Screenshots will end up in the `shots` subdirectory.
