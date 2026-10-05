export interface ChatMessage {
  idMessage: string;
  textMessage: string;
  isMe: boolean;
}

export interface ChatItem {
  chatId: string;
  phone: string;
}

export interface ChatSliceState {
  activeChatId: string | null;
  messages: Record<string, ChatMessage[]>;
  chats: ChatItem[];
}

export interface SendMessageResponse {
  idMessage: string;
}
