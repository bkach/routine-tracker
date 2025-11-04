import { useRoutineStore } from '../store/routineStore'

export function SettingsModal() {
  const { settings, settingsOpen, setSettingsOpen, updateSettings } = useRoutineStore()

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSettingsOpen(false)
    }
  }

  return (
    <div
      className={`editor-modal ${settingsOpen ? 'open' : ''}`}
      id="settingsModal"
      onClick={handleBackdropClick}
    >
      <div className="settings-container">
        <button
          className="modal-close-btn"
          id="settingsCloseBtnX"
          onClick={() => setSettingsOpen(false)}
          title="Close"
        >
          ×
        </button>
        <div className="settings-header">
          <h2>Settings</h2>
          <button
            className="btn btn-primary"
            id="settingsCloseBtn"
            onClick={() => setSettingsOpen(false)}
            style={{ padding: '10px 20px', fontSize: '14px' }}
          >
            Done
          </button>
        </div>
        <div className="settings-content">
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                id="soundEnabledCheckbox"
                className="setting-checkbox"
                checked={settings.soundEnabled}
                onChange={(e) =>
                  updateSettings({ soundEnabled: e.target.checked })
                }
              />
              <span className="setting-text">
                <strong>Enable sound</strong>
                <small>Play beeps during countdown and completion chimes</small>
              </span>
            </label>
          </div>
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                id="countdownEnabledCheckbox"
                className="setting-checkbox"
                checked={settings.countdownEnabled}
                onChange={(e) =>
                  updateSettings({ countdownEnabled: e.target.checked })
                }
              />
              <span className="setting-text">
                <strong>Countdown before timers</strong>
                <small>3-2-1 countdown before each timed exercise</small>
              </span>
            </label>
          </div>
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                id="autoAdvanceEnabledCheckbox"
                className="setting-checkbox"
                checked={settings.autoAdvanceEnabled}
                onChange={(e) =>
                  updateSettings({ autoAdvanceEnabled: e.target.checked })
                }
              />
              <span className="setting-text">
                <strong>Auto-advance timed exercises</strong>
                <small>Automatically move to next exercise when timer completes</small>
              </span>
            </label>
          </div>
          <div className="settings-tip">
            <strong>💡 Tip: Keyboard shortcuts</strong>
            <div className="settings-tip-content">
              <kbd>←</kbd> <kbd>→</kbd> to navigate • <kbd>Space</kbd> to start/pause
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
