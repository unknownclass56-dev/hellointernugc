import React from "react";

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const renderText = (text: string) => {
    // Basic bold parsing: **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const lines = content.split('\n');
  const elements = [];
  let currentList: React.ReactNode[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(<ul key={elements.length} className="list-disc pl-5 mb-4">{currentList}</ul>);
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={i} className="text-lg font-bold text-navy-deep mt-4 mb-2">{renderText(line.slice(4))}</h3>);
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={i} className="text-xl font-black text-navy-deep mt-5 mb-3">{renderText(line.slice(3))}</h2>);
    } else if (line.startsWith('# ')) {
      flushList();
      elements.push(<h1 key={i} className="text-2xl font-black text-navy-deep mt-6 mb-4">{renderText(line.slice(2))}</h1>);
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      currentList.push(<li key={i} className="mb-1">{renderText(line.slice(2))}</li>);
    } else if (line === '') {
      flushList();
      // Only push spacing if not consecutively empty
      if (lines[i-1] && lines[i-1].trim() !== '') {
        elements.push(<div key={i} className="h-2"></div>);
      }
    } else {
      flushList();
      elements.push(<p key={i} className="mb-2 text-sm">{renderText(line)}</p>);
    }
  }
  
  flushList(); // Flush any remaining list items

  return <div className="markdown-content text-slate-700 leading-relaxed">{elements}</div>;
}
