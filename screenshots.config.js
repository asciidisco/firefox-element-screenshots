'use stict';

/**
 * Configuration for screenshots to take
 */
module.exports = [{
  url: 'https://www.google.de/',
  elements: {
    'search': '.gb_Vb',
    '_fq _nf': '._fq._nf'
  }
}, {
  url: 'http://drublic.de/',
  elements: {
    'navigation': '.site-navigation'
  }
}];
