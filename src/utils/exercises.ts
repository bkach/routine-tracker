import type { Exercise, ExpandedExercise } from '../types'

/**
 * Expand exercises into individual sets with injected rest periods
 * Matches the logic from the original vanilla JS implementation
 */
export function expandExercises(exercises: Exercise[]): ExpandedExercise[] {
  const expanded: ExpandedExercise[] = []

  exercises.forEach((exercise) => {
    if (exercise.type === 'timed') {
      // Timed exercises: Always expand into separate cards per set
      for (let set = 1; set <= exercise.sets; set++) {
        expanded.push({
          section: exercise.section,
          name: exercise.name,
          type: 'timed',
          setNumber: set,
          totalSets: exercise.sets,
          duration: exercise.duration,
          instructions: exercise.instructions,
          feel: exercise.feel,
        })

        // Inject rest between sets (if not the last set)
        if (set < exercise.sets && exercise.restBetweenSets) {
          expanded.push({
            section: exercise.section,
            name: 'Rest',
            type: 'timed',
            duration: exercise.restBetweenSets,
            isRest: true,
            isInjectedRest: true,
            restDuration: exercise.restBetweenSets,
          })
        }
      }
    } else {
      // Rep exercises
      if (exercise.restBetweenSets) {
        // If restBetweenSets is specified: expand into separate cards per set
        for (let set = 1; set <= exercise.sets; set++) {
          expanded.push({
            section: exercise.section,
            name: exercise.name,
            type: 'reps',
            setNumber: set,
            totalSets: exercise.sets,
            reps: exercise.reps,
            instructions: exercise.instructions,
            feel: exercise.feel,
          })

          // Inject rest between sets (if not the last set)
          if (set < exercise.sets && exercise.restBetweenSets) {
            expanded.push({
              section: exercise.section,
              name: 'Rest',
              type: 'timed',
              duration: exercise.restBetweenSets,
              isRest: true,
              isInjectedRest: true,
              restDuration: exercise.restBetweenSets,
            })
          }
        }
      } else {
        // No restBetweenSets: single card showing all sets
        expanded.push({
          section: exercise.section,
          name: exercise.name,
          type: 'reps',
          totalSets: exercise.sets,
          reps: exercise.reps,
          instructions: exercise.instructions,
          feel: exercise.feel,
        })
      }
    }

    // Inject rest after all sets of the exercise are complete
    if (exercise.restAfterExercise) {
      expanded.push({
        section: exercise.section,
        name: 'Rest',
        type: 'timed',
        duration: exercise.restAfterExercise,
        isRest: true,
        isInjectedRest: true,
        restDuration: exercise.restAfterExercise,
      })
    }
  })

  return expanded
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get set information text for display
 */
export function getSetInfo(exercise: ExpandedExercise): string {
  if (exercise.isRest) {
    return ''
  }

  if (exercise.type === 'reps' && !exercise.setNumber) {
    // Combined reps display for multi-set exercises only.
    if (exercise.totalSets && exercise.totalSets > 1) {
      return `${exercise.totalSets} sets of ${exercise.reps}`
    }
    return ''
  }

  if (exercise.setNumber && exercise.totalSets) {
    return `Set ${exercise.setNumber} of ${exercise.totalSets}`
  }

  return ''
}

function formatDurationForSpeech(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes > 0 && remainingSeconds > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ${remainingSeconds} second${remainingSeconds === 1 ? '' : 's'}`
  }

  if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`
  }

  return `${remainingSeconds} second${remainingSeconds === 1 ? '' : 's'}`
}

export function getSpeechText(exercise: ExpandedExercise): string {
  if (exercise.isRest) {
    return exercise.duration ? `${exercise.name}. ${formatDurationForSpeech(exercise.duration)}.` : exercise.name
  }

  const parts = [exercise.name]

  if (exercise.type === 'timed' && exercise.duration) {
    parts.push(formatDurationForSpeech(exercise.duration))
    return `${parts.join('. ')}.`
  }

  if (exercise.type === 'reps' && exercise.reps) {
    if (exercise.setNumber && exercise.totalSets) {
      parts.push(`set ${exercise.setNumber} of ${exercise.totalSets}`)
    } else if (exercise.totalSets && exercise.totalSets > 1) {
      parts.push(`${exercise.totalSets} sets`)
    }

    parts.push(exercise.reps)
    return `${parts.join('. ')}.`
  }

  return exercise.name
}

/**
 * Calculate total routine duration in seconds
 */
export function calculateTotalDuration(exercises: ExpandedExercise[]): number {
  return exercises.reduce((total, exercise) => {
    if (exercise.duration) {
      return total + exercise.duration
    }
    return total
  }, 0)
}

/**
 * Whether every card in the routine is timed, including injected rest cards.
 */
export function isFullyTimedRoutine(exercises: ExpandedExercise[]): boolean {
  return exercises.length > 0 && exercises.every((exercise) => exercise.type === 'timed' && typeof exercise.duration === 'number')
}

/**
 * Calculate the remaining workout time from the current card onward.
 */
export function calculateRemainingWorkoutTime(
  exercises: ExpandedExercise[],
  currentIndex: number,
  elapsedSeconds: number,
): number {
  if (currentIndex >= exercises.length) {
    return 0
  }

  return exercises.slice(currentIndex).reduce((remaining, exercise, index) => {
    const duration = exercise.duration ?? 0

    if (index === 0) {
      return remaining + Math.max(duration - elapsedSeconds, 0)
    }

    return remaining + duration
  }, 0)
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(currentIndex: number, totalExercises: number): number {
  if (totalExercises === 0) return 0
  return ((currentIndex + 1) / totalExercises) * 100
}
