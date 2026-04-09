import {
  Document, Page, Text, View, Image, StyleSheet, Font, Svg, Path, Circle, Rect, Line,
} from '@react-pdf/renderer'
import type { Quote, Template } from '../../types'
import { formatCurrency, formatDate } from '../../utils/quote'
import type { CompanySettings } from '../../stores/settingsStore'
import { HtmlText } from './HtmlText'

// ── Font registration ────────────────────────────────────────────────────────
// react-pdf only supports TTF/OTF — using direct TTF URLs from Google Fonts CDN
const GOOGLE_FONT_URLS: Record<string, { regular: string; bold: string }> = {
  Inter: {
    regular: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.ttf',
    bold:    'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.ttf',
  },
  Roboto: {
    regular: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf',
    bold:    'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc-.ttf',
  },
  Poppins: {
    regular: 'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrFJDUc1NECPY.ttf',
    bold:    'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7Z11lFc2_.ttf',
  },
  Lato: {
    regular: 'https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wWA.ttf',
    bold:    'https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVew8.ttf',
  },
  Montserrat: {
    regular: 'https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw0aXpsog.ttf',
    bold:    'https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM70w0aXpsog.ttf',
  },
  'Playfair Display': {
    regular: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQzA.ttf',
    bold:    'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKd3vUDQzA.ttf',
  },
}

const registeredFonts = new Set<string>()

function registerFont(fontFamily: string) {
  if (!fontFamily || registeredFonts.has(fontFamily)) return
  const urls = GOOGLE_FONT_URLS[fontFamily]
  if (!urls) return
  try {
    Font.register({
      family: fontFamily,
      fonts: [
        { src: urls.regular, fontWeight: 'normal' },
        { src: urls.bold, fontWeight: 'bold' },
      ],
    })
    registeredFonts.add(fontFamily)
  } catch {
    // silently fall back to Helvetica
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

// ── SVG Icons ────────────────────────────────────────────────────────────────
function IconInstagram() {
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24">
      <Rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="#6b7280" strokeWidth="2" fill="none" />
      <Circle cx="12" cy="12" r="4" stroke="#6b7280" strokeWidth="2" fill="none" />
      <Circle cx="17.5" cy="6.5" r="1" fill="#6b7280" />
    </Svg>
  )
}

function IconFacebook() {
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24">
      <Path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="#6b7280" strokeWidth="2" fill="none" />
    </Svg>
  )
}

function IconGlobe() {
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" stroke="#6b7280" strokeWidth="2" fill="none" />
      <Line x1="2" y1="12" x2="22" y2="12" stroke="#6b7280" strokeWidth="2" />
      <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#6b7280" strokeWidth="2" fill="none" />
    </Svg>
  )
}

// ── Component ────────────────────────────────────────────────────────────────
interface Props {
  quote: Quote
  template: Template
  company: CompanySettings
}

export function QuotePdf({ quote, template, company }: Props) {
  const fontFamily = company.fontFamily && company.fontFamily !== 'custom' ? company.fontFamily : ''
  const baseFont = fontFamily || 'Helvetica'
  const boldFont = fontFamily || 'Helvetica-Bold'

  const styles = StyleSheet.create({
    page: { fontFamily: baseFont, fontSize: 10, color: '#1f2937', paddingTop: 40, paddingBottom: 60, paddingHorizontal: 48 },
    headerWrap: { alignItems: 'center', marginBottom: 20 },
    companyName: { fontSize: 8, fontFamily: boldFont, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
    logo: { width: 64, height: 64, objectFit: 'contain', marginBottom: 4 },
    divider: { width: 32, borderBottomWidth: 2, borderBottomColor: '#111827', marginVertical: 12 },
    title: { fontSize: 16, fontFamily: boldFont, fontWeight: 'bold', textAlign: 'center' },
    scopeText: { fontSize: 9.5, color: '#374151', lineHeight: 1.6, marginBottom: 16 },
    table: { marginBottom: 16 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#111827' },
    tableHeaderCell: { color: '#ffffff', fontFamily: boldFont, fontWeight: 'bold', fontSize: 9, padding: 6, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#374151' },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    tableRowAlt: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#f9fafb' },
    tableCell: { fontSize: 9, padding: 6, color: '#374151', borderRightWidth: 1, borderRightColor: '#e5e7eb' },
    tableCellCenter: { fontSize: 9, padding: 6, color: '#374151', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#e5e7eb' },
    colActivity: { flex: 1 },
    colEstimate: { width: 72 },
    colStatus: { width: 96 },
    sectionTitle: { fontSize: 10, fontFamily: boldFont, fontWeight: 'bold', marginBottom: 6 },
    summaryRow: { flexDirection: 'row', marginBottom: 3 },
    bullet: { fontSize: 9, marginRight: 4, color: '#374151' },
    summaryLabel: { fontSize: 9, fontFamily: boldFont, fontWeight: 'bold', color: '#374151' },
    summaryValue: { fontSize: 9, color: '#374151' },
    totalsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, marginBottom: 16 },
    totalLabel: { fontSize: 11, fontFamily: boldFont, fontWeight: 'bold', marginRight: 32 },
    totalValue: { fontSize: 11, fontFamily: boldFont, fontWeight: 'bold' },
    conditionsText: { fontSize: 9.5, color: '#374151', lineHeight: 1.6 },
    footer: { position: 'absolute', bottom: 20, left: 48, right: 48, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    footerText: { fontSize: 8, color: '#6b7280', marginLeft: 4 },
  })

  const companyName = quote.companyName || company.name
  const companyLogo = quote.companyLogo || company.logo
  const showName = company.showNameOnHeader ?? true

  const totalHours = quote.items.reduce((s, i) => s + (i.estimateHours ?? i.quantity), 0)
  const rate = Number(quote.hourlyRate ?? 0)
  const grandTotal = rate > 0
    ? totalHours * rate
    : quote.items.reduce((s, i) => s + (i.estimateHours ?? i.quantity) * Number(i.unitPrice ?? 0), 0)

  const visibleBlocks = template.blocks.filter((b) => b.visible)
  const hasFooter = visibleBlocks.some((b) => b.type === 'footer')

  const instagram = company.instagram || `@${companyName.replace(/\s/g, '') || 'suaempresa'}`
  const facebook = company.facebook || `/${companyName.replace(/\s/g, '') || 'suaempresa'}`
  const website = company.website || `${companyName.replace(/\s/g, '') || 'suaempresa'}.com.br`

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {visibleBlocks.map((block) => {
          switch (block.type) {
            case 'header':
              return (
                <View key={block.id} style={styles.headerWrap}>
                  {showName && companyName ? <Text style={styles.companyName}>{companyName}</Text> : null}
                  {companyLogo ? (
                    (() => {
                      try { return <Image src={companyLogo} style={styles.logo} /> }
                      catch { return null }
                    })()
                  ) : null}
                  <View style={styles.divider} />
                  <Text style={styles.title}>
                    {(block.content ?? 'Orçamento – {{client_name}}')
                      .replace('{{client_name}}', quote.clientName || '[Cliente]')
                      .replace('{{date}}', formatDate(quote.date))}
                  </Text>
                </View>
              )

            case 'scope':
              return (quote.scope || block.content) ? (
                <HtmlText
                  key={block.id}
                  html={quote.scope || block.content || ''}
                  baseStyle={styles.scopeText}
                  boldFont={boldFont}
                />
              ) : null

            case 'items_table':
              return (
                <View key={block.id} style={styles.table}>
                  <View style={styles.tableHeader}>
                    <View style={[styles.tableHeaderCell, styles.colActivity]}><Text>Atividades</Text></View>
                    <View style={[styles.tableHeaderCell, styles.colEstimate]}><Text>Estimativas</Text></View>
                    <View style={[styles.tableHeaderCell, styles.colStatus, { borderRightWidth: 0 }]}><Text>Status</Text></View>
                  </View>
                  {quote.items.map((item, idx) => (
                    <View key={item.id} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                      <View style={[styles.tableCell, styles.colActivity]}><Text>{item.name || '—'}</Text></View>
                      <View style={[styles.tableCellCenter, styles.colEstimate]}><Text>{item.estimateHours != null ? `${item.estimateHours}h` : `${item.quantity}`}</Text></View>
                      <View style={[styles.tableCellCenter, styles.colStatus, { borderRightWidth: 0 }]}><Text>{item.itemStatus || 'Aguard. Aprovação'}</Text></View>
                    </View>
                  ))}
                </View>
              )

            case 'financial_summary':
              return (
                <View key={block.id} style={{ marginBottom: 16 }}>
                  <Text style={styles.sectionTitle}>Resumo financeiro</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.summaryLabel}>Estimativa total: </Text>
                    <Text style={styles.summaryValue}>{totalHours} hora{totalHours !== 1 ? 's' : ''}</Text>
                  </View>
                  {rate > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.summaryLabel}>Valor por hora: </Text>
                      <Text style={styles.summaryValue}>{formatCurrency(rate)}</Text>
                    </View>
                  )}
                  <View style={styles.summaryRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.summaryLabel}>Valor total estimado: </Text>
                    <Text style={styles.summaryValue}>{formatCurrency(grandTotal)}</Text>
                  </View>
                </View>
              )

            case 'totals':
              return (
                <View key={block.id} style={styles.totalsRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{formatCurrency(grandTotal)}</Text>
                </View>
              )

            case 'conditions':
              return (
                <View key={block.id} style={{ marginBottom: 16 }}>
                  <Text style={styles.sectionTitle}>Condições</Text>
                  <HtmlText
                    html={quote.conditions || block.content || 'O valor acima considera o escopo descrito neste documento.'}
                    baseStyle={styles.conditionsText}
                    boldFont={boldFont}
                  />
                </View>
              )

            case 'notes':
              return quote.notes ? (
                <View key={block.id} style={{ marginBottom: 16 }}>
                  <Text style={styles.sectionTitle}>Observações</Text>
                  <Text style={styles.conditionsText}>{quote.notes}</Text>
                </View>
              ) : null

            case 'signature':
              return (
                <View key={block.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 32 }}>
                  <View style={{ alignItems: 'center' }}>
                    <View style={{ width: 120, borderBottomWidth: 1, borderBottomColor: '#9ca3af', marginBottom: 4 }} />
                    <Text style={{ fontSize: 8, color: '#9ca3af' }}>Assinatura do Cliente</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <View style={{ width: 120, borderBottomWidth: 1, borderBottomColor: '#9ca3af', marginBottom: 4 }} />
                    <Text style={{ fontSize: 8, color: '#9ca3af' }}>Assinatura do Responsável</Text>
                  </View>
                </View>
              )

            default:
              return null
          }
        })}

        {hasFooter && (
          <View style={styles.footer} fixed>
            <View style={styles.footerItem}>
              <IconInstagram />
              <Text style={styles.footerText}>{instagram}</Text>
            </View>
            <View style={styles.footerItem}>
              <IconFacebook />
              <Text style={styles.footerText}>{facebook}</Text>
            </View>
            <View style={styles.footerItem}>
              <IconGlobe />
              <Text style={styles.footerText}>{website}</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  )
}
