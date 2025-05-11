import { ChatBox } from '@/components/ChatBox';

export default function Home() {
  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <h1 className="mb-4 text-2xl font-bold">GitHub RAG Chat</h1>
      <ChatBox />
    </div>
  );
}
