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
  } = useRoutineStore()

  const handleEditClick = () => {
    // Don't close timeline - allow both to be open simultaneously
    setEditorOpen(true)
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
          <div className="timeline-header-title">Routine Timeline</div>
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
