import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none prose-gray prose-a:text-green-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Sécurité : forcer les liens externes en nouvel onglet + noopener
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-green-700 hover:underline"
            >
              {children}
            </a>
          ),
          // Empêcher les images (sécurité + simplicité)
          img: () => null,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
