import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apolo • Seu Agente de Conversação",
  description: "Co-piloto inteligente de conteúdo e comunicação da CSOAM e Dr. Cleverson Redivo",
  icons: {
    icon: "/arts/apolo_star_logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
