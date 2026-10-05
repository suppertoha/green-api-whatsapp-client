export interface GreenReceiveNotificationResponse {
  receiptId: number;
  body: GreenNotificationBody;
}

export interface GreenNotificationBody {
  typeWebhook: string;
  idMessage?: string;
  senderData?: {
    chatId?: string;
  };
  messageData?: {
    typeMessage?: string;
    textMessageData?: {
      textMessage?: string;
    };
  };
}
