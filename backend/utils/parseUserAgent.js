const UAParser = require('ua-parser-js');

function parseUserAgent(uaString) {
  const parser = new UAParser(uaString);
  const result = parser.getResult();
  return {
    browser: result.browser.name || 'unknown',
    device: result.device.type || 'desktop',
    os: result.os.name || 'unknown',
  };
}

module.exports = { parseUserAgent };
