export function formatMoney(value: number) {
  const rounded = Math.round(value * 100) / 100
  if (rounded === Math.round(rounded)) {
    return Math.round(rounded).toLocaleString('zh-CN')
  }

  return rounded.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export function formatDaily(value: number) {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export function calcDays(dateStr: string) {
  const purchaseDate = new Date(`${dateStr}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((today.getTime() - purchaseDate.getTime()) / 86400000))
}

export function todayString() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function formatDisplayDate(value: string) {
  if (!value) return '请选择购买日期'
  const [year, month, day] = value.split('-')
  return `${year} 年 ${month} 月 ${day} 日`
}
