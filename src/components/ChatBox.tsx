'use client';
import { useChat } from 'ai/react';
import { MessageBubble } from './MessageBubble';
import { Loader } from './Loader';

export function ChatBox() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/rag',
  });

  return (
    <>
      <div className="flex-1 space-y-2 overflow-y-auto rounded-xl border bg-white p-4 shadow">
        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} content={m.content} />
        ))}
        {isLoading && <Loader />}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="クエリを入力..."
          className="flex-1 rounded-lg border px-3 py-2 text-sm shadow focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700"
        >
          送信
        </button>
      </form>
    </>
  );
}
