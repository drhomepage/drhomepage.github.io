import bundlerPlugin from '@11ty/eleventy-plugin-bundle'
import { mergeImports } from './src/imports.js'
import nodeResolve from '@rollup/plugin-node-resolve'
import pluginWebc from '@11ty/eleventy-plugin-webc'
import { rollup } from 'rollup'
import virtual from '@rollup/plugin-virtual'
import terser from '@rollup/plugin-terser'
import { EleventyI18nPlugin } from '@11ty/eleventy'
import { eleventyImageTransformPlugin } from '@11ty/eleventy-img'
import { EleventyHtmlBasePlugin } from '@11ty/eleventy'
import yaml from 'js-yaml'

/**
 * @typedef {Object} Page
 * @property {string} lang
 *
 * @typedef {Object} FilterContext
 * @property {Page} page
 */

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function (eleventyConfig) {
  eleventyConfig.setServerOptions({
    domDiff: false,
  })
  eleventyConfig.addPlugin(pluginWebc)
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin)
  eleventyConfig.addPassthroughCopy('favicon.ico')
  eleventyConfig.addPassthroughCopy('robots.txt')
  eleventyConfig.addPassthroughCopy('admin')
  eleventyConfig.addPassthroughCopy('assets')

  eleventyConfig.addPlugin(bundlerPlugin, {
    transforms: [
      /**
       * @this {{type:string}}
       * @param {string} content
       */
      async function (content) {
        if (this.type === 'js') {
          const opts = {
            input: 'temp.js',
            plugins: [
              nodeResolve(),
              virtual({ 'temp.js': mergeImports(content) }),
              terser(),
            ],
          }
          const outputOpts = {} // { sourcemap: 'inline' }
          const bundle = await rollup(opts)
          const output = (await bundle.generate(outputOpts)).output[0]
          return output.code
        }

        return content
      },
    ],
  })

  eleventyConfig.addWatchTarget('./src/') // to refresh if sth. changes

  eleventyConfig.addPlugin(EleventyI18nPlugin, {
    defaultLanguage: 'de',
    errorMode: 'throw',
  })

  /**
   * @param {Object.<string, string>|string} dict
   * @param {Object|any} params
   * @this {FilterContext}
   * @returns {string}
   */
  function dr18(dict, params) {
    if (typeof dict === 'string') return dict
    const v = dict[this.page.lang]
    if (typeof v === 'string' && params && typeof params === 'object') {
      return v.replace(/\{(\w+)\}/g, (match, key) => params[key] || '')
    }
    return v
  }
  eleventyConfig.addFilter('dr18', dr18)

  /**
   * @param {Object.<string, Object>} collections
   * @param {string} key
   * @this {FilterContext}
   * @returns {Object}
   */
  function dr18c(collections, key) {
    return collections[`${key}_${this.page.lang || 'de'}`]
  }
  eleventyConfig.addFilter('dr18c', dr18c)

  function drProd() {
    return process.env.NODE_ENV === 'production'
  }
  eleventyConfig.addFilter('drProd', drProd)

  /** @param {string|null} thing */
  const drExists = (thing) => !!thing
  eleventyConfig.addFilter('drExists', drExists)

  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    // which file extensions to process
    extensions: 'html',

    // Add any other Image utility options here:

    // optional, output image formats
    // formats: ['webp', 'jpeg'],

    // optional, output image widths
    widths: [480, 'auto'],

    // optional, attributes assigned on <img> override these values.
    defaultAttributes: {
      sizes: '(max-width: 600px) 480px, 100vw',
      loading: 'lazy',
      decoding: 'async',
    },
  })

  eleventyConfig.addDataExtension('yml', (/** @type {string} */ contents) =>
    yaml.load(contents),
  )
}
