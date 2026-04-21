import React from 'react'
import { css, keyframes } from '@emotion/css'
import type { SupportTypingActor } from '../types'

interface Props {
  actor: Exclude<SupportTypingActor, 'USER'>
}

export const TypingBubble: React.FC<Props> = ({ actor }) => {
  const label = actor === 'WAYSAI' ? 'Support' : 'Support'

  return (
    <div className={styles.row}>
      <div className={styles.group}>
        <span className={styles.botLabel}>{label}</span>
        <div className={styles.bubble} aria-label="typing">
          <span className={styles.dot(0)} />
          <span className={styles.dot(1)} />
          <span className={styles.dot(2)} />
        </div>
      </div>
    </div>
  )
}

const bounce = keyframes`
  0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
  30% { transform: translateY(-4px); opacity: 1; }
`

const styles = {
  row: css`
    display: flex;
    width: 100%;
    justify-content: flex-start;
  `,
  group: css`
    display: flex;
    flex-direction: column;
    max-width: 78%;
    gap: 4px;
    align-items: flex-start;
  `,
  botLabel: css`
    font-size: 10px;
    color: var(--wds-muted);
    padding: 0 4px;
    font-weight: 500;
    letter-spacing: 0.03em;
  `,
  bubble: css`
    border-radius: 18px;
    border-top-left-radius: 4px;
    border-top-right-radius: 18px;
    padding: 12px 14px;
    background: var(--wds-primary);
    color: #fff;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 16px;
  `,
  dot: (i: number) => css`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #fff;
    display: inline-block;
    animation: ${bounce} 1.1s ease-in-out infinite;
    animation-delay: ${i * 0.16}s;
  `,
}
