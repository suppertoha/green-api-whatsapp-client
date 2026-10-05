export const toChatId = (phoneOrChatId: string): string => {
  const trimmed = phoneOrChatId.trim();

  if (trimmed.endsWith("@c.us")) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, "");

  return `${digits}@c.us`;
};

export const toDisplayPhone = (chatId: string): string => chatId.replace("@c.us", "");

export const isValidPhoneDigits = (value: string): boolean => /^\d{10,15}$/.test(value);
