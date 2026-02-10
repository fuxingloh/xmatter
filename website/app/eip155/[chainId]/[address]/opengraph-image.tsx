import { ImageResponse } from "next/og";

import { getXmatterFile } from "@/app/public";
import { chains } from "@/app/eip155/chains";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image(props: PageProps<"/eip155/[chainId]/[address]">) {
  const { chainId, address } = await props.params;
  const { data } = await getXmatterFile(`/eip155/${chainId}/${address}/README.md`);
  const chainName = chains[chainId] ?? `Chain ${chainId}`;
  const color = data.color ?? "#888888";

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#fafafa",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", height: "8px", backgroundColor: color }} />

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          gap: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {data.icons.length > 0 && (
            <img
              src={`https://xmatter.org/eip155/${chainId}/${address}/icon`}
              width={120}
              height={120}
              style={{ borderRadius: "16px" }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "64px", fontWeight: 700, color: "#0a0a0a" }}>{data.name}</span>
              {data.symbol && (
                <span style={{ fontSize: "36px", lineHeight: "64px", fontWeight: 500, color: "#737373" }}>
                  {data.symbol}
                </span>
              )}
            </div>
            <span style={{ fontSize: "28px", color: "#525252" }}>{chainName}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "20px",
            color: "#a3a3a3",
            fontFamily: "monospace",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          /eip155/{chainId}/{address}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          justifyContent: "flex-end",
          padding: "24px 60px",
          borderTop: "1px solid #e5e5e5",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#333"
            d="M42.9572 1.9403C54.3206 -3.97164 59.7267 4.76734 72.9768 12.8587C84.8215 20.0917 95.9596 6.27896 99.7007 23.2093C102.231 34.6621 87.8805 34.2705 87.8805 51.6988C87.8805 61.342 103.61 71.2591 92.9435 84.3595C84.6947 94.4905 78.6317 89.0554 62.1826 89.6486C49.5539 90.104 43.0848 102.275 33.5847 99.6224C21.1999 96.1649 36.4884 77.0943 20.146 75.4116C4.99392 73.8515 6.78363 62.7196 8.57067 50.4969C9.90788 41.3509 -6.65998 34.4802 3.08764 23.2093C10.6361 14.4812 17.1092 21.8001 29.2935 18.8341C39.0411 16.4612 31.7213 7.78586 42.9572 1.9403Z"
          />
        </svg>

        <span style={{ fontSize: "24px", fontWeight: 600, color: "#333" }}>xmatter.org</span>
      </div>
    </div>,
    { ...size },
  );
}
