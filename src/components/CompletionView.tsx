import { useEffect } from 'react'
import { useRoutineStore } from '../store/routineStore'
import { useAudio } from '../hooks/useAudio'

export function CompletionView() {
  const { loadConfig } = useRoutineStore()
  const { playRoutineComplete } = useAudio()

  useEffect(() => {
    playRoutineComplete()
  }, [playRoutineComplete])

  const handleRestart = () => {
    loadConfig()
  }

  return (
    <div id="completionView" className="completion-screen">
      <div className="completion-emoji">🎉</div>
      <h2>Routine Complete!</h2>

      <button
        className="btn btn-primary"
        id="restartBtn"
        onClick={handleRestart}
        style={{ maxWidth: '300px', margin: '0 auto', marginTop: '30px' }}
      >
        🔄 Start New Session
      </button>
    </div>
  )
}
