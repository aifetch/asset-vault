import {
  Chart,
  DoughnutController,
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js'

Chart.register(
  DoughnutController,
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
)

const CHART_COLORS = [
  '#0071e3', '#34c759', '#ff9500', '#ff3b30',
  '#af52de', '#5ac8fa', '#ffcc00', '#30b0c7',
  '#64d2ff', '#ff6482'
]

export function getChartColors(count: number) {
  return CHART_COLORS.slice(0, count)
}

export const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 300 },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle',
        font: { size: 12, family: '-apple-system, "SF Pro Text", "PingFang SC", sans-serif' }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(29, 29, 31, 0.9)',
      titleFont: { size: 13, family: '-apple-system, "PingFang SC", sans-serif' },
      bodyFont: { size: 12, family: '-apple-system, "PingFang SC", sans-serif' },
      padding: 10,
      cornerRadius: 10,
      displayColors: true,
      boxPadding: 4
    }
  }
}
