import { useCallback, useRef } from 'react'
import { useRoutineStore } from '../store/routineStore'

/**
 * Custom hook for Web Audio API sound generation
 * Uses precise AudioContext scheduling for better timing
 */
export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const { settings } = useRoutineStore()

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }
    return audioContextRef.current
  }, [])

  const playTone = useCallback((frequency: number, duration: number, volume: number = 0.3) => {
    const audioContext = getAudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
  }, [getAudioContext])

  const playBeep = useCallback((frequency: number = 800, duration: number = 0.15) => {
    if (!settings.soundEnabled) return
    playTone(frequency, duration)
  }, [settings.soundEnabled, playTone])

  const playArpeggio = useCallback(() => {
    if (!settings.soundEnabled) return
    const audioContext = getAudioContext()

    // "GO" signal - quick arpeggio using AudioContext timing (not setTimeout)
    const goFrequencies = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    const startTime = audioContext.currentTime

    goFrequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = freq
      oscillator.type = 'sine'

      const noteStart = startTime + (index * 0.06) // 60ms between notes (matching original)
      const noteDuration = 0.3

      gainNode.gain.setValueAtTime(0, noteStart)
      gainNode.gain.linearRampToValueAtTime(0.4, noteStart + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, noteStart + noteDuration)

      oscillator.start(noteStart)
      oscillator.stop(noteStart + noteDuration)
    })
  }, [settings.soundEnabled, getAudioContext])

  const playCountdown = useCallback(() => {
    if (!settings.soundEnabled) return
    getAudioContext() // Initialize context
    const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5

    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        playTone(freq, 0.15)
      }, index * 1000)
    })

    // "GO" signal - quick arpeggio
    setTimeout(() => {
      playArpeggio()
    }, 3000)
  }, [settings.soundEnabled, getAudioContext, playTone, playArpeggio])

  const playCompletionSound = useCallback(() => {
    if (!settings.soundEnabled) return
    const audioContext = getAudioContext()
    const frequencies = [1046.50, 932.33, 659.25, 523.25] // C6, Bb5, E5, C5 (Mixolydian descending)
    const startTime = audioContext.currentTime

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = freq
      oscillator.type = 'sine'

      const noteStart = startTime + (index * 0.06) // 60ms between notes (matching original)
      const noteDuration = 0.3

      gainNode.gain.setValueAtTime(0.3, noteStart)
      gainNode.gain.exponentialRampToValueAtTime(0.01, noteStart + noteDuration)

      oscillator.start(noteStart)
      oscillator.stop(noteStart + noteDuration)
    })
  }, [settings.soundEnabled, getAudioContext])

  const playRoutineComplete = useCallback(() => {
    if (!settings.soundEnabled) return
    const audioContext = getAudioContext()

    // Dynamic completion jingle from original HTML
    // Extended C major pentatonic across 2 octaves for variety
    const pentatonicScale = [
      261.63, 293.66, 329.63, 392.00, 440.00,  // C4, D4, E4, G4, A4
      523.25, 587.33, 659.25, 783.99, 880.00,  // C5, D5, E5, G5, A5
      1046.50, 1174.66                          // C6, D6
    ]

    const numEvents = 5 + Math.floor(Math.random() * 4) // 5-8 musical events
    let currentTime = audioContext.currentTime

    for (let i = 0; i < numEvents; i++) {
      // Randomly decide if this is a single note or chord (30% chance of chord)
      const isChord = Math.random() < 0.3 && i > 0 // No chord on first note
      const numNotes = isChord ? (Math.random() < 0.5 ? 2 : 3) : 1

      // Random note duration: short (0.15s), medium (0.3s), or long (0.5s)
      const durationChoices = [0.15, 0.3, 0.5]
      const noteDuration = durationChoices[Math.floor(Math.random() * durationChoices.length)]

      // Last note should be long and resolve to C
      const isLastEvent = i === numEvents - 1

      for (let n = 0; n < numNotes; n++) {
        let noteIndex

        if (isLastEvent && n === 0) {
          // End on high C for resolution
          noteIndex = 10 // C6
        } else if (isChord) {
          // For chords, use intervals that sound good (thirds and fifths)
          noteIndex = 5 + (n * 2) // Create pleasant intervals
        } else {
          // Random note with bias toward middle-high range
          noteIndex = 4 + Math.floor(Math.random() * 6) // Favor C5-C6 range
        }

        const freq = pentatonicScale[Math.min(noteIndex, pentatonicScale.length - 1)]
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = freq
        oscillator.type = 'sine'

        // Louder for final note
        const volume = isLastEvent ? 0.35 : 0.2 + Math.random() * 0.1

        gainNode.gain.setValueAtTime(0, currentTime)
        gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + noteDuration)

        oscillator.start(currentTime)
        oscillator.stop(currentTime + noteDuration)
      }

      // Varied spacing: short (0.08s), medium (0.15s), or long (0.25s)
      const spacingChoices = [0.08, 0.15, 0.25]
      const spacing = spacingChoices[Math.floor(Math.random() * spacingChoices.length)]

      currentTime += noteDuration + spacing
    }
  }, [settings.soundEnabled, getAudioContext])

  return {
    playBeep,
    playArpeggio,
    playCountdown,
    playCompletionSound,
    playRoutineComplete,
  }
}
