import React, { useState, useRef, useCallback, KeyboardEvent } from "react";
import { css, keyframes } from "@emotion/css";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

interface Props {
  onSendText: (content: string) => void;
  onSendFile: (file: File, content?: string) => Promise<void>;
  disabled?: boolean;
  isClosed?: boolean;
  /** Accepted MIME types string e.g. "image/*,application/pdf". Defaults to common types. */
  acceptedFileTypes?: string;
}

const DEFAULT_ACCEPT =
  "image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt";

const AUTO_GROW_MAX = 160; // px — textarea stops growing after this

function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  const next = Math.min(el.scrollHeight, AUTO_GROW_MAX);
  el.style.height = `${next}px`;
}

export const ChatInput: React.FC<Props> = ({
  onSendText,
  onSendFile,
  disabled,
  isClosed,
  acceptedFileTypes = DEFAULT_ACCEPT,
}) => {
  const [value, setValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLocked = disabled || uploading || !!isClosed;

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if ((!trimmed && !pendingFile) || isLocked) return;

    if (pendingFile) {
      setUploading(true);
      onSendFile(pendingFile, trimmed || undefined).finally(() => {
        setUploading(false);
        setPendingFile(null);
        setPendingPreview(null);
        setValue("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      });
    } else if (trimmed) {
      onSendText(trimmed);
      setValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }

    textareaRef.current?.focus();
  }, [value, pendingFile, isLocked, onSendText, onSendFile]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey) {
      // Shift+Enter: insert newline, let textarea grow
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    autoGrow(e.target);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingFile(file);

    // Only generate image previews; other types show file name
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPendingPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPendingPreview(null);
    }

    e.target.value = "";
  };

  const canSend = (value.trim() || pendingFile) && !isLocked;

  if (isClosed) {
    return (
      <div className={styles.closedBar}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0, opacity: 0.6 }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        This conversation has been closed
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {pendingFile && (
        <div className={styles.filePreview}>
          {pendingPreview ? (
            <img
              src={pendingPreview}
              alt="attachment"
              className={styles.previewImg}
            />
          ) : (
            <div className={styles.fileChip}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>{pendingFile.name}</span>
            </div>
          )}
          <button
            className={styles.removeFile}
            onClick={() => {
              setPendingFile(null);
              setPendingPreview(null);
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      <div className={styles.inputRow}>
        <button
          className={styles.attachBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={isLocked}
          type="button"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          className={styles.hiddenInput}
          onChange={handleFileChange}
        />

        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isLocked}
          rows={1}
        />

        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={!canSend}
          type="button"
        >
          {uploading ? (
            <span className={styles.spinner} />
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          )}
        </button>
      </div>

      <p className={styles.hint}>Enter to send · Shift+Enter for new line</p>
    </div>
  );
};

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
  closedBar: css`
    padding: 14px 16px;
    border-top: 1px solid var(--wds-border);
    background: var(--wds-muted-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
    color: var(--wds-muted);
    flex-shrink: 0;
    text-align: center;
  `,
  filePreview: css`
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
  fileChip: css`
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--wds-muted-bg);
    border: 1px solid var(--wds-border);
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 12px;
    color: var(--wds-fg);
    max-width: 200px;
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
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
    align-items: flex-end;
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
    margin-bottom: 3px;
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
    overflow-y: auto;
    min-height: 32px;
    max-height: ${AUTO_GROW_MAX}px;
    &::placeholder {
      color: var(--wds-muted);
    }
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
    margin-bottom: 1px;
    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    &:hover:not(:disabled) {
      opacity: 0.85;
    }
  `,
  spinner: css`
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
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
  `,
};
