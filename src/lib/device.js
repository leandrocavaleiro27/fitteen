/** Detect mobile/touch devices for camera-only food scan */
export function isMobileDevice() {
  if (typeof window === 'undefined') return false

  const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const narrow = window.matchMedia('(max-width: 768px)').matches
  const mobileUa = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)

  return (touch && narrow) || mobileUa
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      const base64 = result.split(',')[1]
      resolve({ base64, mimeType: file.type || 'image/jpeg' })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
