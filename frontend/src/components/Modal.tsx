import { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  title,
  onClose,
  children,
  width = "max-w-md",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-950/40 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${width} rounded-lg bg-white dark:bg-graphite-900 shadow-xl border border-graphite-200 dark:border-graphite-800`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-graphite-200 dark:border-graphite-800">
          <h2 className="font-sans font-semibold text-graphite-900 dark:text-graphite-50">{title}</h2>
          <button
            onClick={onClose}
            className="text-graphite-400 hover:text-graphite-700 dark:hover:text-graphite-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-graphite-600 dark:text-graphite-300">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm rounded-md border border-graphite-300 dark:border-graphite-700 text-graphite-700 dark:text-graphite-200 hover:bg-graphite-100 dark:hover:bg-graphite-800"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`px-3 py-1.5 text-sm rounded-md text-white ${
            destructive ? "bg-red-600 hover:bg-red-700" : "bg-graphite-800 hover:bg-graphite-900"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
