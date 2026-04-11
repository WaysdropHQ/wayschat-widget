import React, { useState, useRef, useCallback, KeyboardEvent } from 'react'
import { css, keyframes } from '@emotion/css'

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scaleY(0.6); }
  50% { opacity: 1; transform: scaleY(1); }
`

interface Props {
  onSendText: (content: string) => void
  onSendFile: (file: File) => Promise<void>
  disabled?: boolean
  isThinking?: boolean
}

export const ChatInput: React.FC<Props> = ({ onSendText, onSendFile, disabled, isThinking }) => {
  const [value, setValue] = useState('')
  const [uploading, setUploading] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingPreview, setPendingPreview] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if ((!trimmed && !pendingFile) || disabled || uploading) return

    if (pendingFile) {
      setUploading(true)
      onSendFile(pendingFile).finally(() => {
        setUploading(false)
        setPendingFile(null)
        setPendingPreview(null)
      })
    }

    if (trimmed) {
      onSendText(trimmed)
      setValue('')
    }

    textareaRef.current?.focus()
  }, [value, pendingFile, disabled, uploading, onSendText, onSendFile])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    setPendingFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPendingPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const canSend = (value.trim() || pendingFile) && !disabled && !uploading

  return (
    <div className={styles.wrapper}>
      {isThinking && (
        <div className={styles.thinkingBar}>
          <div className={styles.thinkingDots}>
            <span className={styles.dot(0)} />
            <span className={styles.dot(1)} />
            <span className={styles.dot(2)} />
          </div>
          <span className={styles.thinkingLabel}>Ways AI is typing...</span>
        </div>
      )}

      {pendingPreview && (
        <div className={styles.imagePreview}>
          <img src={pendingPreview} alt="attachment" className={styles.previewImg} />
          <button className={styles.removeFile} onClick={() => { setPendingFile(null); setPendingPreview(null) }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      <div className={styles.inputRow}>
        <button
          className={styles.attachBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={handleFileChange}
        />

        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled || uploading}
          rows={1}
        />

        <button className={styles.sendBtn} onClick={handleSend} disabled={!canSend} type="button">
          {uploading ? (
            <span className={styles.spinner} />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
            </svg>
          )}
        </button>
      </div>

      <p className={styles.hint}>Enter to send · Shift+Enter for new line</p>
    </div>
  )
}

const styles = {
  wrapper: css`
    padding: 8px 12px 10px;
    border-top: 1px solid var(--wds-border);
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: var(--wds-bg);
    flex-shrink: 0;
  `,
  thinkingBar: css`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 2px 2px;
  `,
  thinkingDots: css`
    display: flex;
    align-items: center;
    gap: 3px;
  `,
  dot: (i: number) => css`
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--wds-primary);
    animation: ${pulse} 1.2s ease-in-out infinite;
    animation-delay: ${i * 0.18}s;
    display: inline-block;
  `,
  thinkingLabel: css`
    font-size: 11px;
    color: var(--wds-muted);
  `,
  imagePreview: css`
    position: relative;
    width: fit-content;
    margin: 0 2px;
  `,
  previewImg: css`
    width: 72px;
    height: 72px;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid var(--wds-border);
    display: block;
  `,
  removeFile: css`
    position: absolute;
    top: -6px;
    right: -6px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--wds-fg);
    color: var(--wds-bg);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  `,
  inputRow: css`
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--wds-muted-bg);
    border: 1px solid var(--wds-border);
    border-radius: 14px;
    padding: 4px 4px 4px 8px;
    transition: border-color 0.15s;
    &:focus-within {
      border-color: var(--wds-primary);
      background: var(--wds-bg);
    }
  `,
  attachBtn: css`
    background: none;
    border: none;
    cursor: pointer;
    color: var(--wds-muted);
    padding: 5px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: color 0.15s;
    &:hover:not(:disabled) {
      color: var(--wds-primary);
    }
    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  `,
  hiddenInput: css`
    display: none;
  `,
  textarea: css`
    flex: 1;
    resize: none;
    border: none;
    padding: 6px 0;
    font-size: 0.875rem;
    font-family: inherit;
    line-height: 1.5;
    background: transparent;
    color: var(--wds-fg);
    outline: none;
    max-height: 120px;
    overflow-y: auto;
    &::placeholder { color: var(--wds-muted); }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
  sendBtn: css`
    background: var(--wds-primary);
    border: none;
    border-radius: 10px;
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #fff;
    flex-shrink: 0;
    transition: opacity 0.15s;
    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    &:hover:not(:disabled) { opacity: 0.85; }
  `,
  spinner: css`
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: ${spin} 0.7s linear infinite;
    display: block;
  `,
  hint: css`
    font-size: 10px;
    color: var(--wds-muted);
    margin: 0;
    text-align: center;
    opacity: 0.7;
    text-align: center;
  `,
}