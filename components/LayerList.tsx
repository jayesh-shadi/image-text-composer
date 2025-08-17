import { TextLayer } from "@/lib/types";
import clsx from "clsx";

interface Props {
  layers: TextLayer[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onToggleLock: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export default function LayerList({ layers, selectedIds, onSelect, onReorder, onToggleLock, onDuplicate }: Props) {
  return (
    <div style={{ padding: 8, background: "#0f131b", borderLeft: "1px solid #2a3040", width: 280 }}>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>Layers (top to bottom)</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {layers
          .map((l, i) => ({ l, i }))
          .reverse()
          .map(({ l, i }) => {
            const active = selectedIds.includes(l.id);
            return (
              <div
                key={l.id}
                className={clsx("layer-item")}
                onClick={() => onSelect(l.id)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #2a3040",
                  background: active ? "#1d2432" : "#121826"
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 0 }}>
                  <span style={{ opacity: 0.7 }}>T</span>
                  <div style={{ fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {l.text.split("\n")[0] || "Text"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    title="Move up"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorder(i, Math.min(i + 1, layers.length - 1));
                    }}
                    style={btn()}
                  >
                    ↑
                  </button>
                  <button
                    title="Move down"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorder(i, Math.max(i - 1, 0));
                    }}
                    style={btn()}
                  >
                    ↓
                  </button>
                  <button
                    title={l.locked ? "Unlock" : "Lock"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLock(l.id);
                    }}
                    style={btn()}
                  >
                    {l.locked ? "🔒" : "🔓"}
                  </button>
                  <button
                    title="Duplicate"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(l.id);
                    }}
                    style={btn()}
                  >
                    ⎘
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

function btn() {
  return {
    padding: "4px 6px",
    borderRadius: 6,
    border: "1px solid #2a3040",
    background: "#1a1f29",
    color: "#e6e6e6",
    cursor: "pointer"
  } as React.CSSProperties;
}
