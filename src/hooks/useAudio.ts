import { useCallback, useRef } from 'react'
import { useRoutineStore } from '../store/routineStore'
import { END_COUNTDOWN_FREQUENCIES } from '../utils/sound'

/**
 * Custom hook for Web Audio API sound generation
 * Uses precise AudioContext scheduling for better timing
 */
export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const timerSoundEnabled = useRoutineStore((state) => state.settings.timerSoundEnabled)

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
    if (!timerSoundEnabled) return
    playTone(frequency, duration)
  }, [timerSoundEnabled, playTone])

  const playCompletionSound = useCallback(() => {
    if (!timerSoundEnabled) return
    const audioContext = getAudioContext()
    const startTime = audioContext.currentTime

    END_COUNTDOWN_FREQUENCIES.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = freq
      oscillator.type = 'sine'

      const noteStart = startTime + (index * 0.06)
      const noteDuration = 0.3

      gainNode.gain.setValueAtTime(0.3, noteStart)
      gainNode.gain.exponentialRampToValueAtTime(0.01, noteStart + noteDuration)

      oscillator.start(noteStart)
      oscillator.stop(noteStart + noteDuration)
    })
  }, [timerSoundEnabled, getAudioContext])

  const playRoutineComplete = useCallback(() => {
    const audioContext = getAudioContext()

    const pentatonicScale = [
      261.63, 293.66, 329.63, 392.00, 440.00,
      523.25, 587.33, 659.25, 783.99, 880.00,
      1046.50, 1174.66,
    ]

    const numEvents = 5 + Math.floor(Math.random() * 4)
    let currentTime = audioContext.currentTime

    for (let i = 0; i < numEvents; i++) {
      const isChord = Math.random() < 0.3 && i > 0
      const numNotes = isChord ? (Math.random() < 0.5 ? 2 : 3) : 1
      const durationChoices = [0.15, 0.3, 0.5]
      const noteDuration = durationChoices[Math.floor(Math.random() * durationChoices.length)]
      const isLastEvent = i === numEvents - 1

      for (let n = 0; n < numNotes; n++) {
        let noteIndex

        if (isLastEvent && n === 0) {
          noteIndex = 10
        } else if (isChord) {
          noteIndex = 5 + (n * 2)
        } else {
          noteIndex = 4 + Math.floor(Math.random() * 6)
        }

        const freq = pentatonicScale[Math.min(noteIndex, pentatonicScale.length - 1)]
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = freq
        oscillator.type = 'sine'

        const volume = isLastEvent ? 0.35 : 0.2 + Math.random() * 0.1

        gainNode.gain.setValueAtTime(0, currentTime)
        gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + noteDuration)

        oscillator.start(currentTime)
        oscillator.stop(currentTime + noteDuration)
      }

      const spacingChoices = [0.08, 0.15, 0.25]
      const spacing = spacingChoices[Math.floor(Math.random() * spacingChoices.length)]

      currentTime += noteDuration + spacing
    }
  }, [getAudioContext])

  return {
    playBeep,
    playCompletionSound,
    playRoutineComplete,
  }
}
