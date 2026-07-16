import { ImageResponse } from "next/og";

/**
 * Shared OG/Twitter image renderer.
 * Extracted to avoid duplication between opengraph-image.tsx and twitter-image.tsx
 * while keeping each file as a self-contained metadata route with literal config exports
 * (which Next.js requires for static analysis of route segment configs).
 */

const IMAGE_SIZE = { width: 1200, height: 630 };

async function loadFont(): Promise<ArrayBuffer> {
  const css = await (
    await fetch("https://fonts.googleapis.com/css2?family=Inter:wght@400;700", {
      cache: "force-cache",
    })
  ).text();

  const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!match?.[1]) {
    return new ArrayBuffer(0);
  }
  return await (await fetch(match[1], { cache: "force-cache" })).arrayBuffer();
}

export async function renderOgImage() {
  const fontData = await loadFont();

  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[] = [];
  if (fontData.byteLength > 0) {
    fonts.push({ name: "Inter", data: fontData, weight: 400, style: "normal" });
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          padding: "60px 80px",
        }}
      >
        {/* Indigo glow circle */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "30%",
            width: "600px",
            height: "600px",
            borderRadius: "9999px",
            backgroundColor: "rgba(99, 102, 241, 0.08)",
            filter: "blur(80px)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Left Column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "520px",
            }}
          >
            {/* Eyebrow Badge */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                borderRadius: "9999px",
                border: "1px solid #27272a",
                backgroundColor: "#18181b",
                padding: "8px 16px",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  height: "8px",
                  width: "8px",
                  borderRadius: "9999px",
                  backgroundColor: "#a1a1aa",
                  marginRight: "8px",
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#e4e4e7",
                }}
              >
                Open Source Error Monitoring
              </span>
            </div>

            {/* Wordmark Logo */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  height: "56px",
                  width: "56px",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "14px",
                  backgroundColor: "#6366f1",
                  marginRight: "16px",
                }}
              >
                <span
                  style={{
                    color: "#ffffff",
                    fontSize: "26px",
                    fontWeight: 700,
                  }}
                >
                  E
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "row" }}>
                <span
                  style={{
                    fontSize: "48px",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: "#ffffff",
                  }}
                >
                  Error
                </span>
                <span
                  style={{
                    fontSize: "48px",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: "#6366f1",
                  }}
                >
                  Nest
                </span>
              </div>
            </div>

            {/* Tagline */}
            <div
              style={{
                fontSize: "24px",
                lineHeight: 1.4,
                color: "#a1a1aa",
                display: "flex",
              }}
            >
              Catch production errors before your users do.
            </div>
          </div>

          {/* Right Column: Terminal Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "420px",
              backgroundColor: "#030712",
              borderRadius: "12px",
              border: "1px solid #27272a",
            }}
          >
            {/* Terminal Header */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                height: "40px",
                backgroundColor: "#111113",
                borderBottom: "1px solid #1e1e22",
                alignItems: "center",
                padding: "0 16px",
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "9999px",
                  backgroundColor: "#ef4444",
                  marginRight: "8px",
                }}
              />
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "9999px",
                  backgroundColor: "#eab308",
                  marginRight: "8px",
                }}
              />
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "9999px",
                  backgroundColor: "#22c55e",
                }}
              />
            </div>

            {/* Terminal Body */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "20px",
              }}
            >
              {/* Event Lines */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    fontSize: "13px",
                    marginBottom: i < 3 ? "12px" : "16px",
                  }}
                >
                  <span style={{ color: "#71717a", marginRight: "8px" }}>
                    {"\u2192"}
                  </span>
                  <span style={{ color: "#52525b", marginRight: "8px" }}>
                    POST /ingest
                  </span>
                  <span style={{ color: "#f87171" }}>TypeError: null</span>
                </div>
              ))}

              {/* Divider */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    height: "1px",
                    flex: 1,
                    backgroundColor: "#27272a",
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    color: "#71717a",
                    padding: "0 10px",
                  }}
                >
                  grouped as
                </span>
                <div
                  style={{
                    height: "1px",
                    flex: 1,
                    backgroundColor: "#27272a",
                  }}
                />
              </div>

              {/* Grouped Result */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#09090b",
                  border: "1px solid #1e1e22",
                  borderRadius: "8px",
                  padding: "12px 16px",
                }}
              >
                <span style={{ fontSize: "13px", color: "#e4e4e7" }}>
                  TypeError: null
                </span>
                <span
                  style={{
                    backgroundColor: "#f4f4f5",
                    color: "#09090b",
                    borderRadius: "9999px",
                    padding: "2px 10px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  ×847
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...IMAGE_SIZE,
      fonts: fonts.length > 0 ? fonts : undefined,
    }
  );
}
