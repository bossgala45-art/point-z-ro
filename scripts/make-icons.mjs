// Génère les icônes PNG de l'appli (un anneau avec un point au centre), sans dépendance.
import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const BG = [14, 16, 20]
const RING = [127, 184, 164]
const DOT = [233, 230, 223]

function crc32(buf) {
  let c, crc = 0xffffffff
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    crc = (crc >>> 8) ^ c
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}

function mix(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t))
}

function icon(size) {
  const raw = Buffer.alloc((size * 3 + 1) * size)
  const c = size / 2
  const ringR = size * 0.27
  const ringW = size * 0.09
  const dotR = size * 0.07
  const ss = 4 // suréchantillonnage pour des bords lisses
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0
    for (let x = 0; x < size; x++) {
      let ring = 0, dot = 0
      for (let sy = 0; sy < ss; sy++) for (let sx = 0; sx < ss; sx++) {
        const d = Math.hypot(x + (sx + 0.5) / ss - c, y + (sy + 0.5) / ss - c)
        if (Math.abs(d - ringR) <= ringW / 2) ring++
        else if (d <= dotR) dot++
      }
      let col = mix(BG, RING, ring / (ss * ss))
      col = mix(col, DOT, dot / (ss * ss))
      const o = y * (size * 3 + 1) + 1 + x * 3
      raw[o] = col[0]; raw[o + 1] = col[1]; raw[o + 2] = col[2]
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
  writeFileSync(new URL(`../public/${name}`, import.meta.url), icon(size))
}
console.log('Icônes générées dans public/')
