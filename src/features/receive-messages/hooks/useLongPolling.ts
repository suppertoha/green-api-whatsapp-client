import { useEffect } from "react";
import { isAxiosError } from "axios";
import { useAppDispatch } from "@/app/store/hooks";
import { addMessage } from "@/entities/chat";
import { greenClient } from "@/shared/api";
import type {
  GreenChatMessage,
  GreenReceiveNotificationResponse,
} from "../model/types";

const POLL_IDLE_MS = 5000;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const isIncomingTextMessage = (
  body: GreenReceiveNotificationResponse["body"] | undefined,
): GreenChatMessage | null => {
  if (body?.typeWebhook !== "incomingMessageReceived") {
    return null;
  }

  const chatId = body.senderData?.chatId;
  const textMessage = body.messageData?.textMessageData?.textMessage;
  const idMessage = body.idMessage;

  if (!chatId || !textMessage || !idMessage) {
    return null;
  }

  return { chatId, textMessage, idMessage };
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

    let isMounted = true;

    const poll = async () => {
      while (isMounted) {
        try {
          const response = await greenClient.get<GreenReceiveNotificationResponse | null>(
            "/ReceiveNotification?receiveTimeout=5",
          );

          if (!isMounted) {
            break;
          }

          if (!response.data || !response.data.receiptId) {
            await sleep(POLL_IDLE_MS);
            continue;
          }

          const incoming = isIncomingTextMessage(response.data.body);

          if (incoming) {
            dispatch(
              addMessage({
                chatId: incoming.chatId,
                message: {
                  idMessage: incoming.idMessage,
                  textMessage: incoming.textMessage,
                  isMe: false,
                },
              }),
            );
          }

          await greenClient.delete(`/DeleteNotification/${response.data.receiptId}`);
        } catch (error) {
          if (!isMounted) {
            break;
          }

          if (isAxiosError(error) && error.code === "ERR_CANCELED") {
            break;
          }

          await sleep(POLL_IDLE_MS);
        }
      }
    };

    void poll();

    return () => {
      isMounted = false;
    };
  }, [dispatch, enabled]);
};
