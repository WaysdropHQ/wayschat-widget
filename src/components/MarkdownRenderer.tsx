import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { css } from '@emotion/css'

const markdownStyle = css`
  font-size: 0.875rem;
  line-height: 1.6;
  color: inherit;
  text-align: left;

  p {
    margin: 0 0 0.6rem 0;
    text-align: left;
  }
  p:last-child {
    margin-bottom: 0;
  }
  strong { font-weight: 600; }
  em { font-style: italic; }
  del { text-decoration: line-through; opacity: 0.7; }

  ul, ol {
    margin: 0.4rem 0 0.6rem 0;
    padding-left: 1.4rem;
    text-align: left;
  }
  ul { list-style-type: disc; }
  ol { list-style-type: decimal; }
  li {
    margin-bottom: 0.3rem;
  }
  li > ul, li > ol {
    margin: 0.25rem 0 0.25rem 0;
    padding-left: 1.2rem;
  }
  li:last-child { margin-bottom: 0; }

  /* ── Tables ───────────────────────────────────────── */
  .wds-table-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 0.6rem 0;
    border-radius: 8px;
  }

  table {
    width: 100%;
    min-width: 320px;
    border-collapse: collapse;
    font-size: 0.8125rem;
    line-height: 1.4;
  }

  thead tr {
    background: rgba(255, 255, 255, 0.12);
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  }

  th {
    padding: 7px 12px;
    text-align: left;
    font-weight: 600;
    white-space: nowrap;
    color: inherit;
    opacity: 0.95;
  }

  td {
    padding: 6px 12px;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    word-break: break-word;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  /* align helpers injected by remark-gfm */
  th[align="center"], td[align="center"] { text-align: center; }
  th[align="right"],  td[align="right"]  { text-align: right; }
  th[align="left"],   td[align="left"]   { text-align: left; }

  /* ── Inline code / pre ───────────────────────────── */
  hr {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.25);
    margin: 0.75rem 0;
  }

  code {
    font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
    font-size: 0.8rem;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    padding: 0.1rem 0.35rem;
  }
  pre {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    overflow-x: auto;
    margin: 0.5rem 0;
  }
  pre code {
    background: none;
    padding: 0;
    font-size: 0.78rem;
  }
  blockquote {
    border-left: 3px solid rgba(255, 255, 255, 0.25);
    margin: 0.5rem 0;
    padding-left: 0.75rem;
    opacity: 0.8;
  }
  a {
    color: rgba(255, 255, 255, 0.85);
    text-decoration: underline;
  }
  h1, h2, h3 {
    font-weight: 600;
    margin: 0.6rem 0 0.3rem;
    line-height: 1.3;
    text-align: left;
  }
  h1 { font-size: 1rem; }
  h2 { font-size: 0.95rem; }
  h3 { font-size: 0.875rem; }

  /* ── Task list checkboxes ────────────────────────── */
  input[type="checkbox"] {
    margin-right: 6px;
    accent-color: currentColor;
    pointer-events: none;
  }
`

interface Props {
  content: string
}

const components: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  table: ({ children, ...props }) => (
    <div className="wds-table-wrap">
      <table {...props}>{children}</table>
    </div>
  ),
}

export const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  return (
    <div className={markdownStyle}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}