export {
  addMessage,
  chatReducer,
  createChat,
  resetChatState,
  sendMessage,
  setActiveChatId,
  setChats,
} from "./model/chatSlice";
export type { ChatItem, ChatMessage, ChatSliceState } from "./model/types";
export { isValidPhoneDigits, toChatId, toDisplayPhone } from "./lib/chatId";
