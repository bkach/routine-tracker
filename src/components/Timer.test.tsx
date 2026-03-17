import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Timer } from './Timer'

describe('Timer', () => {
  it('shows elapsed and total time during timed exercises', () => {
    render(<Timer elapsedSeconds={7} duration={10} />)

    expect(screen.getByText('0:07 / 0:10')).toBeTruthy()
  })

  it('shows rest timers with the same elapsed and total format', () => {
    render(<Timer elapsedSeconds={1} duration={3} isRest />)

    expect(screen.getByText('0:01 / 0:03')).toBeTruthy()
  })
})
