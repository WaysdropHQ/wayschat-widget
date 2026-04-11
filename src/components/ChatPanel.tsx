import React from 'react'
import { css } from '@emotion/css'

interface Props {
  isOpen: boolean
  isExpanded: boolean
  children: React.ReactNode
}

export const ChatPanel: React.FC<Props> = ({ isOpen, isExpanded, children }) => {
  return (
    <div data-wds-root className={styles.panel(isOpen, isExpanded)}>
      <div className={styles.inner}>{children}</div>
    </div>
  )
}

const styles = {
  panel: (isOpen: boolean, isExpanded: boolean) => css`
    position: fixed;
    bottom: 86px;
    z-index: 999998;
    transition: opacity 0.2s, transform 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
    opacity: ${isOpen ? 1 : 0};
    pointer-events: ${isOpen ? 'auto' : 'none'};

    ${isExpanded
      ? `
      width: min(760px, calc(100vw - 32px));
      height: min(780px, calc(100vh - 120px));
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1);
      left: 50%;
      right: auto;
      translate: -50% 0;
      transform: ${isOpen ? 'scale(1)' : 'scale(0.95)'};
      transform-origin: bottom center;
    `
      : `
      width: 400px;
      height: 620px;
      border-radius: 20px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08);
      right: 22px;
      transform: ${isOpen ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)'};
    `}

    overflow: hidden;

    @media (max-width: 480px) {
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      height: 100% !important;
      border-radius: 0 !important;
      translate: none !important;
    }
  `,
  inner: css`
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: inherit;
  `,
}