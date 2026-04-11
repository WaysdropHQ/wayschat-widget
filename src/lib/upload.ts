import type { ChatConfig } from "../types";

const VISITOR_ID_KEY = "waysdrop_visitor_id";

// ─── Visitor ID persistence ───────────────────────────────────────────────────

export const saveVisitorId = (id: string): void => {
  localStorage.setItem(VISITOR_ID_KEY, id);
};

export const loadVisitorId = (): string | null => {
  return localStorage.getItem(VISITOR_ID_KEY);
};

export const clearVisitorId = (): void => {
  localStorage.removeItem(VISITOR_ID_KEY);
};

// ─── File upload ──────────────────────────────────────────────────────────────

// TODO: wire chat summary fetch → GET /support-chat/:chatId/summary (admin only, requires bearer token)

export const uploadFile = async (
  file: File,
  config: ChatConfig,
): Promise<string> => {
  const formData = new FormData();
  formData.append("upload-file", file);

  const res = await fetch(`${config.apiUrl}/file/single-upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("File upload failed");
  }

  const json = await res.json();

  if (!json.success || !json.data) {
    throw new Error(json.message || "File upload failed");
  }

  return json.data.url;
};
