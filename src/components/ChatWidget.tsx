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

export const ChatWidget: React.FC<ChatWidgetProps> = ({ config }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [view, setView] = useState<View>("home");
  const [visitorId] = useState<string | undefined>(
    () => config.visitorId ?? loadVisitorId() ?? undefined,
  );

  const reset = useChatStore((s) => s.reset);

  const resolvedConfig: ChatConfig = {
    ...config,
    visitorId,
  };

  const hasHistory = !!visitorId;

  const { status, messages, error, sendMessage, sendFile } =
    useChat(resolvedConfig);

  const handleNewConversation = () => {
    reset();
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

  return (
    <>
      <FloatingButton isOpen={isOpen} onToggle={() => setIsOpen((p) => !p)} />

      <ChatPanel isOpen={isOpen} isExpanded={isExpanded}>
        {view === "home" ? (
          <HomeScreen
            onStartChat={handleNewConversation}
            onContinueChat={() => setView("chat")}
            hasHistory={hasHistory}
            onExpand={() => setIsExpanded((p) => !p)}
            isExpanded={isExpanded}
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
          />
        )}
      </ChatPanel>
    </>
  );
};

injectGlobal`
  :root {
    --wds-primary: oklch(0.5811 0.2268 259.15);
    --wds-primary-soft: oklch(0.5811 0.2268 259.15 / 0.12);
    --wds-primary-border: oklch(0.7695 0.1177 255.22 / 0.4);
    --wds-bg: oklch(1 0 0);
    --wds-fg: oklch(0.145 0 0);
    --wds-muted: oklch(0.556 0 0);
    --wds-muted-bg: oklch(0.97 0 0);
    --wds-border: oklch(0.922 0 0);
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --wds-bg: oklch(0.145 0 0);
      --wds-fg: oklch(0.985 0 0);
      --wds-muted: oklch(0.708 0 0);
      --wds-muted-bg: oklch(0.205 0 0);
      --wds-border: oklch(1 0 0 / 10%);
      --wds-primary-soft: oklch(0.5811 0.2268 259.15 / 0.15);
    }
  }

  [data-wds-root] * {
    box-sizing: border-box;
    text-align: left;
  }
`;
