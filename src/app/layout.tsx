import type { Metadata } from "next";
import { Fira_Sans } from "next/font/google";
import "./globals.css";
import "./style.scss";
import Navbar from "@/components/navbar/NavBar";
import Footer from "@/components/footer/Footer";
import ReduxProvider from "@/store/provider";

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Baliye Cotour",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" >
      <body suppressHydrationWarning={true} className={` ${firaSans.variable} bg-[#FAF8F0] h-full antialiased`}> 
        <ReduxProvider>
          <Navbar />
          {children}
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
