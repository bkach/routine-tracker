import { describe, expect, it } from 'vitest'
import { expandExercises } from './exercises'
import type { Exercise } from '../types'

describe('expandExercises', () => {
  it('keeps reps exercises with no restBetweenSets on a single card', () => {
    const exercises: Exercise[] = [
      {
        section: 'Strength',
        name: 'Push-ups',
        type: 'reps',
        sets: 3,
        reps: '10 reps',
      },
    ]

    expect(expandExercises(exercises)).toEqual([
      {
        section: 'Strength',
        name: 'Push-ups',
        type: 'reps',
        totalSets: 3,
        reps: '10 reps',
        instructions: undefined,
        feel: undefined,
      },
    ])
  })

  it('injects rest between timed sets and after the exercise', () => {
    const exercises: Exercise[] = [
      {
        section: 'Warm-Up',
        name: 'Ankle Circles',
        type: 'timed',
        sets: 2,
        duration: 30,
        restBetweenSets: 10,
        restAfterExercise: 20,
      },
    ]

    expect(expandExercises(exercises)).toEqual([
      {
        section: 'Warm-Up',
        name: 'Ankle Circles',
        type: 'timed',
        setNumber: 1,
        totalSets: 2,
        duration: 30,
        instructions: undefined,
        feel: undefined,
      },
      {
        section: 'Warm-Up',
        name: 'Rest',
        type: 'timed',
        duration: 10,
        isRest: true,
        isInjectedRest: true,
        restDuration: 10,
      },
      {
        section: 'Warm-Up',
        name: 'Ankle Circles',
        type: 'timed',
        setNumber: 2,
        totalSets: 2,
        duration: 30,
        instructions: undefined,
        feel: undefined,
      },
      {
        section: 'Warm-Up',
        name: 'Rest',
        type: 'timed',
        duration: 20,
        isRest: true,
        isInjectedRest: true,
        restDuration: 20,
      },
    ])
  })
})
