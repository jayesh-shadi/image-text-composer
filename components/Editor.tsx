import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Image as KImage, Text as KText, Transformer } from "react-konva";
import useImage from "use-image";
import { nanoid } from "nanoid";
import { produce } from "immer";
import Toolbar from "./Toolbar";
import LayerList from "./LayerList";
import { EditorState, HistoryState, TextLayer } from "@/lib/types";
import { createInitialHistory, push as pushHistory, redo as redoHistory, undo as undoHistory } from "@/lib/history";
import { clear as clearPersist, load as loadPersist, save as savePersist } from "@/lib/persist";

// References for Konva transformer and export behavior [1][2][3][7][10].
function snapToCenter(x: number, y: number, stageW: number, stageH: number, bboxW: number, bboxH: number) {
  const epsilon = 6;
  const centerX = stageW / 2 - bboxW / 2;
  const centerY = stageH / 2 - bboxH / 2;
  const sx = Math.abs(x - centerX) < epsilon ? centerX : x;
  const sy = Math.abs(y - centerY) < epsilon ? centerY : y;
  return { x: sx, y: sy };
}

function useImageElement(src?: string) {
  const [img] = useImage(src || "");
  return img;
}

export default function Editor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  const [history, setHistory] = useState<HistoryState>(() => loadPersist() || createInitialHistory());
  const state = history.present;

  const bgImg = useImageElement(state.bgImage?.dataUrl);
  const stageSize = useMemo(() => {
    if (state.bgImage) return { width: state.bgImage.width, height: state.bgImage.height };
    return { width: 960, height: 540 };
  }, [state.bgImage]);

  useEffect(() => {
    savePersist(history);
  }, [history]);

  const setState = useCallback((updater: (s: EditorState) => EditorState, push = true) => {
    setHistory((h) => {
      const next = updater(h.present);
      return push ? pushHistory(h, next, 50) : { ...h, present: next };
    });
  }, []);

  const selectOnly = useCallback((id?: string) => {
    setState((s) => ({ ...s, selectedIds: id ? [id] : [] }), false);
  }, [setState]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        setHistory((h) => undoHistory(h));
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        setHistory((h) => redoHistory(h));
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") {
        e.preventDefault();
        handleReset();
      } else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        const dx = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
        const dy = e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0;
        nudge(dx, dy);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    const dataUrl = await file.arrayBuffer().then((buf) => {
      const blob = new Blob([buf], { type: "image/png" });
      return new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(blob);
      });
    });
    const img = new Image();
    await new Promise<void>((res) => {
      img.onload = () => res();
      img.src = dataUrl;
    });
    setState((s) => ({ ...s, bgImage: { dataUrl, width: img.width, height: img.height }, layers: [], selectedIds: [] }));
  }, [setState]);

  const addText = useCallback(() => {
    const id = nanoid();
    const newLayer: TextLayer = {
      id,
      type: "text",
      x: 40,
      y: 40,
      rotation: 0,
      width: 360,
      height: 80,
      text: "Double-click to edit",
      fontFamily: "Inter",
      fontSize: 48,
      fontStyle: "normal",
      fontVariant: "normal",
      fontWeight: "700",
      fill: "#ffffff",
      opacity: 1,
      align: "left",
      draggable: true,
      locked: false
    };
    setState((s) => ({ ...s, layers: [...s.layers, newLayer], selectedIds: [id] }));
  }, [setState]);

  const mutateSelected = useCallback((patch: Partial<TextLayer>) => {
    setState((s) =>
      produce(s, (draft) => {
        draft.layers = draft.layers.map((l) => (s.selectedIds.includes(l.id) ? { ...l, ...patch } : l));
      })
    );
  }, [setState]);

  const onReorder = useCallback((from: number, to: number) => {
    setState((s) => {
      if (from === to) return s;
      const arr = s.layers.slice();
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      return { ...s, layers: arr };
    });
  }, [setState]);

  const onToggleLock = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      layers: s.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked, draggable: l.locked } : l))
    }));
  }, [setState]);

  const onDuplicate = useCallback((id: string) => {
    setState((s) => {
      const idx = s.layers.findIndex((l) => l.id === id);
      if (idx === -1) return s;
      const orig = s.layers[idx];
      const dup: TextLayer = { ...orig, id: nanoid(), x: orig.x + 20, y: orig.y + 20, locked: false, draggable: true };
      const layers = s.layers.slice();
      layers.splice(idx + 1, 0, dup);
      return { ...s, layers, selectedIds: [dup.id] };
    });
  }, [setState]);

  const nudge = useCallback(
    (dx: number, dy: number) => {
      setState((s) =>
        produce(s, (draft) => {
          draft.layers.forEach((l) => {
            if (draft.selectedIds.includes(l.id) && !l.locked) {
              l.x += dx;
              l.y += dy;
            }
          });
        })
      );
    },
    [setState]
  );

  const handleReset = useCallback(() => {
    clearPersist();
    setHistory(createInitialHistory());
  }, []);

  const selectedNodes = useMemo(() => state.layers.filter((l) => state.selectedIds.includes(l.id)), [state]);

  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const stage = stageRef.current;
    if (!stage) return;
    // Attach transformer to selected nodes [1][2].
    const layer = stage.findOne("Layer");
    const konvaNodes = selectedNodes
      .map((l) => stage.findOne(`#node-${l.id}`))
      .filter(Boolean);
    tr.nodes(konvaNodes);
    layer?.batchDraw();
  }, [state.selectedIds, state.layers]);

  const handleDragMove = useCallback(
    (id: string, e: any) => {
      const node = e.target;
      const box = node.getClientRect({ skipTransform: false });
      const { x, y } = snapToCenter(node.x(), node.y(), stageSize.width, stageSize.height, box.width, box.height);
      node.x(x);
      node.y(y);
      setState((s) =>
        produce(s, (draft) => {
          const l = draft.layers.find((L) => L.id === id);
          if (l) {
            l.x = x;
            l.y = y;
          }
        })
      );
    },
    [setState, stageSize]
  );

  const handleTransformEnd = useCallback(
    (id: string, e: any) => {
      const node = e.target;
      // Text resizing best practice: reset scale, set width/height explicitly [3].
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      const newWidth = Math.max(20, node.width() * scaleX);
      const newHeight = Math.max(20, node.height() * scaleY);
      const rotation = node.rotation();
      setState((s) =>
        produce(s, (draft) => {
          const l = draft.layers.find((L) => L.id === id);
          if (l) {
            l.width = newWidth;
            l.height = newHeight;
            l.rotation = rotation;
            l.x = node.x();
            l.y = node.y();
          }
        })
      );
    },
    [setState]
  );

  const exportPNG = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    // Export at the original dimensions. pixelRatio=1 retains canvas size [7][10].
    const dataURL = stage.toDataURL({ pixelRatio: 1 });
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "composition.png";
    a.click();
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;
  const historyCount = history.past.length;

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
<Toolbar
canUndo={canUndo}
canRedo={canRedo}
historyCount={historyCount}
onUndo={() => setHistory((h) => undoHistory(h))}
onRedo={() => setHistory((h) => redoHistory(h))}
onReset={handleReset}
onUpload={handleUpload}
onExport={exportPNG}
selected={selectedNodes[0] || null} 
mutateSelected={mutateSelected}
addText={addText}
nudge={nudge}
/>
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto" }}>
          <div
            style={{
              background: "#0b0e14",
              border: "1px solid #2a3040",
              borderRadius: 10,
              padding: 16,
              margin: 16
            }}
          >
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
              onMouseDown={(e) => {
                const clickedEmpty = e.target === e.target.getStage();
                if (clickedEmpty) selectOnly(undefined);
              }}
              style={{ background: "#0a0d13" }}
            >
              <Layer>
                {bgImg && (
                  <KImage
                    image={bgImg}
                    width={stageSize.width}
                    height={stageSize.height}
                    listening={false}
                  />
                )}
                {state.layers.map((l) => (
                  <KText
                    key={l.id}
                    id={`node-${l.id}`}
                    x={l.x}
                    y={l.y}
                    width={l.width}
                    height={l.height}
                    text={l.text}
                    fontFamily={l.fontFamily}
                    fontSize={l.fontSize}
                    fontStyle={l.fontStyle}
                    fontVariant={l.fontVariant}
                    fontWeight={l.fontWeight}
                    fill={l.fill}
                    opacity={l.opacity}
                    align={l.align}
                    rotation={l.rotation}
                    draggable={!l.locked}
                    onClick={() => selectOnly(l.id)}
                    onTap={() => selectOnly(l.id)}
                    onDblClick={() => {
                      const newText = prompt("Edit text:", l.text) ?? l.text;
                      mutateSelected({ text: newText });
                    }}
                    onDragMove={(e) => handleDragMove(l.id, e)}
                    onTransformEnd={(e) => handleTransformEnd(l.id, e)}
                  />
                ))}
                <Transformer
                  ref={trRef}
                  rotateEnabled
                  enabledAnchors={[
                    "top-left",
                    "top-center",
                    "top-right",
                    "middle-left",
                    "middle-right",
                    "bottom-left",
                    "bottom-center",
                    "bottom-right"
                  ]}
                  boundBoxFunc={(oldBox, newBox) => {
                    // Prevent too small size.
                    if (newBox.width < 20 || newBox.height < 20) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                />
              </Layer>
            </Stage>
          </div>
        </div>
        <LayerList
          layers={state.layers}
          selectedIds={state.selectedIds}
          onSelect={(id) => selectOnly(id)}
          onReorder={onReorder}
          onToggleLock={onToggleLock}
          onDuplicate={onDuplicate}
        />
      </div>
    </div>
  );
}
