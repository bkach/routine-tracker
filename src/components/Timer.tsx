import { formatTime } from '../utils/exercises'

interface TimerProps {
  elapsedSeconds: number
  duration: number
  isRest?: boolean
}

export function Timer({ elapsedSeconds, duration, isRest }: TimerProps) {
  const elapsed = formatTime(elapsedSeconds)
  const total = formatTime(duration)

  return (
    <div className={`timer-display ${isRest ? 'rest' : ''}`} id="timerContainer">
      <div className="timer-label" id="timerLabel">Time</div>
      <div className="timer-time" id="timerDisplay">{`${elapsed} / ${total}`}</div>
    </div>
  )
}
