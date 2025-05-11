interface SearchResult {
  content: string;
  metadata: {
    path: string;
    type: 'code' | 'document';
  };
}

// メモリ内にデータを保持
const searchIndex = new Map<string, SearchResult>();

// 検索用のインデックスをメモリに保存
export async function saveToIndex(data: SearchResult) {
  searchIndex.set(data.metadata.path, data);
}

// シンプルなテキスト検索を実行
export async function searchContent(query: string): Promise<SearchResult[]> {
  const searchQuery = query.toLowerCase();
  
  return Array.from(searchIndex.values())
    .filter(item => 
      item.content.toLowerCase().includes(searchQuery) ||
      item.metadata.path.toLowerCase().includes(searchQuery)
    )
    .slice(0, 5); // 上位5件を返す
}
