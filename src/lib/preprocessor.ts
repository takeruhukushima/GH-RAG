export function preprocessCode(content: string): string {
  return content
    .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // コメントの削除
    .replace(/\s+/g, ' ')                     // 複数の空白を1つに
    .trim();
}

export function preprocessDocument(content: string): string {
  return content
    .replace(/\s+/g, ' ')           // 複数の空白を1つに
    .replace(/!\[.*?\]\(.*?\)/g, '') // 画像の参照を削除
    .replace(/\[.*?\]\(.*?\)/g, '$1') // リンクのテキストのみ保持
    .replace(/[#*_~`]/g, '')         // Markdownの装飾を削除
    .trim();
}

// チャンクサイズの定数
const MAX_CHUNK_SIZE = 1000;
const OVERLAP_SIZE = 100;

export function splitIntoChunks(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + MAX_CHUNK_SIZE;
    
    if (end >= text.length) {
      chunks.push(text.slice(start));
      break;
    }

    // 文の途中で切らないように調整
    while (end > start && !/[.!?。]\s/.test(text.slice(end - 1, end + 1))) {
      end--;
    }

    if (end === start) {
      end = start + MAX_CHUNK_SIZE; // 適切な区切りが見つからない場合は強制的に分割
    }

    chunks.push(text.slice(start, end));
    start = end - OVERLAP_SIZE; // オーバーラップを考慮
  }

  return chunks;
}
