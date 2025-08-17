import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Montserrat } from "next/font/google"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
})

export const metadata: Metadata = {
  title: "AI Component Generator",
  description: "Generate frontend component libraries with AI assistance",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${montserrat.variable}`}>
      <head>
        {/* Tailwind CSS CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      background: 'oklch(1 0 0)',
                      foreground: 'oklch(0.278 0.013 258.338)',
                      card: 'oklch(0.961 0.006 247.858)',
                      'card-foreground': 'oklch(0.346 0.022 257.29)',
                      primary: 'oklch(0.6 0.25 260)',
                      'primary-foreground': 'oklch(1 0 0)',
                      secondary: 'oklch(0.961 0.006 247.858)',
                      'secondary-foreground': 'oklch(0.346 0.022 257.29)',
                      muted: 'oklch(0.961 0.006 247.858)',
                      'muted-foreground': 'oklch(0.648 0.013 258.338)',
                      accent: 'oklch(0.65 0.3 290)',
                      'accent-foreground': 'oklch(1 0 0)',
                      destructive: 'oklch(0.577 0.245 27.325)',
                      'destructive-foreground': 'oklch(1 0 0)',
                      border: 'oklch(0.922 0.006 247.858)',
                      input: 'oklch(1 0 0)',
                      ring: 'oklch(0.6 0.25 260)',
                    },
                    borderRadius: {
                      lg: '1rem',
                      md: 'calc(1rem - 2px)',
                      sm: 'calc(1rem - 4px)',
                      xl: 'calc(1rem + 4px)',
                    },
                    animation: {
                      'fade-in': 'fadeIn 0.5s ease-in-out',
                      'slide-up': 'slideUp 0.3s ease-out',
                      'bounce-gentle': 'bounceGentle 2s infinite',
                    },
                    keyframes: {
                      fadeIn: {
                        '0%': { opacity: '0' },
                        '100%': { opacity: '1' },
                      },
                      slideUp: {
                        '0%': { transform: 'translateY(10px)', opacity: '0' },
                        '100%': { transform: 'translateY(0)', opacity: '1' },
                      },
                      bounceGentle: {
                        '0%, 100%': { transform: 'translateY(0)' },
                        '50%': { transform: 'translateY(-5px)' },
                      },
                    },
                  },
                },
              };
            `,
          }}
        />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-heading: ${montserrat.style.fontFamily};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
