'use stict';

/**
 * Configuration for screenshots to take
 */
module.exports = [{
  url: 'http://vaillant-test.wwwfsq.vgoa.de/customers/',
  elements: {
    'hero': '.hero',
    'footer-campaign': '.site-footer .campaign'
  }
}, {
  url: 'http://vaillant-test.wwwfsq.vgoa.de/test-area-hands-off/products/all-products/index.da_dk.html',
  elements: {
    'facetnavigation': '.facet-navigation'
  }
}];
