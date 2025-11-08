"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Icon } from "@iconify/react"
import type { TextStyle } from "@/types/resume"

// 支持的字体列表
const FONT_FAMILIES = [
  { value: 'Microsoft YaHei', label: '微软雅黑' },
  { value: 'SimSun', label: '宋体' },
  { value: 'SimHei', label: '黑体' },
  { value: 'KaiTi', label: '楷体' },
  { value: 'FangSong', label: '仿宋' },
  { value: 'PingFang SC', label: '苹方' },
  { value: 'Heiti SC', label: '黑体-简' },
  { value: 'STSong', label: '华文宋体' },
  { value: 'STKaiti', label: '华文楷体' },
  { value: 'STFangsong', label: '华文仿宋' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Calibri', label: 'Calibri' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Consolas', label: 'Consolas' },
  { value: 'Monaco', label: 'Monaco' },
]

// 支持的字号列表
const FONT_SIZES = [9, 10, 10.5, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36]

// 预设颜色
const PRESET_COLORS = [
  '#000000', '#333333', '#666666', '#999999',
  '#d73a49', '#e36209', '#f9c513', '#28a745',
  '#0366d6', '#6f42c1', '#ea4aaa', '#ffffff',
]

interface RichTextToolbarProps {
  currentStyle: Partial<TextStyle>
  onApplyStyle: (key: keyof TextStyle, value: any) => void
  onAlignChange?: (align: 'left' | 'center' | 'right' | 'justify') => void
  onListChange?: (type: 'bullet-list' | 'numbered-list' | null) => void
  currentAlign?: 'left' | 'center' | 'right' | 'justify'
  currentListType?: 'bullet-list' | 'numbered-list' | null
}

export default function RichTextToolbar({
  currentStyle,
  onApplyStyle,
  onAlignChange,
  onListChange,
  currentAlign = 'left',
  currentListType = null,
}: RichTextToolbarProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false)

  return (
    <div className="bg-slate-800 text-white rounded-lg shadow-xl p-3 space-y-2 min-w-[600px]">
      {/* 第一行：字体和字号 */}
      <div className="flex items-center gap-2">
        <Select
          value={currentStyle.fontFamily || 'Microsoft YaHei'}
          onValueChange={(value) => onApplyStyle('fontFamily', value)}
        >
          <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(currentStyle.fontSize || 12)}
          onValueChange={(value) => onApplyStyle('fontSize', Number(value))}
        >
          <SelectTrigger className="w-[100px] bg-blue-500 border-blue-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}pt
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 第二行：格式按钮 */}
      <div className="flex items-center gap-1">
        {/* 加粗 */}
        <Button
          size="sm"
          variant={currentStyle.bold ? "default" : "ghost"}
          className={currentStyle.bold ? "bg-slate-600" : "hover:bg-slate-700"}
          onClick={() => onApplyStyle('bold', !currentStyle.bold)}
          title="加粗 (Ctrl+B)"
        >
          <span className="font-bold">B</span>
        </Button>

        {/* 斜体 */}
        <Button
          size="sm"
          variant={currentStyle.italic ? "default" : "ghost"}
          className={currentStyle.italic ? "bg-slate-600" : "hover:bg-slate-700"}
          onClick={() => onApplyStyle('italic', !currentStyle.italic)}
          title="斜体 (Ctrl+I)"
        >
          <span className="italic">I</span>
        </Button>

        {/* 行内代码 */}
        <Button
          size="sm"
          variant={currentStyle.code ? "default" : "ghost"}
          className={currentStyle.code ? "bg-slate-600" : "hover:bg-slate-700"}
          onClick={() => onApplyStyle('code', !currentStyle.code)}
          title="行内代码 (Ctrl+`)"
        >
          <Icon icon="mdi:code-tags" className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-slate-600 mx-1" />

        {/* 对齐方式 */}
        {onAlignChange && (
          <>
            <Button
              size="sm"
              variant={currentAlign === 'left' ? "default" : "ghost"}
              className={currentAlign === 'left' ? "bg-slate-600" : "hover:bg-slate-700"}
              onClick={() => onAlignChange('left')}
              title="左对齐"
            >
              <Icon icon="mdi:format-align-left" className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant={currentAlign === 'center' ? "default" : "ghost"}
              className={currentAlign === 'center' ? "bg-slate-600" : "hover:bg-slate-700"}
              onClick={() => onAlignChange('center')}
              title="居中对齐"
            >
              <Icon icon="mdi:format-align-center" className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant={currentAlign === 'right' ? "default" : "ghost"}
              className={currentAlign === 'right' ? "bg-blue-500" : "hover:bg-slate-700"}
              onClick={() => onAlignChange('right')}
              title="右对齐"
            >
              <Icon icon="mdi:format-align-right" className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant={currentAlign === 'justify' ? "default" : "ghost"}
              className={currentAlign === 'justify' ? "bg-slate-600" : "hover:bg-slate-700"}
              onClick={() => onAlignChange('justify')}
              title="两端对齐"
            >
              <Icon icon="mdi:format-align-justify" className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-slate-600 mx-1" />
          </>
        )}

        {/* 列表 */}
        {onListChange && (
          <>
            <Button
              size="sm"
              variant={currentListType === 'bullet-list' ? "default" : "ghost"}
              className={currentListType === 'bullet-list' ? "bg-blue-500" : "hover:bg-slate-700"}
              onClick={() => onListChange(currentListType === 'bullet-list' ? null : 'bullet-list')}
              title="无序列表"
            >
              <Icon icon="mdi:format-list-bulleted" className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant={currentListType === 'numbered-list' ? "default" : "ghost"}
              className={currentListType === 'numbered-list' ? "bg-slate-600" : "hover:bg-slate-700"}
              onClick={() => onListChange(currentListType === 'numbered-list' ? null : 'numbered-list')}
              title="有序列表"
            >
              <Icon icon="mdi:format-list-numbered" className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-slate-600 mx-1" />
          </>
        )}

        {/* 文字颜色 */}
        <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="hover:bg-slate-700 relative"
              title="文字颜色"
            >
              <Icon icon="mdi:format-color-text" className="w-4 h-4" />
              <div
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5"
                style={{ backgroundColor: currentStyle.color || '#000000' }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onApplyStyle('color', color)
                    setColorPickerOpen(false)
                  }}
                  title={color}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
