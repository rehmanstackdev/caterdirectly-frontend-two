import { callRpc } from "@/utils/supabaseRpc";

/**
 * Cached single source of truth for the public site URL used across auth flows.
 * Reads from public.admin_settings (key: site_url) via RPC get_admin_setting.
 * Falls back to window.location.origin if not set.
 */
let siteUrlCache: string | null = null;

export async function getSiteUrl(): Promise<string> {
  if (siteUrlCache) {
    return siteUrlCache;
  }

  try {
    // Use the rpc wrapper to avoid type union issues on generated functions
    const { data, error } = await callRpc<{ key_name: string }, any>("get_admin_setting", {
      key_name: "site_url",
    });

    if (error) {
      console.warn("[adminSettings] get_admin_setting error:", error);
    }

    let url: string | null = null;

    // Supabase returns the JSONB value parsed; usually a string when stored with to_jsonb('https://...').
    if (typeof data === "string") {
      url = data;
    } else if (data && typeof data === "object") {
      // Handle possible JSON shapes gracefully
      url =
        (data.site_url as string) ||
        (data.value as string) ||
        (data.url as string) ||
        null;
    }

    if (!url || typeof url !== "string") {
      // Use production URL unless we're on localhost
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        url = window.location.origin;
      } else {
        url = 'https://caterdirectly.com';
      }
    }

    // Normalize to no trailing slash for consistency
    siteUrlCache = url.replace(/\/+$/, "");
    return siteUrlCache;
  } catch (e) {
    console.warn("[adminSettings] Failed to read site_url, using origin. Error:", e);
    siteUrlCache = window.location.origin.replace(/\/+$/, "");
    return siteUrlCache;
  }
}
