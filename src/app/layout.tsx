import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import InteractiveShader from "@/components/ui/crystal-shader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AASMA | Adaptive Agent-Based Smart Multimodal Assistant",
  description: "Advanced AI Healthcare Platform for Multimodal Fusion and Risk Prediction",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-slate-950 text-slate-50 min-h-screen overflow-x-hidden`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <InteractiveShader />
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
