import React, { useState } from 'react'
import { css } from '@emotion/css'
import type { ChatProductCard } from '../types'
import { formatMoney } from '../lib/money'

interface Props {
  items: ChatProductCard[]
}

/**
 * Horizontal row of product cards under a WaysAI message (B114). Items are
 * already validated by `parseAttachments`: URLs are https-only and money is
 * well formed. Cards with a `url` are links that open in a new tab; cards
 * without one are plain, non-interactive groups.
 */
export const ProductCards: React.FC<Props> = ({ items }) => {
  const hasLinks = items.some((item) => item.url !== null)

  return (
    <div
      className={styles.scroller}
      role="region"
      aria-label="Suggested products"
      // With no links inside there is nothing to Tab to, so the strip itself
      // takes focus and can be scrolled with the arrow keys.
      tabIndex={hasLinks ? undefined : 0}
    >
      <ul className={styles.list} role="list">
        {items.map((item, index) => (
          <li key={`${item.id}-${index}`} className={styles.item}>
            <ProductCardView item={item} />
          </li>
        ))}
      </ul>
    </div>
  )
}

const ProductCardView: React.FC<{ item: ChatProductCard }> = ({ item }) => {
  const current = formatMoney(item.deal ? item.deal.dealPrice : item.price)
  const was = item.deal ? formatMoney(item.price) : null
  const storeName = item.store?.name ?? null

  const label = [
    item.name,
    current,
    was && item.deal ? `was ${was}, ${item.deal.discountPct}% off` : null,
    storeName,
    item.inStock ? null : 'Out of stock',
    item.url ? 'opens in a new tab' : null,
  ]
    .filter((part): part is string => part !== null)
    .join(', ')

  const body = (
    <>
      <div className={styles.media(item.inStock)}>
        <ProductImage src={item.imageUrl} />
        {item.deal && <span className={styles.offBadge}>-{item.deal.discountPct}%</span>}
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{item.name}</span>
        <span className={styles.prices}>
          <span className={styles.price}>{current}</span>
          {was && <s className={styles.was}>{was}</s>}
        </span>
        {storeName && <span className={styles.store}>{storeName}</span>}
        {!item.inStock && <span className={styles.stock}>Out of stock</span>}
      </div>
    </>
  )

  if (item.url) {
    return (
      <a
        className={styles.card(true, item.inStock)}
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
      >
        {body}
      </a>
    )
  }

  return (
    <div className={styles.card(false, item.inStock)} role="group" aria-label={label}>
      {body}
    </div>
  )
}

const ProductImage: React.FC<{ src: string | null }> = ({ src }) => {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <span className={styles.placeholder} aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 7h12l-1 13H7L6 7z" />
          <path d="M9 7a3 3 0 0 1 6 0" />
        </svg>
      </span>
    )
  }

  return (
    <img
      className={styles.image}
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}

const CARD_WIDTH = 156

const styles = {
  scroller: css`
    width: 100%;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
    scrollbar-width: thin;
    /* Room for the focus ring, which would otherwise be clipped by overflow. */
    padding: 3px 3px 6px;
    margin: -3px -3px 0;
    border-radius: 14px;
    &:focus-visible {
      outline: 2px solid var(--wds-primary);
      outline-offset: 2px;
    }
  `,
  list: css`
    display: flex;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  `,
  item: css`
    flex: 0 0 ${CARD_WIDTH}px;
    scroll-snap-align: start;
    display: flex;
  `,
  card: (interactive: boolean, inStock: boolean) => css`
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 44px;
    overflow: hidden;
    border-radius: 12px;
    background: var(--wds-bg);
    border: 1px solid var(--wds-border);
    color: var(--wds-fg);
    text-decoration: none;
    ${interactive ? 'cursor: pointer;' : ''}
    ${inStock ? '' : 'background: var(--wds-muted-bg);'}
    @media (prefers-reduced-motion: no-preference) {
      transition: border-color 0.15s;
    }
    ${interactive
      ? `
    &:hover { border-color: var(--wds-primary-border); }
    &:focus-visible {
      outline: 2px solid var(--wds-primary);
      outline-offset: 2px;
    }`
      : ''}
  `,
  media: (inStock: boolean) => css`
    position: relative;
    width: 100%;
    /* Reserved box: the image never shifts the layout when it loads or fails. */
    aspect-ratio: 1 / 1;
    background: var(--wds-muted-bg);
    overflow: hidden;
    ${inStock ? '' : 'opacity: 0.5;'}
  `,
  image: css`
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  `,
  placeholder: css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: var(--wds-muted);
  `,
  offBadge: css`
    position: absolute;
    top: 0;
    left: 0;
    padding: 3px 7px;
    border-bottom-right-radius: 10px;
    background: var(--wds-primary);
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    line-height: 1.3;
  `,
  info: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 9px 10px;
    min-width: 0;
  `,
  name: css`
    font-size: 12.5px;
    font-weight: 600;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  `,
  prices: css`
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    column-gap: 6px;
  `,
  price: css`
    font-size: 15px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  `,
  was: css`
    font-size: 11px;
    color: var(--wds-muted);
    font-variant-numeric: tabular-nums;
  `,
  store: css`
    font-size: 11px;
    color: var(--wds-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  stock: css`
    font-size: 11px;
    font-weight: 700;
    color: var(--wds-muted);
  `,
}
