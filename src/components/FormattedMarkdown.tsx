import React from 'react';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into lines for structured block parsing
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';

  const renderInline = (text: string): React.ReactNode[] => {
    // Match inline code, bold, and regular text
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Inline code: `code`
      const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)$/);
      // Bold text: **bold**
      const boldMatch = remaining.match(/^(.*?)\*\*([^*]+)\*\*(.*)$/);

      if (codeMatch && (!boldMatch || (codeMatch.index !== undefined && boldMatch.index !== undefined && codeMatch[1].length <= boldMatch[1].length))) {
        if (codeMatch[1]) {
          parts.push(...renderInline(codeMatch[1]));
        }
        parts.push(
          <code key={`code-${keyIdx++}`} className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[10px] border border-slate-700/50">
            {codeMatch[2]}
          </code>
        );
        remaining = codeMatch[3];
      } else if (boldMatch) {
        if (boldMatch[1]) {
          parts.push(boldMatch[1]);
        }
        parts.push(
          <strong key={`bold-${keyIdx++}`} className="font-bold text-slate-100">
            {boldMatch[2]}
          </strong>
        );
        remaining = boldMatch[3];
      } else {
        parts.push(remaining);
        break;
      }
    }

    return parts;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check code blocks
    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = trimmed.replace('```', '').trim();
        codeBlockContent = [];
      } else {
        inCodeBlock = false;
        elements.push(
          <div key={`code-block-${index}`} className="my-2 rounded-xl bg-slate-950 border border-slate-800 p-2.5 overflow-x-auto text-[10px] font-mono text-emerald-300 shadow-inner">
            {codeBlockLang && (
              <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-1">
                {codeBlockLang}
              </span>
            )}
            <pre>
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          </div>
        );
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    // Heading 3
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h3-${index}`} className="text-xs font-bold text-sky-300 mt-2.5 mb-1 flex items-center gap-1.5 tracking-tight">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
          {trimmed.replace('### ', '')}
        </h4>
      );
      return;
    }

    // Heading 2 or 1
    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      elements.push(
        <h3 key={`h2-${index}`} className="text-sm font-extrabold text-slate-100 mt-3 mb-1.5 tracking-tight border-b border-slate-700/50 pb-1">
          {trimmed.replace(/^#+\s*/, '')}
        </h3>
      );
      return;
    }

    // Bullet points: - or *
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletText = trimmed.replace(/^[-*]\s*/, '');
      elements.push(
        <li key={`li-${index}`} className="ml-3 list-disc text-slate-300 pl-1 my-0.5 leading-relaxed text-xs marker:text-sky-400">
          {renderInline(bulletText)}
        </li>
      );
      return;
    }

    // Numbered lists: 1. 2.
    const numMatch = trimmed.match(/^(\d+)\.\s*(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={`num-${index}`} className="flex items-start gap-1.5 my-0.5 text-xs text-slate-300">
          <span className="font-mono text-sky-400 font-bold text-[10px] shrink-0 w-4">
            {numMatch[1]}.
          </span>
          <span className="leading-relaxed">{renderInline(numMatch[2])}</span>
        </div>
      );
      return;
    }

    // Empty lines
    if (!trimmed) {
      elements.push(<div key={`empty-${index}`} className="h-1.5" />);
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${index}`} className="text-slate-200 leading-relaxed text-xs my-1">
        {renderInline(line)}
      </p>
    );
  });

  return <div className={`space-y-0.5 ${className}`}>{elements}</div>;
};
