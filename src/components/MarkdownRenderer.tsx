import React from 'react'
import ReactMarkdown from 'react-markdown'
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

  hr {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.25);
    margin: 0.75rem 0;
  }

  code {
    font-family: monospace;
    font-size: 0.8rem;
    background: rgba(255,255,255,0.15);
    border-radius: 4px;
    padding: 0.1rem 0.35rem;
  }
  pre {
    background: rgba(255,255,255,0.1);
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
    border-left: 3px solid rgba(255,255,255,0.25);
    margin: 0.5rem 0;
    padding-left: 0.75rem;
    opacity: 0.8;
  }
  a {
    color: rgba(255,255,255,0.85);
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
`

interface Props {
  content: string
}

export const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  return (
    <div className={markdownStyle}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}