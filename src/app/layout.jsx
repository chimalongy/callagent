import { Geist } from "next/font/google";
import "./globals.css";
const geist = Geist({ subsets: ["latin"] });
export const metadata = {
  title: "RingAI — AI-powered outbound calls",
  description: "Let AI make calls on your behalf with your voice instructions.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.className} min-h-screen bg-slate-950 text-slate-100 antialiased`}>
        <div className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </body>
    </html>
  );
}
