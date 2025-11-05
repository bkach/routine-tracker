import { useState, useEffect } from 'react'
import { useRoutineStore } from '../store/routineStore'
import { validateYamlConfig, saveWorkoutToSlug } from '../utils/yaml'
import { showToast } from '../utils/toast'

export function EditorModal() {
  const {
    currentYaml,
    editorOpen,
    setEditorOpen,
    updateConfig,
    showConfirm,
    showInfo,
  } = useRoutineStore()

  const handleShowRoutineInfo = () => {
    const messageHtml = `
      <p>The easiest way to create your own routine:</p>
      <ol>
        <li>Click "Copy" below to copy a ready-to-use prompt</li>
        <li>Paste it into ChatGPT, Claude, or any AI assistant</li>
        <li>Replace <code>[describe your workout here]</code> with your own workout description</li>
        <li>Copy the YAML file it generates and paste it back here in this editor!</li>
      </ol>
      <p><strong>Copy this prompt:</strong></p>
      <div class="info-code-block">
        <button class="info-code-copy-btn" id="routinePromptCopyBtn">Copy</button>
        <code>Can you create a YAML file for a workout routine with [describe your workout here]?

The YAML should have this structure:
[Full specification included when you copy]

Please output only the YAML file in a code block.</code>
      </div>
      <p>That's it! The AI handles all the formatting for you.</p>
    `
    showInfo('Create Your Own Routine', messageHtml)

    // Attach copy handler after modal is shown
    setTimeout(() => {
      const copyBtn = document.getElementById('routinePromptCopyBtn')
      if (copyBtn) {
        copyBtn.addEventListener('click', handleCopyRoutinePrompt)
      }
    }, 100)
  }

  const handleCopyRoutinePrompt = () => {
    const fullPrompt = `Can you create a YAML file for a workout routine with [describe your workout here - e.g., "3 sets of 20 push-ups, 3 sets of 15 squats with 24kg kettlebell, 1 minute plank, and 1 minute side plank on each side"]?

The YAML should have this exact structure:

\`\`\`yaml
title: "Workout Name"
subtitle: "Duration • Frequency"
exercises:
  - section: "Warm-Up"
    name: "Exercise Name"
    type: "reps"
    sets: 2
    reps: "10 reps"
    instructions: "How to perform the exercise"
    feel: null
    restBetweenSets: 30  # Optional - rest between each set
    restAfterExercise: 60  # Optional - rest after all sets
  - section: "Main Workout"
    name: "Another Exercise"
    type: "timed"
    sets: 3
    duration: 45
    instructions: "Hold this position"
    feel: "Core engagement"
    restBetweenSets: 20  # Optional - rest between sets
    restAfterExercise: 90  # Optional - rest after exercise
\`\`\`

Critical rules:
- title and subtitle are NOT list items (no dash before them)
- Each exercise under exercises: IS a list item (dash before section:)
- Type must be exactly "reps" or "timed" (in quotes)
- For "reps" exercises: include sets, reps, instructions, feel (optional)
- For "timed" exercises: include sets, duration (seconds), instructions, feel (optional)
- restBetweenSets (optional): Duration in seconds for rest between each set
  * Automatically injects rest periods between sets
  * For reps exercises: causes expansion to separate cards (one per set)
- restAfterExercise (optional): Duration in seconds for rest after completing all sets
  * Adds a recovery period after the exercise is done
- Each timed exercise with sets > 1 creates multiple cards (one per set)
- For reps exercises: multiple sets shown on one card UNLESS restBetweenSets is specified

Please output only the YAML file in a code block.`

    navigator.clipboard.writeText(fullPrompt).then(() => {
      const btn = document.getElementById('routinePromptCopyBtn')
      if (btn) {
        const originalText = btn.textContent
        btn.textContent = 'Copied!'
        setTimeout(() => {
          btn.textContent = originalText || 'Copy'
        }, 1000)
      }
    })
  }

  const [editedYaml, setEditedYaml] = useState(currentYaml)

  // Update editedYaml when modal opens
  useEffect(() => {
    if (editorOpen) {
      setEditedYaml(currentYaml)
    }
  }, [editorOpen, currentYaml])

  const handleSave = async () => {
    const validation = validateYamlConfig(editedYaml)

    if (!validation.valid) {
      showInfo('Configuration Error', `<p>⚠️ ${validation.error}</p>`)
      return
    }

    try {
      await updateConfig(editedYaml)
      // Keep editor open so user can share after saving
      showToast('✅ Changes saved successfully!')
    } catch (err) {
      showInfo(
        'Save Failed',
        `<p>⚠️ Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}</p>`
      )
    }
  }

  const handleReset = () => {
    showConfirm(
      'Reset Editor',
      'Replace the editor content with a simple template?',
      () => {
        const simpleTemplate = `title: New Routine
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
        setEditedYaml(simpleTemplate)
        showToast('↺ Editor reset to template')
      }
    )
  }

  const handleShare = async () => {
    try {
      // Save workout and get slug
      const slug = await saveWorkoutToSlug(editedYaml)
      const url = `${window.location.origin}${window.location.pathname}?s=${slug}`

      // Copy to clipboard
      await navigator.clipboard.writeText(url)

      showToast('🔗 Share link copied to clipboard!')
    } catch (error) {
      showInfo(
        'Share Failed',
        `<p>⚠️ Failed to create share link: ${error instanceof Error ? error.message : 'Unknown error'}</p><p>Make sure the sharing service is available.</p>`
      )
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setEditorOpen(false)
    }
  }

  return (
    <div
      className={`editor-modal ${editorOpen ? 'open' : ''}`}
      id="editorModal"
      onClick={handleBackdropClick}
    >
      <div className="editor-container">
        <button
          className="modal-close-btn"
          id="editorCloseBtn"
          onClick={() => setEditorOpen(false)}
          title="Close"
        >
          ×
        </button>
        <div className="editor-header">
          <h2>
            Edit Routine{' '}
            <button
              className="info-icon-btn"
              id="routineInfoBtn"
              title="How to create your own routine"
              onClick={handleShowRoutineInfo}
            >
              ?
            </button>
          </h2>
          <div className="editor-header-actions">
            <button
              className="btn btn-secondary"
              id="shareConfigBtn"
              onClick={handleShare}
              style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
            >
              🔗 Share
            </button>
            <button
              className="btn btn-secondary"
              id="resetConfigBtn"
              onClick={handleReset}
              style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
            >
              ↺ Reset
            </button>
            <button
              className="btn btn-primary"
              id="editorSaveBtn"
              onClick={handleSave}
              style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
            >
              Save Changes
            </button>
          </div>
        </div>
        <textarea
          className="editor-textarea"
          id="editorTextarea"
          value={editedYaml}
          onChange={(e) => setEditedYaml(e.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  )
}
