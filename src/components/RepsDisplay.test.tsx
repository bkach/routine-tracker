import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RepsDisplay } from './RepsDisplay'

describe('RepsDisplay', () => {
  it('shows aggregate set text when reps are not expanded per set', () => {
    render(<RepsDisplay reps="3 reps" totalSets={2} />)

    expect(screen.getByText('2 sets of 3 reps')).toBeTruthy()
  })

  it('shows only the per-set reps text when the exercise is already expanded', () => {
    render(<RepsDisplay reps="3 reps" totalSets={2} setNumber={1} />)

    expect(screen.getByText('3 reps')).toBeTruthy()
  })
})
