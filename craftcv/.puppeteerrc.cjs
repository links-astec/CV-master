// Keep Puppeteer's Chrome inside the project folder. On Render the default cache
// (~/.cache/puppeteer) is filled at build time but is not kept for the running server,
// so Chrome was never found and PDFs fell back to an engine that broke the layouts.
const { join } = require('path');

module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
