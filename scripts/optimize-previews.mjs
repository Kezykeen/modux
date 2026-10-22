/**
 * Convert leftover UI PNG/JPG stills to WebP at display size, then delete the source.
 * Catalog stills live as .webp; drop a PNG or JPG in Renders/ and re-run this.
 */
import { readdir, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rendersDir = path.join(root, 'public/assets/Renders')
const magneticPng = path.join(root, 'public/magnetic.png')

const PREVIEW = { max: 512, quality: 90 }
const MAGNETIC = { max: 640, quality: 90 }

async function toWebp(src, dest, { max, quality }) {
  await sharp(src)
    .resize(max, max, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality, alphaQuality: quality, effort: 6 })
    .toFile(dest)
}

const files = (await readdir(rendersDir)).filter((name) => /\.(png|jpe?g)$/i.test(name))
for (const name of files) {
  const src = path.join(rendersDir, name)
  const dest = path.join(rendersDir, name.replace(/\.(png|jpe?g)$/i, '.webp'))
  await toWebp(src, dest, PREVIEW)
  await unlink(src)
  console.log('wrote', path.relative(root, dest), '(removed source)')
}

try {
  await toWebp(magneticPng, path.join(root, 'public/magnetic.webp'), MAGNETIC)
  console.log('wrote public/magnetic.webp')
} catch (error) {
  const missing = error.code === 'ENOENT' || String(error.message).includes('Input file is missing')
  if (!missing) throw error
}

if (files.length === 0) console.log('no render PNG/JPG files to convert')
