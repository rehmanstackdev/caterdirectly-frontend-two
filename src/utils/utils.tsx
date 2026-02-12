export const getToken = (parsed: boolean = false): string | object | null => {
  const hostTokenKey = "access_token";
  const token = localStorage.getItem(hostTokenKey);
  return parsed ? (token ? JSON.parse(token) : {}) : token;
};

export const setToken = (tokenData: string): void => {
  localStorage.setItem("access_token", tokenData);
};

export const setSystemUserToken = (tokenData: string): void => {
  localStorage.setItem("system_user_access_token", tokenData);
};

export const getSystemUserToken = (parsed: boolean = false): string | object | null => {
  const systemTokenKey = "system_user_access_token";
  const token = localStorage.getItem(systemTokenKey);
  return parsed ? (token ? JSON.parse(token) : {}) : token;
};
export const removeToken = (): void => {
  localStorage.removeItem("access_token");
  sessionStorage.removeItem("userTemplates");
  localStorage.removeItem("system_user_access_token");
  localStorage.removeItem("is_system_user");
};

export const parseJwt = (token: any): Record<string, unknown> => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid JWT token", error);
    return {};
  }
};

export const getAuthHeader = (): Record<string, string> => {
  // Check if user is a system user
  const isSystemUser = localStorage.getItem("is_system_user") === "true";
  
  if (isSystemUser) {
    // Use system user token
    const systemUserData = getSystemUserToken(true) as { 
      system_user_access_token?: string 
    } | null;
    
    return systemUserData && systemUserData?.system_user_access_token
      ? { Authorization: `Bearer ${systemUserData.system_user_access_token}` }
      : {};
  } else {
    // Try multiple token sources in order of priority
    const token = localStorage.getItem("auth_token") || 
                  localStorage.getItem("access_token") ||
                  sessionStorage.getItem("auth_token") ||
                  sessionStorage.getItem("access_token");

    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export const getCurrentUserDetails = (): any => {
  const isSystemUser = localStorage.getItem("is_system_user") === "true";
  
  if (isSystemUser) {
    const systemUserData = getSystemUserToken(true) as any;
    return systemUserData || null;
  } else {
    const userData = getToken(true) as any;
    return userData || null;
  }
};