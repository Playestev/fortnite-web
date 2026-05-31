import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "GankerGames",
    template: "%s | GankerGames",
  },
  description:
    "Comunidad, perfil, noticias y tienda Fortnite de GankerGames.",
  applicationName: "GankerGames",
  icons: {
    icon: "/gankergames-logo.png",
    apple: "/gankergames-logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}