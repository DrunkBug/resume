# 简历生成器

一个现代化的简历构建和导出工具，帮助用户快速创建、编辑和导出专业简历。已实现“所见即所得”的 PDF：优先用服务端 Chromium 渲染同一份 HTML/CSS（支持 CSS Grid），在不可用时自动降级到浏览器打印。

## 功能特点

- **简历编辑**: 直观的界面，轻松编辑个人信息和简历内容
- **模块化设计**: 支持添加、删除和重排简历模块
- **实时预览**: 即时查看简历编辑效果
- **PDF导出（WYSIWYG）**: 优先由服务端 Chromium 渲染同一份 HTML/CSS 生成干净 PDF；不可用时自动降级浏览器打印，并给出引导
- **数据保存**: 支持保存和导入简历数据
- **响应式布局**: 适配不同设备屏幕尺寸

## 技术栈

- **前端框架**: Next.js
- **UI组件**: Shadcn UI
- **样式**: Tailwind CSS
- **PDF生成**: puppeteer-core + @sparticuz/chromium（Serverless 友好）
- **图标**: Iconify

## 快速开始

### 安装依赖

```bash
# 使用pnpm安装依赖
pnpm install
```

### 开发环境运行

```bash
pnpm dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动。

本地如未安装 `puppeteer-core` 和 `@sparticuz/chromium`，将自动降级为浏览器打印；要在本地使用服务端 PDF，请安装：

```
pnpm add -S puppeteer-core @sparticuz/chromium
```

### 构建生产版本

```bash
pnpm build
```

## 项目结构

```
/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── print/page.tsx          # 打印专用页面（供 Chromium 渲染）
│   └── api/pdf/
│       ├── health/route.ts     # 健康检查（尝试启动 headless）
│       └── route.ts            # 生成 PDF（Puppeteer + Chromium）
├── components/
│   ├── resume-preview.tsx      # HTML 预览（PDF 与预览使用同一份）
│   └── pdf-viewer.tsx          # 自动选择：服务端 PDF 或浏览器打印
├── styles/
│   ├── globals.css
│   └── print.css               # 合并后的打印样式（单一来源）
├── public/
│   ├── NotoSansSC-Medium.ttf   # 字体（预览/打印共用）
│   └── ...
└── types/
    └── resume.ts
```

## 简历数据格式

简历数据使用`.re`格式保存，这是一个基于JSON的自定义格式。数据结构如下：

```typescript
interface MagicyanFile {
  version: string;
  data: ResumeData;
  metadata: {
    exportedAt: string;
    appVersion: string;
  }
}

interface ResumeData {
  title: string;
  personalInfo: PersonalInfoItem[];
  modules: ResumeModule[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 功能说明

### 个人信息编辑

支持添加、编辑和删除个人信息项，如姓名、电话、邮箱等。每个信息项可以设置标签、值和图标。

### 简历模块

支持多种类型的简历模块，如教育背景、工作经历、项目经验等。每个模块可以包含标题、副标题、时间范围和详细内容。

### PDF 导出（自动选择 B→A）

- 默认走方案 B：`/api/pdf` 使用 `puppeteer-core + @sparticuz/chromium` 打开 `/print?data=...`，设置 `displayHeaderFooter: false`、`printBackground: true`，输出干净 PDF。
- 若服务端不可用或失败，则自动降级为方案 A：浏览器打印（所见即所得）。界面会给出引导：
  - 关闭“页眉和页脚”
  - 勾选“背景图形”

环境变量（可选）：
- `NEXT_PUBLIC_FORCE_SERVER_PDF=true` 强制走服务端 PDF
- `NEXT_PUBLIC_FORCE_PRINT=true` 强制走浏览器打印

接口说明：
- `GET /api/pdf/health` 健康检查，能否启动 headless 浏览器
- `POST /api/pdf` 传入 `{ resumeData }` 返回 `application/pdf`

### 部署到 Vercel

- 仅支持 Node.js Runtime 的 Serverless Functions（不是 Edge）。
- 我们在 `route.ts` 中声明了 `export const runtime = 'nodejs'` 与 `dynamic = 'force-dynamic'`。
- 依赖：`puppeteer-core`、`@sparticuz/chromium`（Serverless 友好）。无需打包二进制。
- 建议在项目设置提升函数超时与内存（如 1024MB/1536MB）。

### 数据导入导出

支持将简历数据导出为`.re`文件，也可以从文件导入数据（json格式）。

## 自定义主题

项目使用Tailwind CSS进行样式管理，可以通过修改`tailwind.config.js`文件自定义主题颜色和其他样式。

## 许可证

MIT
