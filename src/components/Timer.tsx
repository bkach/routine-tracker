import { formatTime } from '../utils/exercises'
import { useRoutineStore } from '../store/routineStore'

interface TimerProps {
  elapsedSeconds: number
  duration: number
  isRest?: boolean
}

export function Timer({ elapsedSeconds, duration, isRest }: TimerProps) {
  const { countdownSeconds } = useRoutineStore()
  const elapsed = formatTime(elapsedSeconds)
  const total = formatTime(duration)

  // Show countdown if active, otherwise show timer
  const displayText = countdownSeconds !== null ? String(countdownSeconds) : `${elapsed} / ${total}`

  return (
    <div className={`timer-display ${isRest ? 'rest' : ''}`} id="timerContainer">
      <div className="timer-label" id="timerLabel">Time</div>
      <div className="timer-time" id="timerDisplay">{displayText}</div>
    </div>
  )
}
