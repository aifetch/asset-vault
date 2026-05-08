# 个人资产追踪

极简风格的个人资产追踪网页，以"每天成本"视角展示物品的使用价值。

把"贵"的物品转化为"每天划算"的视角，帮助你理解真实的持有成本。

## 在线部署

- Vercel: https://asset-vault-aifetch.vercel.app

## 功能

### 基础功能
- 物品增删改查（名称、分类、价格、购买日期、图片）
- 分类筛选（预设 6 个分类 + 自定义分类）
- 数据持久化到浏览器 IndexedDB，刷新不丢失
- 图片上传自动压缩（最大 800×800，JPEG 85%）
- 浅色/深色主题自动跟随系统

### 统计可视化
- 总资产 + 总日均成本概览
- 分类占比环形图（点击扇区联动筛选）
- 月度花费趋势柱状图（最近 12 个月）
- 物品总数 + 平均持有天数

### 数据管理
- 导出 JSON 完整备份（含图片 base64）
- 导出 CSV 纯文本（可用 Excel 打开）
- 导入 JSON 恢复数据（按 id 覆盖合并）

### 交互体验
- 搜索（按物品名称模糊匹配）
- 6 种排序方式（价格/日均/时间，正序倒序）
- 网格视图 / 列表视图切换
- 删除后 5 秒内可撤销（Undo Toast）
- 批量选择删除

### PWA 支持
- 可安装到桌面 / 主屏幕
- Service Worker 离线缓存
- 离线模式下所有功能可用
- 离线状态指示器

## 技术栈

- **Vue 3** + **TypeScript** + **Vite**
- **Chart.js**（按需引入，环形图 + 柱状图）
- **Vant**（移动端日期选择器）
- **@vuepic/vue-datepicker**（桌面端日期选择器）
- **IndexedDB**（本地数据持久化）
- **Service Worker**（PWA 离线缓存）

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
src/
├── main.ts              # 入口，挂载 Vue，注册 Service Worker
├── App.vue              # 根组件
├── types/asset.ts       # 数据模型（AssetItem, AssetDraft）
├── composables/
│   └── useAssets.ts     # 核心状态管理（筛选/排序/搜索/撤销/批量）
├── lib/
│   ├── db.ts            # IndexedDB 封装
│   ├── format.ts        # 格式化工具（金额/日期/天数）
│   ├── image.ts         # 图片压缩
│   ├── chart-theme.ts   # Chart.js 主题配置
│   └── export.ts        # 导入导出逻辑
├── components/          # 14 个 Vue 组件
└── styles/
    └── theme.css        # 全局样式（CSS 变量驱动浅色/深色主题）
```

## 浏览器要求

Chrome / Edge / Safari 最近 2 年版本。使用了以下现代 API：

- `<dialog>` 元素
- `crypto.randomUUID()`
- CSS Grid
- IndexedDB
- Service Worker

## 设计风格

参考 Apple 官网 / Apple Store App 设计语言：

- 超大留白，用阴影和间距区分层级，不用硬边框
- 数字是视觉主角（tabular-nums 对齐）
- 圆角：卡片 24px、弹窗 20px、按钮/标签 999px（胶囊）
- 微交互：卡片 hover 上浮 + 阴影加深
- 响应式：手机单列 → 平板 2 列 → 桌面 3 列 → 宽屏 4 列
