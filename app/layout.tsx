import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import  HeaderWithAuth  from "@/components/HeaderWithAuth";
import WhatsappButton from "@/components/WhatsappButton";
import FloatingButton from "@/components/FloatingButton";

import Image from "next/image";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Necesito Esto!",
  description: "Descripcion de necesito esto",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="">
            <HeaderWithAuth />
            <div>
              {children}
              <WhatsappButton />
              {/* Botón flotante "Publica tu necesidad" en móvil */}
              <div className="md:hidden fixed bottom-20 right-4 z-50 mb-12">
                <FloatingButton />
              </div>
            </div>

            <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16 bg-gray-400">
              <p className="h2 text-white text-xl">Necesito <span className='azul'>!Esto</span> © Copyright - 2024</p>
              {/*<ThemeSwitcher />*/}
              <Image src="/logotm2.png" alt="Logo de Necesito Esto!" width={170} height={90} />
            </footer>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
