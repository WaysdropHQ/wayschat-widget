import React, { useEffect, useRef, useState } from 'react'
import { css, keyframes } from '@emotion/css'
import { ChatMessage } from '../types'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'

interface Props {
  messages: ChatMessage[]
  onSendText: (content: string) => void
  onSendFile: (file: File) => Promise<void>
  onBack: () => void
  onExpand: () => void
  isExpanded: boolean
  status: string
  error: { code: number; message: string } | null
}

export const ChatScreen: React.FC<Props> = ({
  messages,
  onSendText,
  onSendFile,
  onBack,
  onExpand,
  isExpanded,
  status,
  error,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const connected = status === 'connected'
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const lastMsg = messages[messages.length - 1]
  const isThinking = connected && lastMsg?.direction === 'OUTBOUND'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 80)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button className={styles.iconBtn} onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <div className={styles.headerCenter}>
          <span className={styles.headerTitle}>Support</span>
          <span className={styles.statusDot(connected)} />
          <span className={styles.statusLabel}>{connected ? 'Online' : 'Connecting...'}</span>
        </div>

        <button className={styles.expandBtn} onClick={onExpand}>
          {isExpanded ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
              <line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          )}
        </button>
      </div>

      <div className={styles.messagesWrap}>
        <div className={styles.messages} ref={scrollRef} onScroll={handleScroll}>
          {error && <div className={styles.errorBanner}>{error.message}</div>}
          {messages.length === 0 && connected && (
            <div className={styles.emptyState}>
              <p>Send a message to start the conversation.</p>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        {showScrollBtn && (
          <button className={styles.scrollBtn} onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        )}
      </div>

      <ChatInput
        onSendText={onSendText}
        onSendFile={onSendFile}
        disabled={!connected}
        isThinking={isThinking}
      />
    </div>
  )
}

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`

const styles = {
  wrapper: css`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--wds-bg);
  `,
  header: css`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-bottom: 1px solid var(--wds-border);
    flex-shrink: 0;
  `,
  headerCenter: css`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
  `,
  headerTitle: css`
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--wds-fg);
  `,
  statusDot: (connected: boolean) => css`
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    background: ${connected ? '#22c55e' : '#f59e0b'};
    animation: ${connected ? 'none' : `${pulse} 1.2s ease-in-out infinite`};
  `,
  statusLabel: css`
    font-size: 11px;
    color: var(--wds-muted);
  `,
  iconBtn: css`
    background: none;
    border: none;
    cursor: pointer;
    color: var(--wds-muted);
    padding: 6px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: color 0.15s, background 0.15s;
    &:hover {
      color: var(--wds-fg);
      background: var(--wds-muted-bg);
    }
  `,
  expandBtn: css`
    background: none;
    border: none;
    cursor: pointer;
    color: var(--wds-muted);
    padding: 6px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: color 0.15s, background 0.15s;
    &:hover {
      color: var(--wds-fg);
      background: var(--wds-muted-bg);
    }
    @media (max-width: 480px) {
      display: none;
    }
  `,
  messagesWrap: css`
    flex: 1;
    position: relative;
    overflow: hidden;
  `,
  messages: css`
    position: absolute;
    inset: 0;
    overflow-y: auto;
    padding: 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `,
  errorBanner: css`
    background: oklch(0.9705 0.0129 17.04);
    color: oklch(0.5054 0.1905 27.51);
    border: 1px solid oklch(0.8845 0.0592 18.27);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 12px;
    text-align: center;
  `,
  emptyState: css`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--wds-muted);
    font-size: 13px;
    text-align: center;
    padding: 40px 20px;
  `,
  scrollBtn: css`
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--wds-bg);
    border: 1px solid var(--wds-border);
    color: var(--wds-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    transition: color 0.15s, border-color 0.15s;
    &:hover {
      color: var(--wds-primary);
      border-color: var(--wds-primary);
    }
  `,
}