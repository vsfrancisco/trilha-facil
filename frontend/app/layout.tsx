import "./globals.css";
import { ToastContainer } from "@/components/ToastContainer";

export const metadata = {
  title: "TrilhaFácil",
  description: "Diagnóstico inicial de carreira e dashboard administrativo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}