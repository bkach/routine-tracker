import { useState, useEffect } from 'react'
import { useRoutineStore } from '../store/routineStore'
import { validateYamlConfig, saveWorkoutToSlug } from '../utils/yaml'
import { showToast } from '../utils/toast'
import { DEFAULT_ROUTINE_TEMPLATE } from '../utils/routineTemplate'

export function EditorModal() {
  const {
    currentYaml,
    editorOpen,
    setEditorOpen,
    updateConfig,
    showConfirm,
    showInfo,
    showInfoHtml,
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
        <code>Create a YAML workout routine from this description: [describe your workout here]

Return exactly one fenced yaml code block and no other text.

[Full specification and example included when you copy]</code>
      </div>
      <p>That's it! The AI handles all the formatting for you.</p>
    `
    showInfoHtml('Create Your Own Routine', messageHtml)

    // Attach copy handler after modal is shown
    setTimeout(() => {
      const copyBtn = document.getElementById('routinePromptCopyBtn') as HTMLButtonElement | null
      if (copyBtn) {
        copyBtn.onclick = handleCopyRoutinePrompt
      }
    }, 100)
  }

  const handleCopyRoutinePrompt = () => {
    const fullPrompt = `Create a YAML workout routine from this description: [describe your workout here - e.g., "3 sets of 20 push-ups, 3 sets of 15 squats with 24kg kettlebell, 1 minute plank, and 1 minute side plank on each side"]

Return exactly one fenced \`yaml\` code block and no other text.

Use this top-level YAML shape and field names exactly. Include optional fields only when applicable:

\`\`\`yaml
title: "Workout Name"
subtitle: "Custom Routine"
exercises:
  - section: "Section Name"
    name: "Exercise Name"
    type: "reps"
    sets: 2
    reps: "10 reps"
    instructions: "How to perform the exercise"
    feel: null
    restBetweenSets: 30
    restAfterExercise: 60
\`\`\`

Example of a valid routine:

\`\`\`yaml
title: "Upper Body + Core"
subtitle: "Custom Routine"

exercises:
  - section: "Warm-Up"
    name: "Arm Circles"
    type: "timed"
    sets: 1
    duration: 30  # duration is always in whole seconds
    instructions: "Make controlled forward and backward circles with both arms."
    feel: "Shoulders warming up"

  - section: "Main Workout"
    name: "Push-ups"
    type: "reps"
    sets: 3
    reps: "12 reps"
    instructions: "Keep your body in a straight line and lower your chest with control."
    feel: "Chest, shoulders, and triceps working"
    restBetweenSets: 45  # include only when the workout description explicitly states rest between sets

  - section: "Main Workout"
    name: "Plank"
    type: "timed"
    sets: 2
    duration: 45
    instructions: "Hold a straight line from shoulders to heels."
    feel: "Core engagement"
    restBetweenSets: 20

  - section: "Main Workout"
    name: "Side Plank (Left)"
    type: "timed"
    sets: 1
    duration: 30
    instructions: "Support yourself on your left forearm and keep hips lifted."
    feel: "Left obliques working"

  - section: "Main Workout"
    name: "Side Plank (Right)"
    type: "timed"
    sets: 1
    duration: 30
    instructions: "Support yourself on your right forearm and keep hips lifted."
    feel: "Right obliques working"
    restAfterExercise: 30  # include only when the workout description explicitly states recovery after the full exercise

  - section: "Cool Down"
    name: "Child's Pose"
    type: "timed"
    sets: 1
    duration: 60
    instructions: "Sit back on your heels, reach your arms forward, and breathe slowly."
    feel: null  # use null when no clear physical cue is implied
\`\`\`

Rules:
- Place \`title\` and \`subtitle\` at the top level, above \`exercises:\`.
- Under \`exercises:\`, each exercise must be a properly indented YAML list item beginning with \`-\`.
- \`type\` must be exactly \`"reps"\` or \`"timed"\`. Do not use any other value.
- For \`"reps"\` exercises, always include \`sets\`, \`reps\`, \`instructions\`, and \`feel\`.
- For \`"timed"\` exercises, always include \`sets\`, \`duration\` as a whole number of seconds, \`instructions\`, and \`feel\`.
- Always include \`feel\`. Use \`feel: null\` when no specific physical cue is clearly implied.
- Include \`restBetweenSets\` only when the workout description explicitly states rest between sets.
- Include \`restAfterExercise\` only when the workout description explicitly states recovery after the full exercise or full set block.
- Do not manually duplicate exercises to represent sets. Define each exercise once with its total number of sets.
- Infer a concise \`title\` and section names from the workout description.
- For \`subtitle\`, include only details explicitly provided by the user or directly computable from the routine. Do not invent frequency. If no reliable subtitle can be inferred, use \`"Custom Routine"\`.
- If a timed exercise is clearly performed separately per side, create separate exercise entries for each side unless the description explicitly says both sides are covered in one timed block.
- Do not add any fields that are not part of this schema.
- The YAML must be syntactically valid.`

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
      showInfo('Configuration Error', validation.error ?? 'Unknown configuration error')
      return
    }

    try {
      await updateConfig(editedYaml)
      // Keep editor open so user can share after saving
      showToast('✅ Changes saved successfully!')
    } catch (err) {
      showInfo(
        'Save Failed',
        `Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    }
  }

  const handleReset = () => {
    showConfirm(
      'Reset Editor',
      'Replace the editor content with a simple template?',
      () => {
        setEditedYaml(DEFAULT_ROUTINE_TEMPLATE)
        showToast('↺ Editor reset to template')
      }
    )
  }

  const handleShare = async () => {
    const validation = validateYamlConfig(editedYaml)
    if (!validation.valid) {
      showInfo('Share Failed', validation.error ?? 'Invalid YAML configuration')
      return
    }

    try {
      // Save workout and get slug
      const slug = await saveWorkoutToSlug(editedYaml)
      const url = `${window.location.origin}${window.location.pathname}?s=${slug}`

      // Try to use native share sheet on mobile
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Workout Routine',
            text: 'Check out this workout routine!',
            url: url
          })
          showToast('🔗 Shared successfully!')
          return
        } catch (shareError) {
          // User cancelled or share failed, fallback to clipboard
          if ((shareError as Error).name !== 'AbortError') {
            console.warn('Share failed, falling back to clipboard:', shareError)
          }
        }
      }

      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(url)
      showToast('🔗 Share link copied to clipboard!')
    } catch (error) {
      showInfo(
        'Share Failed',
        `Failed to create share link: ${error instanceof Error ? error.message : 'Unknown error'}\n\nMake sure the sharing service is available.`
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
