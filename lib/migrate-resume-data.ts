import type { ResumeModule, ModuleContentRow, ModuleContentElement } from "@/types/resume"

/**
 * 旧的简历模块结构（用于类型检查）
 */
interface LegacyResumeModule {
  id: string
  title: string
  subtitle?: string
  timeRange?: string
  content: string
  icon?: string
  order: number
}

/**
 * 生成唯一ID
 */
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

/**
 * 将旧的简历模块迁移到新结构
 */
export function migrateModule(legacyModule: LegacyResumeModule): ResumeModule {
  const rows: ModuleContentRow[] = []
  let rowOrder = 0

  // 如果有subtitle或timeRange，创建第一行（3列布局）
  if (legacyModule.subtitle || legacyModule.timeRange) {
    const elements: ModuleContentElement[] = []

    // 左列：subtitle
    elements.push({
      id: generateId(),
      type: 'text',
      segments: [{
        id: generateId(),
        text: legacyModule.subtitle || '',
        style: {}
      }],
      columnIndex: 0,
      align: 'left',
    })

    // 中列：空
    elements.push({
      id: generateId(),
      type: 'text',
      segments: [{
        id: generateId(),
        text: '',
        style: {}
      }],
      columnIndex: 1,
      align: 'center',
    })

    // 右列：timeRange
    elements.push({
      id: generateId(),
      type: 'text',
      segments: [{
        id: generateId(),
        text: legacyModule.timeRange || '',
        style: { color: '#0066cc' }
      }],
      columnIndex: 2,
      align: 'right',
    })

    rows.push({
      id: generateId(),
      columns: 3,
      elements,
      order: rowOrder++,
    })
  }

  // 如果有content，创建内容行（1列布局）
  if (legacyModule.content) {
    // 将content按行分割
    const contentLines = legacyModule.content.split('\n').filter(line => line.trim())

    contentLines.forEach(line => {
      // 检测是否是列表项（以 • 或数字开头）
      const isBulletList = line.trim().startsWith('•') || line.trim().startsWith('-')
      const isNumberedList = /^\d+\./.test(line.trim())

      const cleanText = line
        .replace(/^[•\-]\s*/, '')  // 移除 • 或 -
        .replace(/^\d+\.\s*/, '')  // 移除数字列表标记
        .trim()

      const element: ModuleContentElement = {
        id: generateId(),
        type: isBulletList ? 'bullet-list' : isNumberedList ? 'numbered-list' : 'text',
        segments: [{
          id: generateId(),
          text: cleanText,
          style: {}
        }],
        columnIndex: 0,
        align: 'left',
      }

      rows.push({
        id: generateId(),
        columns: 1,
        elements: [element],
        order: rowOrder++,
      })
    })
  }

  return {
    id: legacyModule.id,
    title: legacyModule.title,
    icon: legacyModule.icon,
    order: legacyModule.order,
    rows,
  }
}

/**
 * 批量迁移简历模块
 */
export function migrateModules(legacyModules: any[]): ResumeModule[] {
  return legacyModules.map(module => {
    // 检查是否已经是新格式
    if ('rows' in module && Array.isArray(module.rows)) {
      return module as ResumeModule
    }
    // 否则进行迁移
    return migrateModule(module as LegacyResumeModule)
  })
}

/**
 * 检查模块是否是旧格式
 */
export function isLegacyModule(module: any): boolean {
  return 'content' in module && !('rows' in module)
}
