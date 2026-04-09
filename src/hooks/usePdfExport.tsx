import { pdf, Font } from '@react-pdf/renderer'
import { QuotePdf } from '../components/pdf/QuotePdf'
import type { Quote, Template } from '../types'
import type { CompanySettings } from '../stores/settingsStore'

// TTF URLs from Google Fonts GitHub raw — guaranteed TTF format
const FONT_TTF: Record<string, { regular: string; bold: string }> = {
  Inter: {
    regular: 'https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf',
    bold: 'https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf',
  },
  Roboto: {
    regular: 'https://raw.githubusercontent.com/google/fonts/main/apache/roboto/Roboto-Regular.ttf',
    bold: 'https://raw.githubusercontent.com/google/fonts/main/apache/roboto/Roboto-Bold.ttf',
  },
  Poppins: {
    regular: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Regular.ttf',
    bold: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf',
  },
  Lato: {
    regular: 'https://raw.githubusercontent.com/google/fonts/main/ofl/lato/Lato-Regular.ttf',
    bold: 'https://raw.githubusercontent.com/google/fonts/main/ofl/lato/Lato-Bold.ttf',
  },
  Montserrat: {
    regular: 'https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf',
    bold: 'https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf',
  },
  'Playfair Display': {
    regular: 'https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf',
    bold: 'https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf',
  },
}

const registered = new Set<string>()

async function fetchFontAsBlob(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch font: ${url}`)
  const blob = await res.blob()
  // Validate it's actually a font file (not HTML error page)
  if (!blob.type.includes('font') && !blob.type.includes('octet') && !blob.type.includes('binary')) {
    const text = await blob.text()
    if (text.startsWith('<!') || text.startsWith('<h')) {
      throw new Error(`URL returned HTML instead of font: ${url}`)
    }
  }
  return URL.createObjectURL(blob)
}

async function ensureFont(fontFamily: string) {
  if (!fontFamily || fontFamily === 'custom' || registered.has(fontFamily)) return
  const urls = FONT_TTF[fontFamily]
  if (!urls) return
  try {
    const [regular, bold] = await Promise.all([
      fetchFontAsBlob(urls.regular),
      fetchFontAsBlob(urls.bold),
    ])
    Font.register({
      family: fontFamily,
      fonts: [
        { src: regular, fontWeight: 'normal' },
        { src: bold, fontWeight: 'bold' },
      ],
    })
    registered.add(fontFamily)
  } catch (e) {
    console.warn(`Failed to load font ${fontFamily}:`, e)
  }
}

async function fetchImageAsBase64(url: string): Promise<string> {
  const CORE_URL = import.meta.env.VITE_CORE_URL ?? 'http://localhost:9000'
  const token = localStorage.getItem('budget-token')

  // Try direct fetch first
  try {
    const res = await fetch(url)
    if (res.ok) {
      const blob = await res.blob()
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = () => resolve('')
        reader.readAsDataURL(blob)
      })
    }
  } catch {
    // fall through to proxy
  }

  // Fallback: use backend proxy to avoid CORS
  try {
    const proxyUrl = `${CORE_URL}/api/image-proxy?url=${encodeURIComponent(url)}`
    const res = await fetch(proxyUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) return ''
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve('')
      reader.readAsDataURL(blob)
    })
  } catch {
    return ''
  }
}

export async function exportPdf(
  quote: Quote,
  template: Template,
  company: CompanySettings,
  filename = 'orcamento.pdf'
) {
  if (company.fontFamily && company.fontFamily !== 'custom') {
    await ensureFont(company.fontFamily)
  }

  // Convert logo to base64 — works for both URLs and existing base64
  const logoSrc = quote.companyLogo || company.logo
  let resolvedLogo = ''
  if (logoSrc) {
    if (logoSrc.startsWith('data:')) {
      resolvedLogo = logoSrc
    } else {
      resolvedLogo = await fetchImageAsBase64(logoSrc)
    }
  }

  const resolvedQuote = { ...quote, companyLogo: resolvedLogo }
  const resolvedCompany = { ...company, logo: resolvedLogo }

  const blob = await pdf(
    <QuotePdf quote={resolvedQuote} template={template} company={resolvedCompany} />
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
