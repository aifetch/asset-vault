export async function compressImage(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('不是图片文件')
  }

  const bitmap = await createImageBitmap(file)
  const maxSize = 800
  const quality = 0.85

  let { width, height } = bitmap
  if (width > maxSize || height > maxSize) {
    const scale = Math.min(maxSize / width, maxSize / height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')

  if (!context) {
    bitmap.close()
    throw new Error('无法处理图片')
  }

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('压缩失败'))),
      'image/jpeg',
      quality
    )
  })
}
