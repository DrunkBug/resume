# 简历生成器

一个现代化的简历构建和导出工具，帮助用户快速创建、编辑和导出专业简历。

## 功能特点

- **简历编辑**: 直观的界面，轻松编辑个人信息和简历内容
- **模块化设计**: 支持添加、删除和重排简历模块
- **实时预览**: 即时查看简历编辑效果
- **PDF导出**: 一键导出高质量PDF简历
- **数据保存**: 支持保存和导入简历数据
- **响应式布局**: 适配不同设备屏幕尺寸

## 技术栈

- **前端框架**: Next.js
- **UI组件**: Shadcn UI
- **样式**: Tailwind CSS
- **PDF生成**: React-PDF
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

### 构建生产版本

```bash
pnpm build
```

## 项目结构

```
/
├── app/                    # Next.js应用目录
│   ├── globals.css         # 全局样式
│   ├── layout.tsx          # 布局组件
│   ├── page.tsx            # 主页面
│   └── pdf-preview/        # PDF预览页面
├── components/             # 组件目录
│   ├── ui/                 # UI基础组件
│   ├── resume-builder.tsx  # 简历构建器组件
│   ├── resume-preview.tsx  # 简历预览组件
│   ├── pdf-export-button.tsx # PDF导出按钮
│   ├── pdf-viewer.tsx      # PDF预览组件
│   └── ...
├── hooks/                  # 自定义Hook
├── lib/                    # 工具函数
│   ├── resume-utils.ts     # 简历相关工具函数
│   └── utils.ts            # 通用工具函数
├── public/                 # 静态资源
│   ├── demo.magic       # 示例简历数据
│   └── ...
├── styles/                 # 样式文件
│   ├── globals.css         # 全局样式
│   └── print-resume.css    # 打印样式
└── types/                  # 类型定义
    └── resume.ts           # 简历相关类型
```

## 简历数据格式

简历数据使用`.magic`格式保存，这是一个基于JSON的自定义格式。数据结构如下：

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

### PDF导出

使用React-PDF生成高质量PDF文件，支持中文字符自动换行和自定义样式。

### 数据导入导出

支持将简历数据导出为`.magic`文件，也可以从文件导入数据（json格式）。

## 自定义主题

项目使用Tailwind CSS进行样式管理，可以通过修改`tailwind.config.js`文件自定义主题颜色和其他样式。

## 许可证

MIT
