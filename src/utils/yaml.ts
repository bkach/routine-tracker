import * as yaml from 'js-yaml'
import type { RoutineConfig, RoutineLibrary, RoutineId, RoutineWithId } from '../types'

const LIBRARY_KEY = 'routineLibrary'
const ACTIVE_ROUTINE_KEY = 'activeRoutineId'

// Worker API URL - set via environment variable or use default for local dev
const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787'

/**
 * Save workout YAML to backend and get a slug
 */
export async function saveWorkoutToSlug(yamlText: string): Promise<string> {
  const response = await fetch(`${WORKER_URL}/new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: yamlText,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to save workout')
  }

  const data = await response.json()
  return data.slug
}

/**
 * Load workout YAML from backend by slug
 */
export async function loadWorkoutFromSlug(slug: string): Promise<string> {
  const response = await fetch(`${WORKER_URL}/s/${slug}`)

  if (!response.ok) {
    throw new Error(`Failed to load workout: ${response.statusText}`)
  }

  return await response.text()
}

/**
 * Validate YAML configuration
 */
export function validateYamlConfig(yamlText: string): { valid: boolean; error?: string } {
  try {
    const config = yaml.load(yamlText) as RoutineConfig

    if (!config.title) {
      return { valid: false, error: 'Missing required field: title' }
    }

    if (!config.exercises || !Array.isArray(config.exercises)) {
      return { valid: false, error: 'Missing or invalid exercises array' }
    }

    for (const exercise of config.exercises) {
      const ex = exercise as any
      if (!ex.name) {
        return { valid: false, error: 'Exercise missing name' }
      }
      if (!ex.type) {
        return { valid: false, error: `Exercise "${ex.name}" missing type` }
      }
      if (ex.type !== 'timed' && ex.type !== 'reps') {
        return { valid: false, error: `Exercise "${ex.name}" has invalid type: ${ex.type}` }
      }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid YAML syntax'
    }
  }
}

/**
 * Generate a unique routine ID
 */
export function generateRoutineId(): RoutineId {
  return `routine-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Load routine library from localStorage
 */
export function loadRoutineLibrary(): RoutineLibrary {
  const stored = localStorage.getItem(LIBRARY_KEY)
  if (stored) {
    try {
      return JSON.parse(stored) as RoutineLibrary
    } catch (error) {
      console.error('Failed to parse routine library:', error)
    }
  }
  return {}
}

/**
 * Save routine library to localStorage
 */
export function saveRoutineLibrary(library: RoutineLibrary): void {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library))
}

/**
 * Get active routine ID from localStorage
 */
export function getActiveRoutineId(): RoutineId | null {
  return localStorage.getItem(ACTIVE_ROUTINE_KEY)
}

/**
 * Set active routine ID in localStorage
 */
export function setActiveRoutineId(id: RoutineId): void {
  localStorage.setItem(ACTIVE_ROUTINE_KEY, id)
}

/**
 * Add or update a routine in the library
 */
export function saveRoutineToLibrary(id: RoutineId, name: string, yamlText: string): void {
  const config = yaml.load(yamlText) as RoutineConfig
  const library = loadRoutineLibrary()

  library[id] = {
    id,
    name,
    yaml: yamlText, // Store raw YAML to preserve comments
    ...config
  }

  saveRoutineLibrary(library)
}

/**
 * Delete a routine from the library
 */
export function deleteRoutineFromLibrary(id: RoutineId): void {
  const library = loadRoutineLibrary()
  delete library[id]
  saveRoutineLibrary(library)
}

/**
 * Get a routine from the library by ID
 */
export function getRoutineById(id: RoutineId): RoutineWithId | null {
  const library = loadRoutineLibrary()
  return library[id] || null
}

/**
 * Convert routine to YAML string
 * Preserves raw YAML if available to keep comments
 */
export function routineToYaml(routine: RoutineWithId): string {
  // Use stored raw YAML if available (preserves comments)
  if (routine.yaml) {
    return routine.yaml
  }

  // Fallback to generating YAML (loses comments)
  const config: RoutineConfig = {
    title: routine.title,
    subtitle: routine.subtitle,
    exercises: routine.exercises
  }
  return yaml.dump(config)
}

// Track imported slugs to prevent duplicate imports in the same session
const importedSlugs = new Set<string>()

/**
 * Check for URL slug parameter and import routine if present
 * Returns the ID and name of the imported routine if successful
 */
export async function checkAndImportFromURL(): Promise<{ id: RoutineId; name: string } | null> {
  const urlParams = new URLSearchParams(window.location.search)
  const slug = urlParams.get('s')

  if (slug) {
    // Check if we've already imported this slug in this session
    if (importedSlugs.has(slug)) {
      return null
    }

    // Mark this slug as being imported immediately to prevent race conditions
    importedSlugs.add(slug)

    try {
      const yamlText = await loadWorkoutFromSlug(slug)
      const config = yaml.load(yamlText) as RoutineConfig

      // Generate ID and import into library
      const id = generateRoutineId()
      const name = config.title || 'Imported Routine'

      saveRoutineToLibrary(id, name, yamlText)

      // Clear URL parameter
      window.history.replaceState({}, '', window.location.pathname)

      return { id, name }
    } catch (error) {
      console.error('Failed to import from URL:', error)
      // Remove from Set if import failed so it can be retried
      importedSlugs.delete(slug)
    }
  }

  return null
}
