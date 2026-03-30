import TanStackQueryProvider from "@/provider/TanstackProvider";
import { ThemeProvider } from "@/provider/theme-provider";
import "@/styles/globals.css";
import { type Metadata } from "next";
import { Inter } from "next/font/google";

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ALLWEONE AI Presentation Generator",
  description: "Create beautiful AI-powered presentations in minutes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <TanStackQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </TanStackQueryProvider>
      </body>
    </html>
  );
}
