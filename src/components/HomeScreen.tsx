import React from 'react'
import { css } from '@emotion/css'

const DEFAULT_LOGO = 'https://cdn.waysdrop.com/bulk/horizon_20260411202129966_d25edae2.png'
const DEFAULT_TITLE = 'Hi there! 👋'
const DEFAULT_SUBTITLE = "We're here to help. Ask us anything or share your feedback."

interface Props {
  onStartChat: () => void
  onContinueChat: () => void
  hasHistory: boolean
  onExpand: () => void
  isExpanded: boolean
  /** Custom logo URL. Pass null to hide the logo entirely. */
  logo?: string | null
  title?: string
  subtitle?: string
}

export const HomeScreen: React.FC<Props> = ({
  onStartChat,
  onContinueChat,
  hasHistory,
  onExpand,
  isExpanded,
  logo = DEFAULT_LOGO,
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.topBar}>
        {logo !== null && (
          <div className={styles.logoMark}>
            <img
              src={logo}
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        )}
        <button className={styles.expandBtn} onClick={onExpand}>
          {isExpanded ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
              <line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          )}
        </button>
      </div>

      <div className={styles.hero}>
        {title && <h2 className={styles.heroTitle}>{title}</h2>}
        {subtitle && <p className={styles.heroSub}>{subtitle}</p>}
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Conversations</p>
        {hasHistory ? (
          <button className={styles.conversationCard} onClick={onContinueChat}>
            <div className={styles.cardIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className={styles.cardBody}>
              <span className={styles.cardTitle}>Continue conversation</span>
              <span className={styles.cardSub}>Tap to resume your last chat</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        ) : (
          <div className={styles.emptyHistory}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>No previous conversations</p>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.startBtn} onClick={onStartChat}>
          New conversation
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <p className={styles.poweredBy}>Powered by Waysdrop</p>
      </div>
    </div>
  )
}

const styles = {
  wrapper: css`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--wds-bg);
    text-align: left;
  `,
  topBar: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 18px 0;
    flex-shrink: 0;
  `,
  logoMark: css`
    width: 48px;
    height: 48px;
    flex-shrink: 0;
  `,
  expandBtn: css`
    background: none;
    border: none;
    cursor: pointer;
    color: var(--wds-muted);
    padding: 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    transition: color 0.15s, background 0.15s;
    &:hover {
      color: var(--wds-fg);
      background: var(--wds-muted-bg);
    }
    @media (max-width: 480px) {
      display: none;
    }
  `,
  hero: css`
    padding: 20px 20px 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    flex-shrink: 0;
  `,
  heroTitle: css`
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--wds-fg);
    margin: 0;
    line-height: 1.2;
    text-align: left;
  `,
  heroSub: css`
    font-size: 0.9375rem;
    color: var(--wds-muted);
    margin: 0;
    line-height: 1.6;
    text-align: left;
  `,
  section: css`
    flex: 1;
    padding: 4px 18px 0;
    overflow-y: auto;
  `,
  sectionLabel: css`
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--wds-muted);
    margin: 0 0 12px 2px;
    text-align: left;
  `,
  conversationCard: css`
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 14px 16px;
    background: var(--wds-muted-bg);
    border: 1px solid var(--wds-border);
    border-radius: 14px;
    cursor: pointer;
    text-align: left;
    transition: border-color 0.15s, background 0.15s;
    color: var(--wds-fg);
    &:hover {
      border-color: var(--wds-primary);
      background: var(--wds-primary-soft);
    }
  `,
  cardIcon: css`
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: var(--wds-primary-soft);
    color: var(--wds-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  `,
  cardBody: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
  `,
  cardTitle: css`
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--wds-fg);
    text-align: left;
  `,
  cardSub: css`
    font-size: 12px;
    color: var(--wds-muted);
    text-align: left;
  `,
  emptyHistory: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 40px 0;
    color: var(--wds-muted);
    font-size: 12px;
  `,
  footer: css`
    padding: 18px 18px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    flex-shrink: 0;
    border-top: 1px solid var(--wds-border);
  `,
  startBtn: css`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 13px 16px;
    background: var(--wds-primary);
    color: #fff;
    border: none;
    border-radius: 14px;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
    font-family: inherit;
    &:hover { opacity: 0.88; }
  `,
  poweredBy: css`
    font-size: 11px;
    color: var(--wds-muted);
    margin: 0;
    opacity: 0.7;
  `,
}