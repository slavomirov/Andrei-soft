import { useEffect, useRef } from "react";
import "./Modal.css";

/* ── Confirm Modal (Yes / No) ─────────────────────────────── */
interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title = "Потвърждение",
  message,
  confirmLabel = "Да",
  cancelLabel = "Не",
  variant = "primary",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            className={`btn ${variant === "danger" ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Alert Modal (OK only) ────────────────────────────────── */
interface AlertModalProps {
  open: boolean;
  title?: string;
  message: string;
  buttonLabel?: string;
  variant?: "danger" | "primary";
  onClose: () => void;
}

export function AlertModal({
  open,
  title = "Съобщение",
  message,
  buttonLabel = "ОК",
  variant = "danger",
  onClose,
}: AlertModalProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) btnRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button
            ref={btnRef}
            className={`btn ${variant === "danger" ? "btn-danger" : "btn-primary"}`}
            onClick={onClose}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
