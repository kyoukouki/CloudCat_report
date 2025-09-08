export function toCSV(rows) {
  if (!rows || !rows.length) return ''
  const keys = Object.keys(rows[0])
  const esc = (v) => {
    if (v === null || v === undefined) return ''
    const s = String(v).replaceAll('"', '""')
    return /[",\n]/.test(s) ? `"${s}"` : s
  }
  const header = keys.join(',')
  const body = rows.map(r => keys.map(k => esc(r[k])).join(',')).join('\n')
  return header + '\n' + body
}
export function download(name, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name; a.click()
  URL.revokeObjectURL(url)
}
