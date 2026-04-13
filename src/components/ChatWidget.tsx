"use client";
import React, { useEffect, useState } from "react";
import { injectGlobal } from "@emotion/css";
import { ChatConfig } from "../types";
import { loadVisitorId } from "../lib/upload";
import { useChat } from "../hooks/useChat";
import { useChatStore } from "../store/chatStore";
import { FloatingButton } from "./FloatingButton";
import { ChatPanel } from "./ChatPanel";
import { HomeScreen } from "./HomeScreen";
import { ChatScreen } from "./ChatScreen";

export type ChatWidgetProps = {
  config: ChatConfig;
};

type View = "home" | "chat";

const LIGHT_VARS = `
  --wds-bg: oklch(1 0 0);
  --wds-fg: oklch(0.145 0 0);
  --wds-muted: oklch(0.556 0 0);
  --wds-muted-bg: oklch(0.97 0 0);
  --wds-border: oklch(0.922 0 0);
`;

const DARK_VARS = `
  --wds-bg: oklch(0.145 0 0);
  --wds-fg: oklch(0.985 0 0);
  --wds-muted: oklch(0.708 0 0);
  --wds-muted-bg: oklch(0.205 0 0);
  --wds-border: oklch(1 0 0 / 10%);
`;

function buildPrimaryVars(color: string) {
  return `
    --wds-primary: ${color};
    --wds-primary-soft: color-mix(in oklch, ${color} 12%, transparent);
    --wds-primary-border: color-mix(in oklch, ${color} 40%, transparent);
  `;
}

const DEFAULT_PRIMARY = "oklch(0.5811 0.2268 259.15)";

function buildThemeStyle(
  theme: "light" | "dark" | "system",
  primaryColor: string,
) {
  const primary = buildPrimaryVars(primaryColor);

  if (theme === "light") {
    return `
      [data-wds-root] {
        ${LIGHT_VARS}
        ${primary}
      }
    `;
  }

  if (theme === "dark") {
    return `
      [data-wds-root] {
        ${DARK_VARS}
        ${primary}
      }
    `;
  }

  return `
    [data-wds-root] {
      ${LIGHT_VARS}
      ${primary}
    }
    @media (prefers-color-scheme: dark) {
      [data-wds-root] {
        ${DARK_VARS}
        --wds-primary-soft: color-mix(in oklch, ${primaryColor} 15%, transparent);
      }
    }
  `;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ config }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [view, setView] = useState<View>("home");
  const [visitorId] = useState<string | undefined>(
    () => config.visitorId ?? loadVisitorId() ?? undefined,
  );

  const resetChat = useChatStore((s) => s.resetChat);

  const resolvedConfig: ChatConfig = {
    ...config,
    visitorId,
  };

  const hasHistory = !!visitorId;

  const {
    status,
    chatStatus,
    messages,
    error,
    sendMessage,
    sendFile,
    isThinking,
  } = useChat(resolvedConfig);

  const isClosed = chatStatus === "RESOLVED" || chatStatus === "CLOSED";

  // When the chat gets closed while the user is on the chat screen, keep them
  // there so they can see the "closed" state — don't auto-redirect.
  // They can go back manually or start a new conversation.

  const handleNewConversation = () => {
    // resetChat keeps visitorId but clears messages/chatId/chatStatus
    // so the next message the user sends goes to a fresh chat thread
    resetChat();
    setView("chat");
  };

  const handleContinueChat = () => {
    // Going back to an existing thread — don't reset anything
    setView("chat");
  };

  useEffect(() => {
    const isMobile = window.innerWidth <= 480;
    if (isMobile) {
      document.body.style.overflow = isOpen ? "hidden" : "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const theme = config.theme ?? "system";
    const primaryColor = config.primaryColor ?? DEFAULT_PRIMARY;
    const style = buildThemeStyle(theme, primaryColor);
    const el = document.createElement("style");
    el.setAttribute("data-wds-theme", "");
    el.textContent = style;
    document.head.appendChild(el);
    return () => {
      document.head.removeChild(el);
    };
  }, [config.theme, config.primaryColor]);

  return (
    <>
      <FloatingButton isOpen={isOpen} onToggle={() => setIsOpen((p) => !p)} />

      <ChatPanel isOpen={isOpen} isExpanded={isExpanded}>
        {view === "home" ? (
          <HomeScreen
            onStartChat={handleNewConversation}
            onContinueChat={handleContinueChat}
            hasHistory={hasHistory}
            onExpand={() => setIsExpanded((p) => !p)}
            isExpanded={isExpanded}
            logo={config.logo}
            title={config.title}
            subtitle={config.subtitle}
          />
        ) : (
          <ChatScreen
            messages={messages}
            onSendText={sendMessage}
            onSendFile={sendFile}
            onBack={() => setView("home")}
            onExpand={() => setIsExpanded((p) => !p)}
            isExpanded={isExpanded}
            status={status}
            error={error}
            isThinking={isThinking}
            isClosed={isClosed}
            acceptedFileTypes={config.acceptedFileTypes}
          />
        )}
      </ChatPanel>
    </>
  );
};

injectGlobal`
  [data-wds-root] * {
    box-sizing: border-box;
    text-align: left;
  }
`;
