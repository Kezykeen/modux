/**
 * Convert any leftover UI PNGs to WebP at display size.
 * Catalog stills live as .webp; drop a PNG in Renders/ and re-run this.
 */
import { readdir } from 'node:fs/promises'
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

const files = (await readdir(rendersDir)).filter((name) => name.endsWith('.png'))
for (const name of files) {
  const src = path.join(rendersDir, name)
  const dest = path.join(rendersDir, name.replace(/\.png$/i, '.webp'))
  await toWebp(src, dest, PREVIEW)
  console.log('wrote', path.relative(root, dest))
}

try {
  await toWebp(magneticPng, path.join(root, 'public/magnetic.webp'), MAGNETIC)
  console.log('wrote public/magnetic.webp')
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

if (files.length === 0) console.log('no render PNGs to convert')
