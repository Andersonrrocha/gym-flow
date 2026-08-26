"use client";

import { toast as sonnerToast } from "sonner";

type ToastInput = string | { title: string; description?: string };

function normalize(input: ToastInput) {
  return typeof input === "string"
    ? { title: input }
    : { title: input.title, description: input.description };
}

export const toast = sonnerToast;

export function toastSuccess(input: ToastInput) {
  const { title, description } = normalize(input);
  return sonnerToast.success(title, { description });
}

export function toastError(input: ToastInput) {
  const { title, description } = normalize(input);
  return sonnerToast.error(title, { description });
}

export function toastInfo(input: ToastInput) {
  const { title, description } = normalize(input);
  return sonnerToast.info(title, { description });
}

export function toastPromise<T>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error: string },
) {
  return sonnerToast.promise(promise, messages);
}
