import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const svg = readFileSync(resolve(__dirname, '../public/icons/icon.svg'))

const sizes = [16, 48, 128]

await Promise.all(
  sizes.map((size) =>
    sharp(svg)
      .resize(size, size)
      .png()
      .toFile(resolve(__dirname, `../public/icons/icon${size}.png`))
  )
)

console.log('Icons generated: icon16.png, icon48.png, icon128.png')
