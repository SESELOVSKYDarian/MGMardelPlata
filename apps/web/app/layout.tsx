import "./globals.css";
export const metadata = {
  title: "MG Clone",
  description: "Clon editable de MG Argentina",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
