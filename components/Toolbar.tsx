import FontPicker from "./FontPicker";
import { TextLayer } from "@/lib/types";

interface Props {
  canUndo: boolean;
  canRedo: boolean;
  historyCount: number;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onUpload: (file: File) => void;
  onExport: () => void;
  selected: TextLayer | undefined;
  mutateSelected: (patch: Partial<TextLayer>) => void;
  addText: () => void;
  nudge: (dx: number, dy: number) => void;
}

export default function Toolbar({
  canUndo,
  canRedo,
  historyCount,
  onUndo,
  onRedo,
  onReset,
  onUpload,
  onExport,
  selected,
  mutateSelected,
  addText,
  nudge
}: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderBottom: "1px solid #2a3040", background: "#0f131b", position: "sticky", top: 0, zIndex: 10 }}>
      <input
        type="file"
        accept="image/png"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.currentTarget.value = "";
        }}
        style={{ display: "none" }}
        id="file"
      />
      <label htmlFor="file" style={btn()}>Upload PNG</label>
      <button onClick={addText} style={btn()}>Add Text</button>
      <button onClick={onExport} style={btn()}>Export PNG</button>
      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={onUndo} disabled={!canUndo} style={btn()} title="Undo">↶</button>
        <button onClick={onRedo} disabled={!canRedo} style={btn()} title="Redo">↷</button>
        <div style={{ fontSize: 12, opacity: 0.7 }}>History: {historyCount}</div>
        <button onClick={onReset} style={btnWarn()}>Reset</button>
      </div>
      {selected && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 16 }}>
          <FontPicker value={selected.fontFamily} onChange={(fontFamily) => mutateSelected({ fontFamily })} />
          <input
            type="number"
            min={8}
            max={400}
            value={selected.fontSize}
            onChange={(e) => mutateSelected({ fontSize: parseInt(e.target.value || "16", 10) })}
            style={input(80)}
            title="Font size"
          />
          <select value={selected.fontWeight} onChange={(e) => mutateSelected({ fontWeight: e.target.value })} style={input(100)} title="Font weight">
            {["100","200","300","400","500","600","700","800","900"].map(w=>(
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
          <input type="color" value={selected.fill} onChange={(e) => mutateSelected({ fill: e.target.value })} style={input(46)} title="Color" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={selected.opacity}
            onChange={(e) => mutateSelected({ opacity: parseFloat(e.target.value) })}
            style={{ width: 100 }}
            title="Opacity"
          />
          <select value={selected.align} onChange={(e) => mutateSelected({ align: e.target.value as any })} style={input(100)} title="Alignment">
            <option value="left">left</option>
            <option value="center">center</option>
            <option value="right">right</option>
          </select>
          <button onClick={() => nudge(-1, 0)} style={btn()}>←</button>
          <button onClick={() => nudge(1, 0)} style={btn()}>→</button>
          <button onClick={() => nudge(0, -1)} style={btn()}>↑</button>
          <button onClick={() => nudge(0, 1)} style={btn()}>↓</button>
        </div>
      )}
    </div>
  );
}

function btn() {
  return { padding: "8px 10px", borderRadius: 8, border: "1px solid #2a3040", background: "#1a1f29", color: "#e6e6e6", cursor: "pointer" };
}
function btnWarn() {
  return { ...btn(), borderColor: "#5a2230", background: "#23121a" };
}
function input(width: number) {
  return { width, padding: 6, background: "#1a1f29", color: "#e6e6e6", border: "1px solid #2a3040", borderRadius: 6 };
}
