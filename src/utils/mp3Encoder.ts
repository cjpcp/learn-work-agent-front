/**
 * MP3 encoder utility
 * Loads lame.all.js as a script (avoids ESM bundling issues with MPEGMode)
 * lame.all.js wraps everything in `function lamejs()` — we execute it on load.
 */

let lameLoaded = false
let lameLoadPromise: Promise<void> | null = null

function loadLame(): Promise<void> {
  if (lameLoaded) return Promise.resolve()
  if (lameLoadPromise) return lameLoadPromise

  lameLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = '/lame.all.js'
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any
      // lame.all.js defines a global function `lamejs` — call it to populate Mp3Encoder
      if (typeof win.lamejs === 'function') {
        win.lamejs()
      }
      if (typeof win.lamejs?.Mp3Encoder !== 'function') {
        reject(new Error('lamejs.Mp3Encoder not available after load'))
        return
      }
      lameLoaded = true
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load /lame.all.js'))
    document.head.appendChild(script)
  })

  return lameLoadPromise
}

/**
 * Encode mono Float32 PCM samples to an MP3 Blob.
 */
export async function encodePcmToMp3(
  pcmFloat32: Float32Array,
  sampleRate: number,
  kbps = 128
): Promise<Blob> {
  await loadLame()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Mp3Encoder = (window as any).lamejs.Mp3Encoder

  const encoder = new Mp3Encoder(1, sampleRate, kbps)
  const blockSize = 1152
  const mp3Chunks: BlobPart[] = []

  // Float32 PCM → Int16
  const int16 = new Int16Array(pcmFloat32.length)
  for (let i = 0; i < pcmFloat32.length; i++) {
    int16[i] = Math.max(-32768, Math.min(32767, Math.round(pcmFloat32[i] * 32767)))
  }

  for (let i = 0; i < int16.length; i += blockSize) {
    const chunk = int16.subarray(i, i + blockSize)
    const encoded = encoder.encodeBuffer(chunk)
    if (encoded.length > 0) mp3Chunks.push(new Uint8Array(encoded))
  }
  const flushed = encoder.flush()
  if (flushed.length > 0) mp3Chunks.push(new Uint8Array(flushed))

  return new Blob(mp3Chunks, { type: 'audio/mp3' })
}
