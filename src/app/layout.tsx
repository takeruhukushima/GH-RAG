import '@/styles/globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'GitHub RAG Chat',
  description: 'Chat with your GitHub repositories using RAG',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
