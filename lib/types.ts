export type TextAlign = "left" | "center" | "right";

export interface TextLayer {
  id: string;
  type: "text";
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontStyle: string; // 'normal'|'italic'
  fontVariant: string; // 'normal'|'small-caps'
  fontWeight: string; // e.g. '400','700'
  fill: string;
  opacity: number; // 0..1
  align: TextAlign;
  draggable: boolean;
  locked: boolean;
}

export interface EditorState {
  bgImage?: {
    dataUrl: string;
    width: number;
    height: number;
  };
  layers: TextLayer[];
  selectedIds: string[];
}

export interface HistoryState {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
}
