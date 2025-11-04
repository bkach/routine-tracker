import { useEffect } from 'react'
import { useRoutineStore } from './store/routineStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { ExerciseCard } from './components/ExerciseCard'
import { Controls } from './components/Controls'
import { ProgressBar } from './components/ProgressBar'
import { Timeline } from './components/Timeline'
import { SettingsModal } from './components/SettingsModal'
import { EditorModal } from './components/EditorModal'
import { CompletionView } from './components/CompletionView'
import { ConfirmModal } from './components/ConfirmModal'
import { InfoModal } from './components/InfoModal'

function App() {
  const {
    config,
    exercises,
    currentIndex,
    isLoading,
    error,
    loadConfig,
    setTimelineOpen,
    setSettingsOpen,
    confirmModal,
    infoModal,
    hideConfirm,
    hideInfo,
  } = useRoutineStore()

  // Initialize keyboard shortcuts
  useKeyboardShortcuts()

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  if (isLoading) {
    return (
      <div className="container">
        <div className="header">
          <h1>Loading...</h1>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="header">
          <h1>Error</h1>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </div>
    )
  }

  if (!config || exercises.length === 0) {
    return (
      <div className="container">
        <div className="header">
          <h1>No routine loaded</h1>
        </div>
      </div>
    )
  }

  // Check if routine is complete
  const isComplete = currentIndex >= exercises.length

  // Handle confirm modal actions
  const handleConfirm = () => {
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm()
    }
    hideConfirm()
  }

  return (
    <>
      {/* Timeline overlay and panel */}
      <Timeline />

      {/* Settings modal */}
      <SettingsModal />

      {/* Editor modal */}
      <EditorModal />

      {/* Toast notification */}
      <div className="toast" id="toast" />

      {/* Confirm modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={handleConfirm}
        onCancel={hideConfirm}
      />

      {/* Info modal */}
      <InfoModal
        isOpen={infoModal.isOpen}
        title={infoModal.title}
        messageHtml={infoModal.messageHtml}
        onClose={hideInfo}
      />

      <div className="container">
        {/* Timeline and Settings toggle buttons */}
        <button
          className="timeline-toggle"
          id="timelineToggle"
          onClick={() => setTimelineOpen(true)}
          title="Show routine timeline"
        >
          📋
        </button>
        <button
          className="sound-toggle"
          id="settingsToggle"
          onClick={() => setSettingsOpen(true)}
          title="Settings"
        >
          ⚙️
        </button>

        {!isComplete && (
          <div id="exerciseView">
            {/* Header */}
            <div className="header">
              <h1 id="routineTitle">{config.title}</h1>
              <p id="routineSubtitle">{config.subtitle}</p>
            </div>

            {/* Progress bar */}
            <ProgressBar
              currentIndex={currentIndex}
              totalExercises={exercises.length}
              currentExercise={exercises[currentIndex]}
            />

            {/* Exercise card */}
            <ExerciseCard exercise={exercises[currentIndex]} nextExercise={exercises[currentIndex + 1]} />

            {/* Controls */}
            <Controls />
          </div>
        )}

        {/* Completion view - shown when routine is complete */}
        {isComplete && <CompletionView />}
      </div>
    </>
  )
}

export default App
