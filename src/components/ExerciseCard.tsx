import type { ExpandedExercise } from '../types'
import { getSetInfo } from '../utils/exercises'
import { Timer } from './Timer'
import { RepsDisplay } from './RepsDisplay'
import { useRoutineStore } from '../store/routineStore'
import { useTimer } from '../hooks/useTimer'

interface ExerciseCardProps {
  exercise: ExpandedExercise
  nextExercise?: ExpandedExercise
}

export function ExerciseCard({ exercise, nextExercise }: ExerciseCardProps) {
  const { elapsedSeconds } = useRoutineStore()
  useTimer() // Initialize timer hook

  const setInfo = getSetInfo(exercise)

  return (
    <div className={`exercise-card ${exercise.isRest ? 'rest' : ''}`}>
      <span className="section-badge" id="sectionBadge">
        {exercise.section?.toUpperCase()}
      </span>
      <h2 className="exercise-title" id="exerciseTitle">{exercise.name}</h2>
      <div className="set-info" id="setInfo">{setInfo}</div>

      {exercise.type === 'timed' && exercise.duration ? (
        <Timer
          elapsedSeconds={elapsedSeconds}
          duration={exercise.duration}
          isRest={exercise.isRest}
        />
      ) : (
        <RepsDisplay reps={exercise.reps || ''} totalSets={exercise.totalSets} />
      )}

      <div className="instructions">
        <div id="instructionsText">
          {exercise.isRest ? (
            <p>Take a break and prepare for the next exercise.</p>
          ) : (
            <p>{exercise.instructions || ''}</p>
          )}
        </div>
        {exercise.feel && !exercise.isRest && (
          <div id="feelCue" className="feel-cue">
            👉 Feel: {exercise.feel}
          </div>
        )}
      </div>

      <div className={`next-preview ${nextExercise ? '' : 'hidden'}`} id="nextPreview">
        {nextExercise && (
          <>
            <strong>UP NEXT:</strong> {nextExercise.name}{' '}
            <span style={{ color: '#999', fontSize: '13px' }}>• {nextExercise.section}</span>
          </>
        )}
      </div>
    </div>
  )
}
