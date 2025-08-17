export const metadata = {
    title: "Image Text Composer",
    description: "Desktop image text editor (PNG + text overlays)"
  };
  
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body style={{ margin: 0, background: "#0f1115", color: "#e6e6e6", fontFamily: "Inter, system-ui, Arial" }}>
          {children}
        </body>
      </html>
    );
  }
  