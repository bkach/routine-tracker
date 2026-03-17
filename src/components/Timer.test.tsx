import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { Timer } from './Timer'
import { useRoutineStore } from '../store/routineStore'

describe('Timer', () => {
  beforeEach(() => {
    useRoutineStore.setState({
      isPaused: false,
      timerStarted: true,
      settings: {
        soundEnabled: true,
        endCountdownEnabled: true,
        autoAdvanceEnabled: false,
      },
    })
  })

  it('shows a 3-2-1 countdown during the final three seconds when enabled', () => {
    render(<Timer elapsedSeconds={7} duration={10} />)

    expect(screen.getByText('3')).toBeTruthy()
  })

  it('shows elapsed and total time when the end countdown is disabled', () => {
    useRoutineStore.setState({
      settings: {
        soundEnabled: true,
        endCountdownEnabled: false,
        autoAdvanceEnabled: false,
      },
    })

    render(<Timer elapsedSeconds={7} duration={10} />)

    expect(screen.getByText('0:07 / 0:10')).toBeTruthy()
  })
})
