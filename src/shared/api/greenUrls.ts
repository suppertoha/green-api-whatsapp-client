export const GREEN_API_ORIGIN = "https://api.green-api.com";

export const receiveNotificationUrl = (
  idInstance: string,
  apiToken: string,
  receiveTimeoutSec = 5,
): string =>
  `${GREEN_API_ORIGIN}/waInstance${idInstance}/ReceiveNotification/${apiToken}?receiveTimeout=${receiveTimeoutSec}`;

export const deleteNotificationUrl = (
  idInstance: string,
  apiToken: string,
  receiptId: number | string,
): string =>
  `${GREEN_API_ORIGIN}/waInstance${idInstance}/DeleteNotification/${apiToken}/${receiptId}`;

export const sendMessageUrl = (idInstance: string, apiToken: string): string =>
  `${GREEN_API_ORIGIN}/waInstance${idInstance}/SendMessage/${apiToken}`;
