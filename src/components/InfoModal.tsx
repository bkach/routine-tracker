import { useEffect } from 'react'

interface InfoModalProps {
  isOpen: boolean
  title: string
  messageHtml: string
  onClose: () => void
}

export function InfoModal({ isOpen, title, messageHtml, onClose }: InfoModalProps) {
  useEffect(() => {
    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="info-modal show"
      id="infoModal"
      onClick={handleBackdropClick}
    >
      <div className="info-dialog">
        <button
          className="modal-close-btn"
          id="infoCloseBtnX"
          title="Close"
          onClick={onClose}
        >
          ×
        </button>
        <div className="info-title" id="infoTitle">{title}</div>
        <div
          className="info-message"
          id="infoMessage"
          dangerouslySetInnerHTML={{ __html: messageHtml }}
        />
        <div className="info-actions">
          <button
            className="btn btn-primary"
            id="infoOkBtn"
            style={{ padding: '12px 24px' }}
            onClick={onClose}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}
