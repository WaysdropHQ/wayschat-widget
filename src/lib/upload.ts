import type { ChatConfig } from "../types";

const VISITOR_ID_KEY = "waysdrop_visitor_id";

export const saveVisitorId = (id: string): void => {
  localStorage.setItem(VISITOR_ID_KEY, id);
};

export const loadVisitorId = (): string | null => {
  return localStorage.getItem(VISITOR_ID_KEY);
};

export const clearVisitorId = (): void => {
  localStorage.removeItem(VISITOR_ID_KEY);
};

export const uploadFile = async (
  file: File,
  config: ChatConfig,
): Promise<string> => {
  const formData = new FormData();
  formData.append("files", file);

  const headers: HeadersInit = {};
  if (config.token) headers["Authorization"] = `Bearer ${config.token}`;

  const res = await fetch(`${config.apiUrl}/file/bulk-upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    throw new Error("File upload failed");
  }

  const json = await res.json();

  if (!json.success || !json.data?.urls?.length) {
    throw new Error(json.message || "File upload failed");
  }

  const first = json.data.urls[0];
  if (typeof first !== "string") {
    throw new Error(first?.error || "File upload failed");
  }

  return first;
};