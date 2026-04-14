import React, { useEffect, useState } from 'react'
import { css } from '@emotion/css'

const BUTTON_SIZE = 66

interface Props {
  isOpen: boolean
  onToggle: () => void
}

export const FloatingButton: React.FC<Props> = ({ isOpen, onToggle }) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 480)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (isMobile && isOpen) {
    return (
      <button className={styles.mobileCloseBtn} onClick={onToggle} type="button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    )
  }

  return (
    <button className={styles.btn} onClick={onToggle} type="button" aria-label={isOpen ? 'Close chat' : 'Open chat'}>
      <span className={styles.icon(!isOpen)}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
          <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
        </svg>
      </span>
      <span className={styles.icon(isOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </span>
    </button>
  )
}

const styles = {
  btn: css`
    position: fixed;
    right: 28px;
    bottom: 24px;
    width: ${BUTTON_SIZE}px;
    height: ${BUTTON_SIZE}px;
    border-radius: 50%;
    background: var(--wds-primary, oklch(0.5811 0.2268 259.15));
    border: none;
    cursor: pointer;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.22), 0 2px 8px rgba(0, 0, 0, 0.12);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    -webkit-user-select: none;
    transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
    &:hover {
      opacity: 0.92;
      transform: scale(1.05);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.26), 0 3px 12px rgba(0, 0, 0, 0.14);
    }
    &:active {
      transform: scale(0.96);
    }
  `,
  mobileCloseBtn: css`
    position: fixed;
    top: 16px;
    right: 20px;
    width: ${BUTTON_SIZE}px;
    height: ${BUTTON_SIZE}px;
    border-radius: 50%;
    background: var(--wds-primary, oklch(0.5811 0.2268 259.15));
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  icon: (visible: boolean) => css`
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.15s, transform 0.15s;
    transition-delay: ${visible ? '0.08s' : '0s'};
    opacity: ${visible ? 1 : 0};
    transform: ${visible ? 'scale(1) rotate(0deg)' : 'scale(0.55) rotate(30deg)'};
    pointer-events: ${visible ? 'auto' : 'none'};
  `,
}