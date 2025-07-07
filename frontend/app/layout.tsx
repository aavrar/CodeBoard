import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { PingProvider } from "@/components/ping-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { CriticalErrorBoundary, PageErrorBoundary } from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CodeBoard - Code-Switching Corpus Platform",
  description: "A community-driven platform for collecting and analyzing code-switching examples",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <CriticalErrorBoundary>
          <AuthProvider>
            <PingProvider>
              <PageErrorBoundary>
                <Navbar />
                <main className="min-h-screen">{children}</main>
              </PageErrorBoundary>
            </PingProvider>
          </AuthProvider>
        </CriticalErrorBoundary>
      </body>
    </html>
  )
}
