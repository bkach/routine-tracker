import * as yaml from 'js-yaml'
import pako from 'pako'
import type { RoutineConfig } from '../types'

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
