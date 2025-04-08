/**
 * @type {Object.<String,Object>}
 */
const translations = {
  greet: {
    /** @param {string} name */
    de: (name) => `Hallo ${name}!`,
    /** @param {string} name */
    en: (name) => `Hello, ${name}!`,
  },
}

/**
 * @param {string} key
 * @param {any[]} args
 * @returns {string}
 */
export function translate(key, ...args) {
  const v = translations[key][document.documentElement.lang]
  if (!v) return `missing transation: ${key}`
  if (typeof v === 'string') {
    return v
  }
  if (typeof v === 'function') {
    return v(...args)
  }
  return v
}
