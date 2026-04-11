import {
  calculateProgress,
  calculateRemainingWorkoutTime,
  formatTime,
  isFullyTimedRoutine,
} from '../utils/exercises'
import type { ExpandedExercise } from '../types'

interface ProgressBarProps {
  currentIndex: number
  totalExercises: number
  exercises: ExpandedExercise[]
  currentExercise: ExpandedExercise
  elapsedSeconds: number
}

export function ProgressBar({
  currentIndex,
  totalExercises,
  exercises,
  currentExercise,
  elapsedSeconds,
}: ProgressBarProps) {
  const progress = calculateProgress(currentIndex, totalExercises)
  const shouldShowRemainingTime = isFullyTimedRoutine(exercises)
  const remainingWorkoutTime = shouldShowRemainingTime
    ? formatTime(calculateRemainingWorkoutTime(exercises, currentIndex, elapsedSeconds))
    : null

  return (
    <div className="progress-container">
      <div className="progress-text">
        <span id="progressText">Exercise {currentIndex + 1} of {totalExercises}</span>
        <span id="sectionName">{currentExercise.section}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" id="progressFill" style={{ width: `${progress}%` }} />
      </div>
      {remainingWorkoutTime && (
        <div className="progress-subtext" id="remainingWorkoutTime">
          {remainingWorkoutTime}
        </div>
      )}
    </div>
  )
}
