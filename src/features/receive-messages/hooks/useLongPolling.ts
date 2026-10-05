import { useEffect } from "react";
import { isAxiosError } from "axios";
import { useAppDispatch } from "@/app/store/hooks";
import { addMessage } from "@/entities/chat";
import {
  fetchReceiveNotification,
  isGreenApiTransportError,
  removeNotification,
} from "@/shared/api";
import type { GreenNotificationBody } from "@/shared/api/greenNotificationTypes";

const POLL_ERROR_BACKOFF_MS = 5000;

const INCOMING_WEBHOOK = "incomingMessageReceived";
const OUTGOING_WEBHOOKS = new Set([
  "outgoingMessageReceived",
  "outgoingAPIMessageReceived",
]);

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

type ParsedWebhookMessage = {
  chatId: string;
  textMessage: string;
  idMessage: string;
  isMe: boolean;
};

const parseWebhookMessage = (
  body: GreenNotificationBody | undefined,
): ParsedWebhookMessage | null => {
  if (!body?.typeWebhook) {
    return null;
  }

  const chatId = body.senderData?.chatId;
  const textMessage = body.messageData?.textMessageData?.textMessage;
  const idMessage = body.idMessage ?? `${Date.now()}`;

  if (!chatId || !textMessage) {
    return null;
  }

  if (body.typeWebhook === INCOMING_WEBHOOK) {
    return { chatId, textMessage, idMessage, isMe: false };
  }

  if (OUTGOING_WEBHOOKS.has(body.typeWebhook)) {
    return { chatId, textMessage, idMessage, isMe: true };
  }

  return null;
};

const scheduleNotificationRemoval = (receiptId: number | string): void => {
  void removeNotification(receiptId).catch(() => {
    // Ошибка delete не блокирует long poll; повторная попытка на следующем receive.
  });
};

type UseLongPollingOptions = {
  enabled: boolean;
};

export const useLongPolling = ({ enabled }: UseLongPollingOptions) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const abortController = new AbortController();
    let isMounted = true;

    const poll = async () => {
      while (isMounted) {
        try {
          const response = await fetchReceiveNotification(5, {
            signal: abortController.signal,
          });

          if (!isMounted) {
            break;
          }

          const receiptId = response.data?.receiptId;

          if (
            !response.data ||
            typeof response.data !== "object" ||
            receiptId === undefined ||
            receiptId === null ||
            String(receiptId) === "undefined"
          ) {
            continue;
          }

          const parsed = parseWebhookMessage(response.data.body);

          if (parsed) {
            dispatch(
              addMessage({
                chatId: parsed.chatId,
                message: {
                  idMessage: parsed.idMessage,
                  textMessage: parsed.textMessage,
                  isMe: parsed.isMe,
                },
              }),
            );
          }

          scheduleNotificationRemoval(receiptId);
        } catch (error) {
          if (!isMounted) {
            break;
          }

          if (isAxiosError(error) && error.code === "ERR_CANCELED") {
            break;
          }

          if (!isGreenApiTransportError(error)) {
            continue;
          }

          await sleep(POLL_ERROR_BACKOFF_MS);
        }
      }
    };

    void poll();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [dispatch, enabled]);
};
