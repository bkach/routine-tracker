import { useRoutineStore } from '../store/routineStore'

export function Controls() {
  const {
    isPaused,
    timerStarted,
    currentIndex,
    exercises,
    startTimer,
    pauseTimer,
    resetTimer,
    nextExercise,
    previousExercise,
  } = useRoutineStore()

  const currentExercise = exercises[currentIndex]
  const isTimedExercise = currentExercise?.type === 'timed'

  const handlePlayPause = () => {
    if (!isTimedExercise) return

    if (isPaused) {
      startTimer()
    } else {
      pauseTimer()
    }
  }

  const isRunning = timerStarted && !isPaused
  const pauseBtnText = isRunning ? '⏸' : '▶'

  return (
    <div className="controls">
      <div className="all-controls">
        <button
          className="btn btn-secondary"
          id="prevBtn"
          onClick={previousExercise}
          disabled={currentIndex === 0}
          title="Previous"
        >
          ←
        </button>
        {isTimedExercise && (
          <>
            <button
              className="btn btn-tertiary"
              id="resetBtn"
              onClick={resetTimer}
              title="Reset"
            >
              🔄
            </button>
            <button
              className="btn btn-tertiary"
              id="pauseBtn"
              onClick={handlePlayPause}
              title="Start/Pause"
            >
              {pauseBtnText}
            </button>
          </>
        )}
        <button
          className="btn btn-primary"
          id="nextBtn"
          onClick={() => nextExercise()}
          title="Next"
        >
          →
        </button>
      </div>
    </div>
  )
}
