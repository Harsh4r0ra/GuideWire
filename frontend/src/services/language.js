const SUPPORTED_LANGUAGES = new Set(['en', 'hi'])

export function normalizeLanguage(lang) {
  const value = String(lang ?? '').trim().toLowerCase()
  return SUPPORTED_LANGUAGES.has(value) ? value : 'en'
}

export function getStoredLanguage() {
  const raw = localStorage.getItem('gs_language')
  const normalized = normalizeLanguage(raw)
  if (raw !== normalized) {
    localStorage.setItem('gs_language', normalized)
  }
  return normalized
}

export function setStoredLanguage(lang) {
  const normalized = normalizeLanguage(lang)
  localStorage.setItem('gs_language', normalized)
  return normalized
}

export function getLocale(lang) {
  return normalizeLanguage(lang) === 'hi' ? 'hi-IN' : 'en-IN'
}
