import { renderOgImage } from "./og-shared";

export const runtime = "edge";

export const alt = "ErrorNest — Catch production errors before your users do";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return renderOgImage();
}
