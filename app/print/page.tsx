import type { ResumeData } from "@/types/resume";
import ResumePreview from "@/components/resume-preview";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function decodeDataParam(data?: string): ResumeData | null {
  if (!data) return null;
  try {
    const json = Buffer.from(decodeURIComponent(data), "base64").toString("utf-8");
    return JSON.parse(json) as ResumeData;
  } catch {
    return null;
  }
}

export default function PrintPage({
  searchParams,
}: {
  searchParams: { data?: string };
}) {
  const resumeData = decodeDataParam(searchParams?.data);

  return (
    <div className="pdf-preview-mode">
      {resumeData ? (
        <ResumePreview resumeData={resumeData} />
      ) : (
        <div className="resume-content p-8">
          <h1 className="text-xl font-bold mb-4">无法加载简历数据</h1>
          <p className="text-muted-foreground">
            请通过后端生成接口或附带 data 参数访问本页面。
          </p>
        </div>
      )}
    </div>
  );
}

