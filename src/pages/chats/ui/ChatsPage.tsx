import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  createChat,
  isValidPhoneDigits,
  resetChatState,
  sendMessage,
  setActiveChatId,
  toDisplayPhone,
} from "@/entities/chat";
import { useLongPolling } from "@/features/receive-messages";
import {
  clearGreenCredentials,
  getGreenCredentials,
  hasGreenCredentials,
  saveGreenCredentials,
} from "@/shared/config";
import styles from "./ChatsPage.module.scss";

export const ChatsPage = () => {
  const dispatch = useAppDispatch();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [isConnected, setIsConnected] = useState(() => hasGreenCredentials());
  const [idInstance, setIdInstance] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [draft, setDraft] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const chats = useAppSelector((state) => state.chat.chats);
  const activeChatId = useAppSelector((state) => state.chat.activeChatId);
  const messagesByChat = useAppSelector((state) => state.chat.messages);
  const [isSending, setIsSending] = useState(false);

  const credentials = isConnected ? getGreenCredentials() : null;
  const activeMessages = useMemo(
    () => (activeChatId ? messagesByChat[activeChatId] ?? [] : []),
    [activeChatId, messagesByChat],
  );

  useLongPolling({ enabled: isConnected });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, activeChatId]);

  const handleConnect = (event: React.FormEvent) => {
    event.preventDefault();

    if (!idInstance.trim() || !apiToken.trim()) {
      return;
    }

    saveGreenCredentials(idInstance, apiToken);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    clearGreenCredentials();
    dispatch(resetChatState());
    setIdInstance("");
    setApiToken("");
    setNewPhone("");
    setDraft("");
    setPhoneError(null);
    setIsConnected(false);
  };

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    setNewPhone(digitsOnly);
    setPhoneError(null);
  };

  const handleCreateChat = () => {
    if (!isValidPhoneDigits(newPhone)) {
      setPhoneError("Введите номер: только цифры, от 10 до 15 символов");
      return;
    }

    dispatch(createChat(newPhone));
    setNewPhone("");
    setPhoneError(null);
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!activeChatId || !draft.trim()) {
      return;
    }

    setIsSending(true);

    const result = await dispatch(sendMessage({ chatId: activeChatId, text: draft }));

    setIsSending(false);

    if (sendMessage.fulfilled.match(result)) {
      setDraft("");
    }
  };

  if (!isConnected) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <p className={styles.brand}>GREEN-API: MAX</p>
          <h1 className={styles.authTitle}>Подключение WhatsApp</h1>
          <p className={styles.authSubtitle}>
            Введите данные инстанса GREEN-API MAX. Ключи сохраняются только в браузере
            и не связаны с основной авторизацией вашего приложения.
          </p>

          <form className={styles.form} onSubmit={handleConnect}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="green-id">ID инстанса</label>
              <input
                id="green-id"
                className={styles.input}
                value={idInstance}
                onChange={(event) => setIdInstance(event.target.value)}
                placeholder="1100123456"
                autoComplete="off"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="green-token">Токен API</label>
              <input
                id="green-token"
                className={styles.input}
                type="password"
                value={apiToken}
                onChange={(event) => setApiToken(event.target.value)}
                placeholder="xxxxxxxxxxxxxxxx"
                autoComplete="off"
              />
            </div>
            <button className={styles.primaryButton} type="submit">
              Подключить WhatsApp
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.instanceBar}>
          <div className={styles.instanceInfo}>
            <p className={styles.instanceLabel}>Инстанс</p>
            <p className={styles.instanceValue}>{credentials?.idInstance}</p>
          </div>
          <button className={styles.logoutButton} type="button" onClick={handleDisconnect}>
            Выйти
          </button>
        </div>

        <div className={styles.createChat}>
          <input
            className={`${styles.input} ${styles.createInput}`}
            value={newPhone}
            onChange={(event) => handlePhoneChange(event.target.value)}
            placeholder="Номер телефона"
            inputMode="numeric"
            aria-label="Номер телефона для нового чата"
          />
          <button
            className={styles.iconButton}
            type="button"
            onClick={handleCreateChat}
            aria-label="Создать чат"
            disabled={!newPhone}
          >
            +
          </button>
        </div>
        {phoneError && (
          <div className={styles.createChatError}>
            <p className={styles.errorText}>{phoneError}</p>
          </div>
        )}

        <ul className={styles.chatList}>
          {chats.map((chat) => (
            <li key={chat.chatId} className={styles.chatItem}>
              <button
                type="button"
                className={`${styles.chatButton} ${
                  activeChatId === chat.chatId ? styles.chatButtonActive : ""
                }`}
                onClick={() => dispatch(setActiveChatId(chat.chatId))}
              >
                +{chat.phone}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className={styles.main}>
        {!activeChatId ? (
          <div className={styles.emptyStateWelcome}>
            Выберите чат или введите номер телефона для начала общения
          </div>
        ) : (
          <>
            <header className={styles.chatHeader}>
              +{toDisplayPhone(activeChatId)}
            </header>

            <div className={styles.messages}>
              {activeMessages.length === 0 ? (
                <div className={styles.emptyState}>Сообщений пока нет — напишите первым</div>
              ) : (
                activeMessages.map((message) => (
                  <div
                    key={message.idMessage}
                    className={`${styles.bubbleRow} ${
                      message.isMe ? styles.bubbleRowMine : styles.bubbleRowTheir
                    }`}
                  >
                    <div
                      className={`${styles.bubble} ${
                        message.isMe ? styles.bubbleMine : styles.bubbleTheir
                      }`}
                    >
                      {message.textMessage}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className={styles.composer} onSubmit={handleSend}>
              <input
                className={`${styles.input} ${styles.createInput}`}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Сообщение"
                aria-label="Текст сообщения"
              />
              <button
                className={styles.sendButton}
                type="submit"
                disabled={isSending || !draft.trim()}
              >
                Отправить
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
};
