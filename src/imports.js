const importRE = /^\s*import\s\{\s(.+)\s\}\sfrom\s'(.+)'$/gm

/**
 * Merges import statements in the given code
 * @param {string} code - The code to process
 * @returns {string} The processed code with merged imports
 */
export const mergeImports = (code) => {
  const importMatches = [...code.matchAll(importRE)]

  /**
   * @type {Object.<string, Set<string>>}
   */
  const importMap = {}

  importMatches.forEach(([match, imports, source]) => {
    importMap[source] ||= new Set()
    imports.split(', ').forEach((imp) => importMap[source].add(imp))
  })

  const importHeader = Object.entries(importMap)
    .map(
      ([source, imports]) =>
        `import { ${Array.from(imports).join(', ')} } from '${source}'\n`,
    )
    .join('')
  const importRest = code.replace(importRE, '')

  return importHeader + importRest
}
