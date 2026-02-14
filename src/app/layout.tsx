import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "DEVIN//HHS - Medicaid Transparency Platform",
  description: "Full transparency into Medicaid provider spending. Real data from opendata.hhs.gov.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-mono antialiased bg-white text-black">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-white">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                {/* Black & White US Flag */}
                <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                  <rect width="24" height="16" fill="white" stroke="black" strokeWidth="0.5"/>
                  {/* Stripes */}
                  <rect y="0" width="24" height="1.23" fill="black"/>
                  <rect y="2.46" width="24" height="1.23" fill="black"/>
                  <rect y="4.92" width="24" height="1.23" fill="black"/>
                  <rect y="7.38" width="24" height="1.23" fill="black"/>
                  <rect y="9.84" width="24" height="1.23" fill="black"/>
                  <rect y="12.31" width="24" height="1.23" fill="black"/>
                  <rect y="14.77" width="24" height="1.23" fill="black"/>
                  {/* Canton */}
                  <rect width="10" height="8.6" fill="black"/>
                  {/* Stars (simplified as dots) */}
                  <circle cx="1.2" cy="1" r="0.4" fill="white"/>
                  <circle cx="3" cy="1" r="0.4" fill="white"/>
                  <circle cx="4.8" cy="1" r="0.4" fill="white"/>
                  <circle cx="6.6" cy="1" r="0.4" fill="white"/>
                  <circle cx="8.4" cy="1" r="0.4" fill="white"/>
                  <circle cx="2.1" cy="2.2" r="0.4" fill="white"/>
                  <circle cx="3.9" cy="2.2" r="0.4" fill="white"/>
                  <circle cx="5.7" cy="2.2" r="0.4" fill="white"/>
                  <circle cx="7.5" cy="2.2" r="0.4" fill="white"/>
                  <circle cx="1.2" cy="3.4" r="0.4" fill="white"/>
                  <circle cx="3" cy="3.4" r="0.4" fill="white"/>
                  <circle cx="4.8" cy="3.4" r="0.4" fill="white"/>
                  <circle cx="6.6" cy="3.4" r="0.4" fill="white"/>
                  <circle cx="8.4" cy="3.4" r="0.4" fill="white"/>
                  <circle cx="2.1" cy="4.6" r="0.4" fill="white"/>
                  <circle cx="3.9" cy="4.6" r="0.4" fill="white"/>
                  <circle cx="5.7" cy="4.6" r="0.4" fill="white"/>
                  <circle cx="7.5" cy="4.6" r="0.4" fill="white"/>
                  <circle cx="1.2" cy="5.8" r="0.4" fill="white"/>
                  <circle cx="3" cy="5.8" r="0.4" fill="white"/>
                  <circle cx="4.8" cy="5.8" r="0.4" fill="white"/>
                  <circle cx="6.6" cy="5.8" r="0.4" fill="white"/>
                  <circle cx="8.4" cy="5.8" r="0.4" fill="white"/>
                  <circle cx="2.1" cy="7" r="0.4" fill="white"/>
                  <circle cx="3.9" cy="7" r="0.4" fill="white"/>
                  <circle cx="5.7" cy="7" r="0.4" fill="white"/>
                  <circle cx="7.5" cy="7" r="0.4" fill="white"/>
                </svg>
                <span className="font-bold text-lg tracking-tight">DEVIN//HHS</span>
              </Link>
              <span className="hidden sm:block text-xs text-gray-500 uppercase tracking-wide">
                A NON-OFFICIAL WEBSITE FOR THE US GOVERNMENT
              </span>
            </div>
          </header>

          {/* Nav */}
          <nav className="border-b-2 border-black bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 flex gap-6">
              <Link href="/" className="py-3 text-sm font-bold hover:bg-black hover:text-white px-3 -mx-3 transition-colors">
                Home
              </Link>
              <Link href="/explore" className="py-3 text-sm font-bold hover:bg-black hover:text-white px-3 transition-colors">
                Explore
              </Link>
              <Link href="/charts" className="py-3 text-sm font-bold hover:bg-black hover:text-white px-3 transition-colors">
                Charts
              </Link>
              <Link href="/analysis" className="py-3 text-sm font-bold hover:bg-black hover:text-white px-3 transition-colors">
                Analysis
              </Link>
              <Link href="/outliers" className="py-3 text-sm font-bold hover:bg-black hover:text-white px-3 transition-colors">
                Outliers
              </Link>
              <Link href="/federal" className="py-3 text-sm font-bold hover:bg-black hover:text-white px-3 transition-colors">
                Federal
              </Link>
              <Link href="/about" className="py-3 text-sm font-bold hover:bg-black hover:text-white px-3 transition-colors">
                About
              </Link>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t-2 border-black py-6 mt-auto">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <div className="flex items-center justify-center gap-3">
                {/* Black & White US Flag */}
                <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                  <rect width="24" height="16" fill="white" stroke="black" strokeWidth="0.5"/>
                  <rect y="0" width="24" height="1.23" fill="black"/>
                  <rect y="2.46" width="24" height="1.23" fill="black"/>
                  <rect y="4.92" width="24" height="1.23" fill="black"/>
                  <rect y="7.38" width="24" height="1.23" fill="black"/>
                  <rect y="9.84" width="24" height="1.23" fill="black"/>
                  <rect y="12.31" width="24" height="1.23" fill="black"/>
                  <rect y="14.77" width="24" height="1.23" fill="black"/>
                  <rect width="10" height="8.6" fill="black"/>
                  <circle cx="1.2" cy="1" r="0.4" fill="white"/>
                  <circle cx="3" cy="1" r="0.4" fill="white"/>
                  <circle cx="4.8" cy="1" r="0.4" fill="white"/>
                  <circle cx="6.6" cy="1" r="0.4" fill="white"/>
                  <circle cx="8.4" cy="1" r="0.4" fill="white"/>
                  <circle cx="2.1" cy="2.2" r="0.4" fill="white"/>
                  <circle cx="3.9" cy="2.2" r="0.4" fill="white"/>
                  <circle cx="5.7" cy="2.2" r="0.4" fill="white"/>
                  <circle cx="7.5" cy="2.2" r="0.4" fill="white"/>
                  <circle cx="1.2" cy="3.4" r="0.4" fill="white"/>
                  <circle cx="3" cy="3.4" r="0.4" fill="white"/>
                  <circle cx="4.8" cy="3.4" r="0.4" fill="white"/>
                  <circle cx="6.6" cy="3.4" r="0.4" fill="white"/>
                  <circle cx="8.4" cy="3.4" r="0.4" fill="white"/>
                  <circle cx="2.1" cy="4.6" r="0.4" fill="white"/>
                  <circle cx="3.9" cy="4.6" r="0.4" fill="white"/>
                  <circle cx="5.7" cy="4.6" r="0.4" fill="white"/>
                  <circle cx="7.5" cy="4.6" r="0.4" fill="white"/>
                  <circle cx="1.2" cy="5.8" r="0.4" fill="white"/>
                  <circle cx="3" cy="5.8" r="0.4" fill="white"/>
                  <circle cx="4.8" cy="5.8" r="0.4" fill="white"/>
                  <circle cx="6.6" cy="5.8" r="0.4" fill="white"/>
                  <circle cx="8.4" cy="5.8" r="0.4" fill="white"/>
                  <circle cx="2.1" cy="7" r="0.4" fill="white"/>
                  <circle cx="3.9" cy="7" r="0.4" fill="white"/>
                  <circle cx="5.7" cy="7" r="0.4" fill="white"/>
                  <circle cx="7.5" cy="7" r="0.4" fill="white"/>
                </svg>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600">
                  POWERED BY DEVIN AI
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Data source: opendata.hhs.gov
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
