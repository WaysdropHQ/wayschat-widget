import React, { useEffect, useState } from "react";
import { css } from "@emotion/css";

const BUTTON_SIZE = 56;

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

export const FloatingButton: React.FC<Props> = ({ isOpen, onToggle }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 480);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile && isOpen) {
    return (
      <button
        className={styles.mobileCloseBtn}
        onClick={onToggle}
        type="button"
      >
        <svg
          width="22"
          height="22"
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
    );
  }

  return (
    <button className={styles.btn} onClick={onToggle} type="button">
      <span className={styles.icon(!isOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
        </svg>
      </span>
      <span className={styles.icon(isOpen)}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </span>
    </button>
  );
};

const styles = {
  btn: css`
    position: fixed;
    right: 30px;
    bottom: 20px;
    width: ${BUTTON_SIZE}px;
    height: ${BUTTON_SIZE}px;
    border-radius: 50%;
    background: var(--wds-primary);
    color: #fff;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    -webkit-user-select: none;
    &:hover {
      opacity: 0.92;
    }
  `,
  mobileCloseBtn: css`
    position: fixed;
    top: 16px;
    right: 20px;
    width: ${BUTTON_SIZE}px;
    height: ${BUTTON_SIZE}px;
    border-radius: 50%;
    background: var(--wds-primary);
    color: #fff;
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
    transition:
      opacity 0.2s,
      transform 0.2s;
    opacity: ${visible ? 1 : 0};
    transform: ${visible ? "scale(1)" : "scale(0.6) rotate(30deg)"};
    pointer-events: ${visible ? "auto" : "none"};
  `,
};
