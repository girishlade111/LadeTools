import fs from "fs";
import path from "path";
import zlib from "zlib";

// CRC32 implementation for standard PNG chunks
function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[n] = c >>> 0;
  }
  return table;
}

const crcTable = makeCrcTable();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, toCrc, crcBuf]);
}

function generatePng(width, height, isMaskable = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdrChunk = createChunk("IHDR", ihdrData);

  // Scanlines with RGBA pixels
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * (isMaskable ? 0.5 : 0.44);
  const innerRadius = radius * 0.72;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData.writeUInt8(0, rowOffset); // filter type: 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gradient color calculations
      const t = (x + y) / (width + height);
      let r = Math.round(59 * (1 - t) + 139 * t);
      let g = Math.round(130 * (1 - t) + 92 * t);
      let b = Math.round(246 * (1 - t) + 246 * t);
      let a = 255;

      if (!isMaskable) {
        // Rounded squircle / circular border
        const cornerDist = Math.max(Math.abs(dx), Math.abs(dy));
        if (cornerDist > radius) {
          a = 0; // Transparent background corners
        }
      }

      // Draw central glyph accent (Wrench / Brackets representation)
      if (a > 0 && dist < innerRadius) {
        // Inner glyph highlight
        const isCenterBar = Math.abs(dx + dy) < width * 0.08 && dist < innerRadius * 0.8;
        const isBracketLeft = Math.abs(dx + innerRadius * 0.45) < width * 0.04 && Math.abs(dy) < height * 0.28;
        const isBracketRight = Math.abs(dx - innerRadius * 0.45) < width * 0.04 && Math.abs(dy) < height * 0.28;

        if (isCenterBar || isBracketLeft || isBracketRight) {
          r = 255;
          g = 255;
          b = 255;
        }
      }

      rawData.writeUInt8(r, pxOffset);
      rawData.writeUInt8(g, pxOffset + 1);
      rawData.writeUInt8(b, pxOffset + 2);
      rawData.writeUInt8(a, pxOffset + 3);
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk("IDAT", compressedData);
  const iendChunk = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve("./public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, "pwa-192x192.png"), generatePng(192, 192, false));
fs.writeFileSync(path.join(publicDir, "pwa-512x512.png"), generatePng(512, 512, false));
fs.writeFileSync(path.join(publicDir, "maskable-icon-512x512.png"), generatePng(512, 512, true));
fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), generatePng(180, 180, false));

console.log("Successfully generated all PWA icons in public/ directory.");
