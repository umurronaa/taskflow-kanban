export const metadata = {
  title: 'TaskFlow Kanban',
  description: 'Proje Yönetim Panosu',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}