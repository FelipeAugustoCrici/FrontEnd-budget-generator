import { Text } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'

interface Segment {
  text: string
  bold: boolean
  italic: boolean
  underline: boolean
}

function parseHtml(html: string): Segment[] {
  const segments: Segment[] = []
  // Replace block tags with newlines
  const normalized = html
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

  // Simple state machine
  const tagRe = /<(\/?)(\w+)[^>]*>/g
  let last = 0
  let bold = false
  let italic = false
  let underline = false

  let match: RegExpExecArray | null
  while ((match = tagRe.exec(normalized)) !== null) {
    const before = normalized.slice(last, match.index)
    if (before) segments.push({ text: before, bold, italic, underline })
    last = match.index + match[0].length

    const closing = match[1] === '/'
    const tag = match[2].toLowerCase()

    if (tag === 'strong' || tag === 'b') bold = !closing
    else if (tag === 'em' || tag === 'i') italic = !closing
    else if (tag === 'u') underline = !closing
  }

  const remaining = normalized.slice(last).replace(/<[^>]*>/g, '')
  if (remaining) segments.push({ text: remaining, bold, italic, underline })

  return segments.filter((s) => s.text)
}

interface Props {
  html: string
  baseStyle: Style
  boldFont: string
}

export function HtmlText({ html, baseStyle, boldFont }: Props) {
  const segments = parseHtml(html)

  return (
    <Text style={baseStyle}>
      {segments.map((seg, i) => {
        const style: Style = {}
        if (seg.bold) { style.fontFamily = boldFont; style.fontWeight = 'bold' }
        if (seg.italic) style.fontStyle = 'italic'
        if (seg.underline) style.textDecoration = 'underline'
        return (
          <Text key={i} style={style}>
            {seg.text}
          </Text>
        )
      })}
    </Text>
  )
}
