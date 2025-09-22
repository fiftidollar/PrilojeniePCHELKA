import './globals.css'

export const metadata = {
  title: 'TikTok Login App',
  description: 'Login with TikTok OAuth',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
