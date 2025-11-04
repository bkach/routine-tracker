import { useState } from 'react'
import { useRoutineStore } from '../store/routineStore'
import type { ExpandedExercise } from '../types'

export function Timeline() {
  const {
    exercises,
    currentIndex,
    timelineOpen,
    setTimelineOpen,
    setEditorOpen,
    goToExercise,
    routineLibrary,
    activeRoutineId,
    selectRoutine,
    deleteRoutine,
    createNewRoutine,
  } = useRoutineStore()

  const [routineDropdownOpen, setRoutineDropdownOpen] = useState(false)

  const routines = Object.values(routineLibrary)
  const activeRoutine = activeRoutineId ? routineLibrary[activeRoutineId] : null
  const activeRoutineName = activeRoutine?.name || 'Select Routine'

  const handleEditClick = () => {
    // Don't close timeline - allow both to be open simultaneously
    setEditorOpen(true)
  }

  const handleSelectRoutine = (id: string) => {
    selectRoutine(id)
    setRoutineDropdownOpen(false)
  }

  const handleDeleteRoutine = (id: string) => {
    deleteRoutine(id)
  }

  const handleCreateNew = async () => {
    // Template with instructions for new routines
    const templateYaml = `title: New Routine
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
    try {
      // Parse YAML to get the title
      const yamlModule = await import('js-yaml')
      const config = yamlModule.load(templateYaml) as any
      const name = config.title || 'New Routine'

      const newId = await createNewRoutine(name, templateYaml)
      await selectRoutine(newId)
      setRoutineDropdownOpen(false)
      setEditorOpen(true)
    } catch (error) {
      console.error('Failed to create routine:', error)
    }
  }

  // Group exercises by section
  const sections: Record<string, Array<ExpandedExercise & { index: number }>> = {}
  exercises.forEach((ex, index) => {
    const sectionName = ex.section || 'Exercises'
    if (!sections[sectionName]) {
      sections[sectionName] = []
    }
    sections[sectionName].push({ ...ex, index })
  })

  const getMeta = (ex: ExpandedExercise) => {
    if (ex.type === 'timed' || ex.isRest) {
      const setInfo = ex.setNumber && ex.totalSets && ex.totalSets > 1
        ? ` • Set ${ex.setNumber}/${ex.totalSets}`
        : ''
      return `${ex.duration}s${setInfo}`
    } else {
      return ex.reps || ''
    }
  }

  return (
    <>
      <div
        className={`timeline-overlay ${timelineOpen ? 'visible' : ''}`}
        id="timelineOverlay"
        onClick={() => setTimelineOpen(false)}
      />

      <div className={`timeline-panel ${timelineOpen ? 'open' : ''}`} id="timelinePanel">
        <div className="timeline-header">
          <div className="routine-selector">
            <button
              className="routine-selector-button"
              onClick={() => setRoutineDropdownOpen(!routineDropdownOpen)}
            >
              <span className="routine-selector-name">{activeRoutineName}</span>
              <span className="routine-selector-arrow">{routineDropdownOpen ? '▲' : '▼'}</span>
            </button>

            {routineDropdownOpen && (
              <div className="routine-selector-dropdown">
                <div className="routine-selector-list">
                  {routines.map((routine) => (
                    <div
                      key={routine.id}
                      className={`routine-selector-item ${routine.id === activeRoutineId ? 'active' : ''}`}
                      onClick={() => handleSelectRoutine(routine.id)}
                    >
                      <span className="routine-selector-item-name">{routine.name}</span>
                      {routine.id === activeRoutineId && <span className="routine-selector-check">✓</span>}
                      {routine.id !== activeRoutineId && (
                        <button
                          className="routine-selector-delete"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteRoutine(routine.id)
                          }}
                          title="Delete routine"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="routine-selector-divider" />
                <button
                  className="routine-selector-new"
                  onClick={handleCreateNew}
                >
                  + New Routine
                </button>
              </div>
            )}
          </div>

          <div className="timeline-header-actions">
            <button
              className="timeline-btn timeline-btn-edit"
              id="editConfigBtn"
              onClick={handleEditClick}
              title="Edit routine configuration"
            >
              ✏️ Edit
            </button>
          </div>
        </div>
        <div id="timelineContent">
          {Object.entries(sections).map(([sectionName, sectionExercises]) => (
            <div key={sectionName} className="timeline-section">
              <div className="timeline-section-title">{sectionName}</div>
              {sectionExercises.map(({ index, ...exercise }) => {
                const isActive = index === currentIndex
                const isCompleted = index < currentIndex
                const meta = getMeta(exercise)
                const restClass = exercise.isRest ? ' rest' : ''

                return (
                  <div
                    key={index}
                    className={`timeline-exercise${restClass} ${isActive ? 'current' : ''} ${
                      isCompleted ? 'completed' : ''
                    }`}
                    data-index={index}
                    onClick={() => {
                      goToExercise(index)
                      setTimelineOpen(false)
                    }}
                  >
                    <div>{exercise.name}</div>
                    <div className="timeline-exercise-meta">{meta}</div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
