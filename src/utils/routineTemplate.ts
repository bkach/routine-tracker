export const DEFAULT_ROUTINE_TEMPLATE = `title: New Routine
subtitle: Custom Routine
exercises:
  # Timed Exercise Example
  - section: Warm-up
    name: Sample Timed Exercise
    type: timed              # Use "timed" for duration-based exercises
    sets: 3
    duration: 30             # Duration in seconds
    instructions: Replace with your exercise
    feel: Optional cue about what to focus on
    restBetweenSets: 15      # Optional: rest between each set (in seconds)
    restAfterExercise: 60    # Optional: rest after all sets complete

  # Reps Exercise Example
  - section: Main Work
    name: Sample Reps Exercise
    type: reps               # Use "reps" for rep-based exercises
    sets: 3
    reps: "10-12 reps"       # Can be "10 reps", "10 each side", etc.
    instructions: Replace with your exercise
    restBetweenSets: 45      # Optional: creates separate cards for each set
    restAfterExercise: 90

  # Quick Reference:
  # - Each exercise must have: section, name, type, sets
  # - Timed exercises need: duration (in seconds)
  # - Reps exercises need: reps (as text, in quotes)
  # - Optional fields: instructions, feel, restBetweenSets, restAfterExercise
  # - Delete these example exercises and add your own!
`
