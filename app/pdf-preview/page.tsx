"use client"

import { useEffect, useState, Suspense } from "react"
import dynamic from "next/dynamic"
import type { ResumeData } from "@/types/resume"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { generatePdfFilename } from "@/lib/resume-utils"

// 动态导入 PDF 组件，禁用 SSR
const DynamicPDFViewer = dynamic(
  () => import("@/components/pdf-viewer").then((mod) => mod.PDFViewer),
  { ssr: false }
)

const DynamicPDFDownloadLink = dynamic(
  () => import("@/components/pdf-viewer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
)

function PDFPreviewContent() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    // 先检查 sessionStorage 是否有数据
    const storedData = sessionStorage.getItem('resumeData');
    if (storedData) {
      try {
        setResumeData(JSON.parse(storedData));
      } catch (error) {
        console.error("Failed to parse stored resume data:", error);
      }
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'resumeData') {
        setResumeData(event.data.data);
        sessionStorage.setItem('resumeData', JSON.stringify(event.data.data));
      }
    };

    window.addEventListener('message', handleMessage);

    // 发送 ready 消息到父窗口
    if (window.opener) {
      window.opener.postMessage({ type: 'ready' }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [])

  if (!resumeData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg mb-4">正在加载简历数据...</p>
      </div>
    )
  }

  const fileName = generatePdfFilename(resumeData.title)

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b no-print">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-bold">PDF预览</h1>
          {fallback && (
            <div className="flex items-baseline gap-1 text-xs text-muted-foreground">
              <Icon icon="mdi:alert-circle" className="w-3.5 h-3.5 text-amber-600" />
              <span>服务器不可用，已切换为浏览器打印。请在打印对话框中关闭“页眉和页脚”，勾选“背景图形”。</span>
              <Button size="sm" className="ml-2 h-6 px-2 py-1 text-xs" onClick={() => window.print()}>
                打印/保存为 PDF
              </Button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.close()} variant="outline" size="sm" className="gap-2">
            <Icon icon="mdi:close" className="w-4 h-4" />
            关闭
          </Button>
          {!fallback && (
            <DynamicPDFDownloadLink resumeData={resumeData} fileName={fileName}>
              <Button size="sm" className="gap-2">
                <Icon icon="mdi:download" className="w-4 h-4" />
                下载 PDF
              </Button>
            </DynamicPDFDownloadLink>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex">
        <div className="w-full h-full">
          <DynamicPDFViewer
            resumeData={resumeData}
            renderNotice="external"
            onModeChange={(m) => setFallback(m === "fallback")}
          />
        </div>
      </div>
    </div>
  )
}

export default function PDFPreviewPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg mb-4">加载中...</p>
      </div>
    }>
      <PDFPreviewContent />
    </Suspense>
  )
}
