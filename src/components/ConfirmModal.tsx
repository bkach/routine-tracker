import { useEffect } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  useEffect(() => {
    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onCancel])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="confirm-modal show"
      id="confirmModal"
      onClick={handleBackdropClick}
    >
      <div className="confirm-dialog">
        <button
          className="modal-close-btn"
          id="confirmCloseBtnX"
          title="Close"
          onClick={onCancel}
        >
          ×
        </button>
        <div className="confirm-title" id="confirmTitle">{title}</div>
        <div className="confirm-message" id="confirmMessage">{message}</div>
        <div className="confirm-actions">
          <button
            className="btn btn-secondary"
            id="confirmCancelBtn"
            style={{ padding: '12px 24px' }}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            id="confirmOkBtn"
            style={{ padding: '12px 24px' }}
            onClick={onConfirm}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
