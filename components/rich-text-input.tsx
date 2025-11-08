"use client"
import { useEffect, useRef, useState } from "react"
import type { ModuleContentElement, TextSegment, TextStyle } from "@/types/resume"
import RichTextToolbar from "./rich-text-toolbar"

interface RichTextInputProps {
  element: ModuleContentElement
  onChange: (updates: Partial<ModuleContentElement>) => void
  placeholder?: string
  showBorder?: boolean
}

export default function RichTextInput({ element, onChange, placeholder, showBorder = true }: RichTextInputProps) {
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })
  const [currentStyle, setCurrentStyle] = useState<Partial<TextStyle>>({})
  const editorRef = useRef<HTMLDivElement>(null)
  const isComposingRef = useRef(false)
  const lastTextRef = useRef('')
  const savedRangeRef = useRef<Range | null>(null)

  // 监听文字选中
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed || !editorRef.current) {
        setShowToolbar(false)
        return
      }

      // 检查选区是否在当前编辑器内
      const range = selection.getRangeAt(0)
      if (!editorRef.current.contains(range.commonAncestorContainer)) {
        setShowToolbar(false)
        return
      }

      // 计算工具栏位置
      const rect = range.getBoundingClientRect()
      const toolbarWidth = 300 // 工具栏最小宽度
      let left = rect.left + rect.width / 2 - toolbarWidth / 2

      // 防止超出左边界
      if (left < 10) {
        left = 10
      }

      // 防止超出右边界
      if (left + toolbarWidth > window.innerWidth - 10) {
        left = window.innerWidth - toolbarWidth - 10
      }

      setToolbarPosition({
        top: rect.top - 120,
        left: left,
      })

      // 获取选中文字的样式
      const selectedStyle = getStyleAtSelection()
      setCurrentStyle(selectedStyle)

      // 保存选区
      saveSelection()

      setShowToolbar(true)
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [element.segments])

  // 获取选中文字的当前样式
  const getStyleAtSelection = (): Partial<TextStyle> => {
    // 简化实现：返回第一个segment的样式
    if (element.segments.length > 0) {
      return element.segments[0].style
    }
    return {}
  }

  // 保存当前选区
  const saveSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange()
    }
  }

  // 恢复选区
  const restoreSelection = () => {
    if (savedRangeRef.current) {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(savedRangeRef.current)
      }
    }
  }

  // 应用样式到选中文字
  const applyStyle = (key: keyof TextStyle, value: any) => {
    // 先恢复选区
    restoreSelection()

    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !editorRef.current) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    // 1. 先计算偏移量（在修改 DOM 之前）
    const fullText = editorRef.current.textContent || ''
    const startOffset = getTextOffset(editorRef.current, range.startContainer, range.startOffset)
    const endOffset = startOffset + selectedText.length

    // 2. 在 DOM 上应用样式
    const span = document.createElement('span')

    // 应用样式到 span
    if (key === 'color') {
      span.style.color = value as string
    } else if (key === 'fontSize') {
      span.style.fontSize = `${value}pt`
    } else if (key === 'fontFamily') {
      span.style.fontFamily = value as string
    } else if (key === 'bold') {
      span.style.fontWeight = value ? 'bold' : 'normal'
    } else if (key === 'italic') {
      span.style.fontStyle = value ? 'italic' : 'normal'
    }

    // 用 span 包裹选中的内容
    try {
      range.surroundContents(span)
    } catch (e) {
      // 如果选区跨越多个元素，使用 extractContents
      const contents = range.extractContents()
      span.appendChild(contents)
      range.insertNode(span)
    }

    // 3. 更新 segments 数据 - 正确处理多个现有 segments
    const newSegments: TextSegment[] = []
    let currentPos = 0

    // 遍历现有的 segments，分割并重组
    for (const segment of element.segments) {
      const segmentStart = currentPos
      const segmentEnd = currentPos + segment.text.length

      // 情况1: segment 完全在选区之前
      if (segmentEnd <= startOffset) {
        newSegments.push(segment)
      }
      // 情况2: segment 完全在选区之后
      else if (segmentStart >= endOffset) {
        newSegments.push(segment)
      }
      // 情况3: segment 与选区有交集
      else {
        // 前面未选中的部分
        if (segmentStart < startOffset) {
          newSegments.push({
            id: `seg-before-${Date.now()}-${currentPos}`,
            text: segment.text.substring(0, startOffset - segmentStart),
            style: segment.style,
          })
        }

        // 选中的部分
        const overlapStart = Math.max(0, startOffset - segmentStart)
        const overlapEnd = Math.min(segment.text.length, endOffset - segmentStart)
        if (overlapEnd > overlapStart) {
          const newStyle = { ...segment.style, [key]: value }
          newSegments.push({
            id: `seg-selected-${Date.now()}-${currentPos}`,
            text: segment.text.substring(overlapStart, overlapEnd),
            style: newStyle,
          })
        }

        // 后面未选中的部分
        if (segmentEnd > endOffset) {
          newSegments.push({
            id: `seg-after-${Date.now()}-${currentPos}`,
            text: segment.text.substring(endOffset - segmentStart),
            style: segment.style,
          })
        }
      }

      currentPos = segmentEnd
    }

    onChange({ segments: newSegments })
    setCurrentStyle({ ...currentStyle, [key]: value })
  }

  // 获取文本偏移量
  const getTextOffset = (root: Node, node: Node, offset: number): number => {
    let textOffset = 0
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)

    let currentNode = walker.nextNode()
    while (currentNode) {
      if (currentNode === node) {
        return textOffset + offset
      }
      textOffset += currentNode.textContent?.length || 0
      currentNode = walker.nextNode()
    }

    return textOffset
  }

  // 处理对齐方式变化
  const handleAlignChange = (align: 'left' | 'center' | 'right' | 'justify') => {
    onChange({ align })
  }

  // 处理列表类型变化
  const handleListChange = (type: 'bullet-list' | 'numbered-list' | null) => {
    onChange({ type: type || 'text' })
  }



  // 渲染segments为HTML
  const renderSegments = () => {
    return element.segments.map((segment) => {
      const style: React.CSSProperties = {
        fontFamily: segment.style.fontFamily,
        fontSize: segment.style.fontSize ? `${segment.style.fontSize}pt` : undefined,
        color: segment.style.color,
        fontWeight: segment.style.bold ? 'bold' : undefined,
        fontStyle: segment.style.italic ? 'italic' : undefined,
      }

      if (segment.style.code) {
        return (
          <code
            key={segment.id}
            style={{
              ...style,
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.9em',
              color: '#d73a49',
              backgroundColor: '#f6f8fa',
              padding: '2px 6px',
              borderRadius: '3px',
              border: '1px solid #e1e4e8',
            }}
          >
            {segment.text}
          </code>
        )
      }

      return (
        <span key={segment.id} style={style}>
          {segment.text}
        </span>
      )
    })
  }

  // 初始化内容 - 渲染带样式的 segments
  useEffect(() => {
    if (editorRef.current && !lastTextRef.current) {
      // 清空内容
      editorRef.current.innerHTML = ''

      // 渲染每个 segment
      element.segments.forEach((segment) => {
        const span = document.createElement('span')
        span.textContent = segment.text

        // 应用样式
        if (segment.style.color) span.style.color = segment.style.color
        if (segment.style.fontSize) span.style.fontSize = `${segment.style.fontSize}pt`
        if (segment.style.fontFamily) span.style.fontFamily = segment.style.fontFamily
        if (segment.style.bold) span.style.fontWeight = 'bold'
        if (segment.style.italic) span.style.fontStyle = 'italic'

        editorRef.current!.appendChild(span)
      })

      const text = element.segments.map(s => s.text).join('')
      lastTextRef.current = text
    }
  }, [])

  // 处理输入法开始
  const handleCompositionStart = () => {
    isComposingRef.current = true
  }

  // 处理输入法结束
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLDivElement>) => {
    isComposingRef.current = false
    // 输入法结束后，手动触发一次更新
    handleInput(e)
  }

  // 处理内容变化
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    // 如果正在使用输入法，不处理
    if (isComposingRef.current) {
      return
    }

    const text = e.currentTarget.textContent || ''
    lastTextRef.current = text

    const newSegments: TextSegment[] = [
      {
        id: element.segments[0]?.id || `seg-${Date.now()}`,
        text,
        style: element.segments[0]?.style || {},
      },
    ]

    onChange({ segments: newSegments })
  }

  const containerStyle: React.CSSProperties = {
    textAlign: element.align || 'left',
  }

  return (
    <>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        className={`min-h-[40px] px-3 py-2 bg-white focus:outline-none transition-colors ${showBorder ? 'border border-dashed border-teal-200 focus:border-teal-300' : ''
          }`}
        style={containerStyle}
        data-placeholder={placeholder}
      />

      {showToolbar && (
        <div
          className="fixed z-50"
          style={{
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
          }}
        >
          <RichTextToolbar
            currentStyle={currentStyle}
            onApplyStyle={applyStyle}
            onAlignChange={handleAlignChange}
            onListChange={handleListChange}
            currentAlign={element.align}
            currentListType={element.type === 'text' ? null : element.type}
          />
        </div>
      )}
    </>
  )
}
