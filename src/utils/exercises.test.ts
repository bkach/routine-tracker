import { describe, expect, it } from 'vitest'
import {
  calculateRemainingWorkoutTime,
  expandExercises,
  isFullyTimedRoutine,
} from './exercises'
import type { Exercise, ExpandedExercise } from '../types'

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

  it('identifies fully timed expanded routines', () => {
    const timedExercises: ExpandedExercise[] = [
      {
        section: 'Warm-Up',
        name: 'Rest',
        type: 'timed',
        duration: 20,
        isRest: true,
      },
      {
        section: 'Main',
        name: 'Wall Sit',
        type: 'timed',
        duration: 45,
      },
    ]

    const mixedExercises: ExpandedExercise[] = [
      ...timedExercises,
      {
        section: 'Main',
        name: 'Push-ups',
        type: 'reps',
        reps: '10 reps',
      },
    ]

    expect(isFullyTimedRoutine(timedExercises)).toBe(true)
    expect(isFullyTimedRoutine(mixedExercises)).toBe(false)
  })

  it('calculates remaining workout time from the current timed card onward', () => {
    const exercises: ExpandedExercise[] = [
      {
        section: 'Warm-Up',
        name: 'Jumping Jacks',
        type: 'timed',
        duration: 60,
      },
      {
        section: 'Warm-Up',
        name: 'Rest',
        type: 'timed',
        duration: 15,
        isRest: true,
      },
      {
        section: 'Main',
        name: 'Plank',
        type: 'timed',
        duration: 45,
      },
    ]

    expect(calculateRemainingWorkoutTime(exercises, 0, 20)).toBe(100)
    expect(calculateRemainingWorkoutTime(exercises, 1, 5)).toBe(55)
    expect(calculateRemainingWorkoutTime(exercises, 3, 0)).toBe(0)
  })
})
