import { describe, expect, it } from 'vitest'
import { END_COUNTDOWN_FREQUENCIES } from './sound'

describe('END_COUNTDOWN_FREQUENCIES', () => {
  it('matches the shared 3-2-1 tones plus the final resolving chime note', () => {
    expect(END_COUNTDOWN_FREQUENCIES).toEqual([523.25, 659.25, 783.99, 1046.5])
  })
})
