// Metro (the app's bundler). The app reuses the website's code as it is, from ../craftcv/src:
// the CV renderer, its layouts, the example CVs and the interface dictionaries.
// The website's i18n/index.js is built on Vue, so when website code imports it, Metro hands it
// the app's own src/i18n/index.ts instead (same exports). Nothing in the website is changed.
const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

const WEB_SRC = path.resolve(__dirname, '../craftcv/src')
const APP_I18N = path.resolve(__dirname, 'src/i18n/index.ts')

config.watchFolders = [...(config.watchFolders || []), WEB_SRC]

// The CV fonts are bundled as files (assets/cv-fonts, see scripts/copy-cv-fonts.mjs)
if (!config.resolver.assetExts.includes('woff2')) config.resolver.assetExts.push('woff2')

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const fromWebsite = path.resolve(context.originModulePath).startsWith(WEB_SRC)
  const name = fromWebsite && /(^|\/)i18n\/index\.js$/.test(moduleName) ? APP_I18N : moduleName
  return context.resolveRequest(context, name, platform)
}

module.exports = config
