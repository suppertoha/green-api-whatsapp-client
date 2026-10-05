import { isAxiosError, type AxiosResponse } from "axios";
import { getGreenCredentials } from "@/shared/config/green";
import type { SendMessageResponse } from "@/entities/chat/model/types";
import type { GreenReceiveNotificationResponse } from "./greenNotificationTypes";
import { greenClient } from "./greenClient";
import {
  deleteNotificationUrl,
  receiveNotificationUrl,
  sendMessageUrl,
} from "./greenUrls";

export type GreenApiRequestOptions = {
  signal?: AbortSignal;
};

export const fetchReceiveNotification = (
  receiveTimeoutSec = 5,
  options?: GreenApiRequestOptions,
): Promise<AxiosResponse<GreenReceiveNotificationResponse | null>> => {
  const credentials = getGreenCredentials();

  if (!credentials) {
    return Promise.reject(new Error("GREEN-API credentials are missing"));
  }

  const { idInstance, apiToken } = credentials;
  const url = receiveNotificationUrl(idInstance, apiToken, receiveTimeoutSec);

  return greenClient.get<GreenReceiveNotificationResponse | null>(url, {
    signal: options?.signal,
  });
};

export const removeNotification = (
  receiptId: number | string,
  options?: GreenApiRequestOptions,
): Promise<AxiosResponse<{ result?: boolean }>> => {
  const credentials = getGreenCredentials();

  if (!credentials) {
    return Promise.reject(new Error("GREEN-API credentials are missing"));
  }

  const numericReceiptId = Number(receiptId);

  if (!Number.isFinite(numericReceiptId)) {
    return Promise.reject(new Error(`Invalid receiptId: ${String(receiptId)}`));
  }

  const { idInstance, apiToken } = credentials;
  const url = deleteNotificationUrl({
    idInstance,
    apiToken,
    receiptId: numericReceiptId,
  });

  return greenClient.request<{ result?: boolean }>({
    method: "DELETE",
    url,
    signal: options?.signal,
    headers: {
      "Content-Type": undefined,
    },
  });
};

export const isGreenApiTransportError = (error: unknown): boolean => {
  if (!isAxiosError(error)) {
    return true;
  }

  if (error.code === "ERR_CANCELED") {
    return false;
  }

  const status = error.response?.status;

  if (status === undefined) {
    return true;
  }

  if (status === 408) {
    return false;
  }

  return status >= 400;
};

export const sendGreenMessage = (
  payload: {
    chatId: string;
    message: string;
  },
  options?: GreenApiRequestOptions,
): Promise<AxiosResponse<SendMessageResponse>> => {
  const credentials = getGreenCredentials();

  if (!credentials) {
    return Promise.reject(new Error("GREEN-API credentials are missing"));
  }

  const { idInstance, apiToken } = credentials;
  const url = sendMessageUrl(idInstance, apiToken);

  return greenClient.post<SendMessageResponse>(url, payload, {
    signal: options?.signal,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
