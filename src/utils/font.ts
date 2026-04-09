export function injectFont(fontUrl: string, fontFamily: string) {
  // Remove existing
  const existing = document.getElementById('custom-font-link')
  if (existing) existing.remove()

  if (!fontUrl || !fontFamily) return

  const link = document.createElement('link')
  link.id = 'custom-font-link'
  link.rel = 'stylesheet'
  link.href = fontUrl
  document.head.appendChild(link)
}

export function applyFontToBody(fontFamily: string) {
  if (fontFamily && fontFamily !== 'custom') {
    document.documentElement.style.setProperty('--app-font', `"${fontFamily}", sans-serif`)
  } else {
    document.documentElement.style.removeProperty('--app-font')
  }
}
