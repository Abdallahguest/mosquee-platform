import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { ReactNode } from "react"

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none prose-gray prose-a:text-green-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }: { href?: string; children?: ReactNode }) => (
            <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="text-green-700 hover:underline">
              {children}
            </a>
          ),
          img: () => null,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
