// CV fonts for previews, from files inside the app (no internet needed). Like the server does
// for PDFs, only the families a CV actually names are embedded, and each family is read once.
import { Asset } from 'expo-asset'
import { File } from 'expo-file-system'
import { CV_FONT_FILES } from '@/lib/cvFontFiles'

const cache = new Map<string, Promise<string>>()

function familyCss(family: string): Promise<string> {
  let p = cache.get(family)
  if (!p) {
    p = Promise.all(CV_FONT_FILES[family].map(async f => {
      const asset = Asset.fromModule(f.file)
      await asset.downloadAsync()
      const b64 = await new File(asset.localUri!).base64()
      return `@font-face{font-family:'${family}';font-weight:${f.weight};font-style:${f.style};src:url(data:font/woff2;base64,${b64}) format('woff2');font-display:block;}`
    })).then(faces => faces.join(''))
    p.catch(() => cache.delete(family))   // try again next time if a file couldn't be read
    cache.set(family, p)
  }
  return p
}

// <style> with the @font-face rules for the fonts this CV's HTML uses
export async function fontCssFor(html: string): Promise<string> {
  const used = Object.keys(CV_FONT_FILES).filter(f => f === 'DM Sans' || html.includes(f))
  const css = await Promise.all(used.map(f => familyCss(f).catch(() => '')))
  return `<style>${css.join('')}</style>`
}
