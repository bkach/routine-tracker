import { describe, expect, it } from 'vitest'
import { getSetInfo } from './exercises'
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
