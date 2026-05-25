import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => (
          <strong className="font-bold text-ink">{children}</strong>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-bamboo pl-3 my-2 text-pencil italic font-[family-name:var(--font-serif)]">
            {children}
          </blockquote>
        ),
        code: ({ children, className }) => {
          const isInline = !className;
          return isInline ? (
            <code className="bg-paper-deep text-seal px-1 py-0.5 rounded-sm text-sm font-[family-name:var(--font-mono)]">
              {children}
            </code>
          ) : (
            <pre className="bg-paper-deep p-3 rounded-md overflow-x-auto my-2 text-sm font-[family-name:var(--font-mono)] border border-bamboo">
              <code>{children}</code>
            </pre>
          );
        },
        ul: ({ children }) => (
          <ul className="list-none space-y-1 my-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="before:content-['·'] before:mr-2 before:text-seal">{children}</li>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="w-full border-collapse border border-bamboo text-sm">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-bamboo px-3 py-1.5 bg-paper-deep font-medium text-ink">
            {children}
          </th>
        ),
        td: ({ children, style }) => {
          const isLast = style?.textAlign === "right";
          const rowBg = isLast ? undefined : undefined;
          return (
            <td className={`border border-bamboo px-3 py-1.5 ${isLast ? "text-right" : ""}`}>
              {children}
            </td>
          );
        },
        hr: () => <hr className="border-bamboo my-4" />,
        a: ({ href, children }) => (
          <a href={href} className="text-seal underline hover:text-seal/80" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
