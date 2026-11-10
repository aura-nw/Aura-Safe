const { removeWebpackPlugin } = require('@rescripts/utilities')

// Console calls stripped from production bundles so that debug output
// (signatures, tx bytes, API errors...) never reaches end users' consoles.
// console.warn / console.error are kept for diagnosing real failures.
const STRIPPED_CONSOLE_FUNCS = ['console.log', 'console.info', 'console.debug', 'console.trace']

const stripConsoleInProduction = (config) => {
  const minimizers = (config.optimization && config.optimization.minimizer) || []

  minimizers
    .filter((plugin) => plugin && plugin.constructor && plugin.constructor.name === 'TerserPlugin')
    .forEach((terser) => {
      // terser-webpack-plugin@4 (react-scripts@4) keeps its config under options.terserOptions
      const terserOptions = (terser.options.terserOptions = terser.options.terserOptions || {})
      const compress = (terserOptions.compress = terserOptions.compress || {})
      compress.pure_funcs = [...(compress.pure_funcs || []), ...STRIPPED_CONSOLE_FUNCS]
    })

  return config
}

module.exports = (config) => {
  const webpackWithoutEsLint = removeWebpackPlugin('ESLintWebpackPlugin', config)
  return stripConsoleInProduction(webpackWithoutEsLint)
}
