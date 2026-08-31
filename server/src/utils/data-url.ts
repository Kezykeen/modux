const DATA_URL_RE = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+=*)$/

export function parseImageDataUrl(dataUrl: string): { buffer: Buffer; contentType: string } {
  const match = DATA_URL_RE.exec(dataUrl.trim())
  if (!match) {
    throw new Error('Invalid image data URL')
  }
  const contentType = match[1]
  const buffer = Buffer.from(match[2], 'base64')
  return { buffer, contentType }
}

export function extensionForMime(mime: string): string {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}
