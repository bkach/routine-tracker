import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTimer } from './useTimer'
import { useRoutineStore } from '../store/routineStore'
import type { ExpandedExercise } from '../types'

vi.mock('./useAudio', () => ({
  useAudio: () => ({
    playBeep: vi.fn(),
    playCompletionSound: vi.fn(),
    playRoutineComplete: vi.fn(),
  }),
}))

const timedExercises: ExpandedExercise[] = [
  {
    section: 'Main',
    name: 'Exercise A',
    type: 'timed',
    duration: 5,
  },
  {
    section: 'Main',
    name: 'Exercise B',
    type: 'timed',
    duration: 8,
  },
]

describe('useTimer auto-advance', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useRoutineStore.setState({
      exercises: timedExercises,
      currentIndex: 0,
      elapsedSeconds: 4,
      isPaused: false,
      timerStarted: true,
      settings: {
        speechEnabled: false,
        timerSoundEnabled: true,
        autoAdvanceEnabled: true,
      },
    })
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('cancels stale auto-advance if the user navigates away before the delay ends', () => {
    const { rerender, unmount } = renderHook(() => useTimer())

    act(() => {
      useRoutineStore.setState({ elapsedSeconds: 5 })
      rerender()
    })

    act(() => {
      useRoutineStore.setState({
        currentIndex: 1,
        elapsedSeconds: 0,
        isPaused: true,
        timerStarted: false,
      })
      rerender()
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(useRoutineStore.getState().currentIndex).toBe(1)
    unmount()
  })

  it('still auto-advances when the completed exercise is still current', () => {
    const { rerender, unmount } = renderHook(() => useTimer())

    act(() => {
      useRoutineStore.setState({ elapsedSeconds: 5 })
      rerender()
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(useRoutineStore.getState().currentIndex).toBe(1)
    expect(useRoutineStore.getState().timerStarted).toBe(true)
    expect(useRoutineStore.getState().isPaused).toBe(false)
    unmount()
  })
})
