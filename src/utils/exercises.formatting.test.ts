import { describe, expect, it } from 'vitest'
import { getSetInfo, getSpeechText } from './exercises'
import type { ExpandedExercise } from '../types'

describe('getSetInfo', () => {
  it('shows aggregate set info for combined multi-set reps exercises', () => {
    const exercise: ExpandedExercise = {
      section: 'Wrap Up',
      name: 'Push-ups',
      type: 'reps',
      totalSets: 2,
      reps: '5 reps',
    }

    expect(getSetInfo(exercise)).toBe('2 sets of 5 reps')
  })

  it('hides aggregate set info for combined single-set reps exercises', () => {
    const exercise: ExpandedExercise = {
      section: 'Wrap Up',
      name: 'Air Squats',
      type: 'reps',
      totalSets: 1,
      reps: '5 reps',
    }

    expect(getSetInfo(exercise)).toBe('')
  })
})

describe('getSpeechText', () => {
  it('includes duration details for timed exercises without set info', () => {
    const exercise: ExpandedExercise = {
      section: 'Warm Up',
      name: 'High Knees',
      type: 'timed',
      setNumber: 2,
      totalSets: 3,
      duration: 45,
    }

    expect(getSpeechText(exercise)).toBe('High Knees. 45 seconds.')
  })

  it('includes set count and reps for combined reps exercises', () => {
    const exercise: ExpandedExercise = {
      section: 'Strength',
      name: 'Push-ups',
      type: 'reps',
      totalSets: 3,
      reps: '10 reps',
    }

    expect(getSpeechText(exercise)).toBe('Push-ups. 3 sets. 10 reps.')
  })

  it('formats mixed minute and second durations naturally', () => {
    const exercise: ExpandedExercise = {
      section: 'Core',
      name: 'Plank',
      type: 'timed',
      duration: 90,
    }

    expect(getSpeechText(exercise)).toBe('Plank. 1 minute 30 seconds.')
  })
})
