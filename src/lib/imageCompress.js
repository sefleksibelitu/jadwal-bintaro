import imageCompression from 'browser-image-compression'

/**
 * Kompres gambar agar < 1MB.
 */
export async function compressImage(file) {
  const options = {
    maxSizeMB: 0.95,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.85,
  }
  try {
    return await imageCompression(file, options)
  } catch (err) {
    console.error('Compress error:', err)
    return file
  }
}
