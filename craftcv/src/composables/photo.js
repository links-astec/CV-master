// A picture file → a small square JPEG (data URL), centred crop. Profile pictures are kept small so
// they travel with the account (sidebar avatar) and fill new CVs without making them heavy.
export function resizePhoto(file, size = 400, quality = 0.86) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) return reject(new Error('Please choose a JPG, PNG or WEBP picture.'))
    if (file.size > 10 * 1024 * 1024) return reject(new Error('That picture is too large (over 10 MB).'))
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight)
      const c = document.createElement('canvas'); c.width = c.height = size
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That picture could not be read.')) }
    img.src = url
  })
}
