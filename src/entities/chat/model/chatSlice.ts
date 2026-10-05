import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { greenClient } from "@/shared/api";
import { isValidPhoneDigits, toChatId, toDisplayPhone } from "../lib/chatId";
import type { ChatItem, ChatMessage, ChatSliceState, SendMessageResponse } from "./types";

const initialState: ChatSliceState = {
  activeChatId: null,
  messages: {},
  chats: [],
};

const ensureChatInList = (state: ChatSliceState, chatId: string) => {
  const exists = state.chats.some((chat) => chat.chatId === chatId);

  if (!exists) {
    state.chats.unshift({
      chatId,
      phone: toDisplayPhone(chatId),
    });
  }
};

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    { chatId, text }: { chatId: string; text: string },
    { rejectWithValue },
  ) => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return rejectWithValue("Сообщение не может быть пустым");
    }

    const normalizedChatId = toChatId(chatId);

    try {
      const { data } = await greenClient.post<SendMessageResponse>("sendMessage", {
        chatId: normalizedChatId,
        message: trimmedText,
      });

      if (!data?.idMessage) {
        return rejectWithValue("Не удалось отправить сообщение");
      }

      return {
        chatId: normalizedChatId,
        idMessage: data.idMessage,
        textMessage: trimmedText,
      };
    } catch {
      return rejectWithValue("Ошибка отправки сообщения");
    }
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveChatId: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
    },
    createChat: (state, action: PayloadAction<string>) => {
      const digits = action.payload.replace(/\D/g, "");

      if (!isValidPhoneDigits(digits)) {
        return;
      }

      const chatId = toChatId(digits);
      ensureChatInList(state, chatId);
      state.activeChatId = chatId;
    },
    addMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: Partial<ChatMessage> & { textMessage: string } }>,
    ) => {
      const normalizedChatId = toChatId(action.payload.chatId);
      ensureChatInList(state, normalizedChatId);

      const message: ChatMessage = {
        idMessage: action.payload.message.idMessage ?? `${Date.now()}`,
        textMessage: action.payload.message.textMessage,
        isMe: action.payload.message.isMe ?? false,
      };

      const existing = state.messages[normalizedChatId];

      if (existing) {
        existing.push(message);
      } else {
        state.messages[normalizedChatId] = [message];
      }
    },
    setChats: (state, action: PayloadAction<ChatItem[]>) => {
      state.chats = action.payload;
    },
    resetChatState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      const { chatId, idMessage, textMessage } = action.payload;

      ensureChatInList(state, chatId);
      state.activeChatId = chatId;

      const message: ChatMessage = {
        idMessage,
        textMessage,
        isMe: true,
      };

      const existing = state.messages[chatId];

      if (existing) {
        existing.push(message);
      } else {
        state.messages[chatId] = [message];
      }
    });
  },
});

export const { setActiveChatId, createChat, addMessage, setChats, resetChatState } =
  chatSlice.actions;
export const { reducer: chatReducer } = chatSlice;
