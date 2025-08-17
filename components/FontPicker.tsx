import { useEffect } from "react";
import { DEFAULT_FONTS, loadFonts } from "@/lib/fonts";

interface Props {
  value: string;
  onChange: (fontFamily: string) => void;
}

export default function FontPicker({ value, onChange }: Props) {
  useEffect(() => {
    loadFonts(DEFAULT_FONTS);
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ padding: 6, background: "#1a1f29", color: "#e6e6e6", border: "1px solid #2a3040", borderRadius: 6 }}
    >
      {DEFAULT_FONTS.map((f) => (
        <option key={f} value={f} style={{ fontFamily: f }}>
          {f}
        </option>
      ))}
    </select>
  );
}
