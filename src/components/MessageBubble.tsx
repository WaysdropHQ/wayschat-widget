import React from 'react'
import { css } from '@emotion/css'
import { ChatMessage } from '../types'
import { MarkdownRenderer } from './MarkdownRenderer'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

interface Props {
  message: ChatMessage
}

export const MessageBubble: React.FC<Props> = ({ message }) => {
  const isCustomer = message.direction === 'OUTBOUND'
  const isBot = message.senderRole === 'BOT'

  return (
    <div className={styles.row(isCustomer)}>
      <div className={styles.group(isCustomer)}>
        {isBot && <span className={styles.botLabel}>Ways AI</span>}
        <div className={styles.bubble(isCustomer)}>
          {message.file && (
            <a href={message.file} target="_blank" rel="noreferrer" className={styles.fileLink(!!message.content)}>
              📎 View attachment
            </a>
          )}
          {message.content && (
            isBot
              ? <MarkdownRenderer content={message.content} />
              : <p className={styles.text}>{message.content}</p>
          )}
        </div>
        <span className={styles.time}>{formatTime(message.createdAt)}</span>
      </div>
    </div>
  )
}

const styles = {
  row: (isCustomer: boolean) => css`
    display: flex;
    width: 100%;
    justify-content: ${isCustomer ? 'flex-start' : 'flex-end'};
  `,
  group: (isCustomer: boolean) => css`
    display: flex;
    flex-direction: column;
    max-width: 78%;
    gap: 4px;
    align-items: ${isCustomer ? 'flex-start' : 'flex-end'};
  `,
  botLabel: css`
    font-size: 10px;
    color: var(--wds-muted);
    padding: 0 4px;
    font-weight: 500;
    letter-spacing: 0.03em;
  `,
  bubble: (isCustomer: boolean) => css`
    border-radius: 18px;
    padding: 10px 14px;
    word-break: break-word;
    text-align: left;
    border-top-left-radius: ${isCustomer ? '4px' : '18px'};
    border-top-right-radius: ${isCustomer ? '18px' : '4px'};
    background: ${isCustomer ? 'var(--wds-muted-bg)' : 'var(--wds-primary)'};
    color: ${isCustomer ? 'var(--wds-fg)' : '#fff'};
  `,
  text: css`
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
    white-space: pre-wrap;
    text-align: left;
  `,
  fileLink: (hasContent: boolean) => css`
    font-size: 0.875rem;
    color: inherit;
    text-decoration: underline;
    display: block;
    text-align: left;
    ${hasContent ? 'margin-bottom: 6px;' : ''}
  `,
  time: css`
    font-size: 10px;
    color: var(--wds-muted);
    padding: 0 4px;
  `,
}