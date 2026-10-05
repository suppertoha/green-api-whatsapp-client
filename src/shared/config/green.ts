export const GREEN_ID_STORAGE_KEY = "green_id";
export const GREEN_TOKEN_STORAGE_KEY = "green_token";

export const hasGreenCredentials = (): boolean =>
  Boolean(
    localStorage.getItem(GREEN_ID_STORAGE_KEY) &&
      localStorage.getItem(GREEN_TOKEN_STORAGE_KEY),
  );

export const getGreenCredentials = (): { idInstance: string; apiToken: string } | null => {
  const idInstance = localStorage.getItem(GREEN_ID_STORAGE_KEY);
  const apiToken = localStorage.getItem(GREEN_TOKEN_STORAGE_KEY);

  if (!idInstance || !apiToken) {
    return null;
  }

  return { idInstance, apiToken };
};

export const saveGreenCredentials = (idInstance: string, apiToken: string): void => {
  localStorage.setItem(GREEN_ID_STORAGE_KEY, idInstance.trim());
  localStorage.setItem(GREEN_TOKEN_STORAGE_KEY, apiToken.trim());
};

export const clearGreenCredentials = (): void => {
  localStorage.removeItem(GREEN_ID_STORAGE_KEY);
  localStorage.removeItem(GREEN_TOKEN_STORAGE_KEY);
};
