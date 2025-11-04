import * as yaml from 'js-yaml'
import pako from 'pako'
import type { RoutineConfig, RoutineLibrary, RoutineId, RoutineWithId } from '../types'

const LIBRARY_KEY = 'routineLibrary'
const ACTIVE_ROUTINE_KEY = 'activeRoutineId'

/**
 * Load YAML configuration from URL, localStorage, or default file
 */
export async function loadYamlConfig(): Promise<{ yaml: string; config: RoutineConfig }> {
  // Priority 1: Check URL parameter
  const urlParams = new URLSearchParams(window.location.search)
  const encodedData = urlParams.get('data')

  if (encodedData) {
    try {
      const yamlText = decodeYAMLfromURL(encodedData)
      const config = yaml.load(yamlText) as RoutineConfig
      // Save URL config to localStorage for persistence across refreshes
      saveYamlConfig(yamlText)
      return { yaml: yamlText, config }
    } catch (error) {
      console.error('Failed to load from URL:', error)
    }
  }

  // Priority 2: Check localStorage
  const stored = localStorage.getItem('ankleRoutineCustomConfig')
  if (stored) {
    try {
      const config = yaml.load(stored) as RoutineConfig
      return { yaml: stored, config }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
    }
  }

  // Priority 3: Load default from routine.yml
  // Note: Vite serves files from public/ directory at root
  const response = await fetch(`${import.meta.env.BASE_URL}routine.yml`)
  if (!response.ok) {
    throw new Error(`Failed to load routine.yml: ${response.statusText}`)
  }

  const yamlText = await response.text()
  const config = yaml.load(yamlText) as RoutineConfig

  return { yaml: yamlText, config }
}

/**
 * Save YAML configuration to localStorage
 */
export function saveYamlConfig(yamlText: string): void {
  localStorage.setItem('ankleRoutineCustomConfig', yamlText)
}

/**
 * Clear custom configuration from localStorage
 */
export function clearCustomConfig(): void {
  localStorage.removeItem('ankleRoutineCustomConfig')
}

/**
 * Encode YAML to URL-safe base64 string
 */
export function encodeYAMLtoURL(yamlText: string): string {
  const compressed = pako.gzip(yamlText)
  const base64 = btoa(String.fromCharCode.apply(null, Array.from(compressed)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * Decode URL-safe base64 string to YAML
 */
export function decodeYAMLfromURL(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const compressed = Uint8Array.from(atob(base64 + padding), c => c.charCodeAt(0))
  const decompressed = pako.ungzip(compressed, { to: 'string' })
  return decompressed
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

/**
 * Check for URL parameter and import routine if present
 * Returns the ID of the imported routine if successful
 */
export function checkAndImportFromURL(): RoutineId | null {
  const urlParams = new URLSearchParams(window.location.search)
  const encodedData = urlParams.get('data')

  if (encodedData) {
    try {
      const yamlText = decodeYAMLfromURL(encodedData)
      const config = yaml.load(yamlText) as RoutineConfig

      // Generate ID and import into library
      const id = generateRoutineId()
      const name = config.title || 'Imported Routine'

      saveRoutineToLibrary(id, name, yamlText)

      // Clear URL parameter
      window.history.replaceState({}, '', window.location.pathname)

      return id
    } catch (error) {
      console.error('Failed to import from URL:', error)
    }
  }

  return null
}
