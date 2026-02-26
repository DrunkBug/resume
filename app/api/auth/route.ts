import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";

const AUTH_COOKIE = "site_auth";

function sha256Node(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** 从请求头中构建外部可访问的 base URL（兼容 Nginx 反代场景） */
function getExternalBase(req: NextRequest): string {
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}${basePath}`;
  }
  // fallback：直接用 req.url 的 origin（本地开发场景）
  const origin = new URL(req.url).origin;
  return `${origin}${basePath}`;
}

export async function POST(req: NextRequest) {
  const password = (process.env.SITE_PASSWORD ?? "").trim();

  // If password not configured, skip and go home
  if (!password) {
    const base = getExternalBase(req);
    return NextResponse.redirect(new URL("/", base));
  }

  const contentType = req.headers.get("content-type") || "";
  let inputPwd = "";
  let from = "/";

  if (contentType.includes("application/json")) {
    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }
    inputPwd = String(body["password"] ?? "");
    from = String(body["from"] ?? "/") || "/";
  } else {
    const form = await req.formData();
    inputPwd = (form.get("password") ?? "").toString();
    from = (form.get("from") ?? "/").toString() || "/";
  }

  if (inputPwd !== password) {
    const base = getExternalBase(req);
    const url = new URL("/auth", base);
    if (from) url.searchParams.set("from", from);
    url.searchParams.set("e", "1");
    // Use 303 to convert POST to GET and avoid 405 on pages
    return NextResponse.redirect(url, 303);
  }

  const cookieValue = sha256Node(password);
  // sanitize redirect target to internal path only
  const safeFrom = typeof from === "string" && from.startsWith("/") && from !== "/auth" ? from : "/";
  const base = getExternalBase(req);
  const res = NextResponse.redirect(new URL(safeFrom, base), 303);
  res.cookies.set(AUTH_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
