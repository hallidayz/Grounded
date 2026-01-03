import React from 'react';

interface MarkdownRendererProps {
  children: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children, className = '' }) => {
  if (!children) return null;

  // Split by double newlines for paragraphs/blocks
  const blocks = children.split(/\n\n+/);

  return (
    <div className={`space-y-4 ${className}`}>
      {blocks.map((block, index) => {
        // Headers
        if (block.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-bold text-navy-primary dark:text-white mt-4 mb-2">{parseInline(block.replace('### ', ''))}</h3>;
        }
        if (block.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-black text-navy-primary dark:text-white mt-6 mb-3 border-b border-border-soft dark:border-dark-border pb-2">{parseInline(block.replace('## ', ''))}</h2>;
        }
        if (block.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-black text-navy-primary dark:text-white mt-6 mb-4">{parseInline(block.replace('# ', ''))}</h1>;
        }

        // Lists
        if (block.startsWith('- ') || block.startsWith('* ')) {
          const items = block.split('\n').map(line => line.replace(/^[-*] /, ''));
          return (
            <ul key={index} className="list-disc pl-5 space-y-1 text-text-primary dark:text-white">
              {items.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
            </ul>
          );
        }
        
        // Numbered Lists
        if (/^\d+\.\s/.test(block)) {
           const items = block.split('\n').map(line => line.replace(/^\d+\.\s/, ''));
           return (
             <ol key={index} className="list-decimal pl-5 space-y-1 text-text-primary dark:text-white">
               {items.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
             </ol>
           );
        }

        // Paragraphs
        return <p key={index} className="text-sm sm:text-base leading-relaxed text-text-primary dark:text-white">{parseInline(block)}</p>;
      })}
    </div>
  );
};

// Simple inline parser for bold and italic
const parseInline = (text: string): React.ReactNode[] => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      /* PREV: text-navy-primary dark:text-yellow-warm */
      return <strong key={i} className="font-bold text-navy-primary dark:text-brand-light">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

export default MarkdownRenderer;
