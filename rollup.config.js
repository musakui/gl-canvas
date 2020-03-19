import pkg from './package.json'

import { eslint } from 'rollup-plugin-eslint'
import { terser } from 'rollup-plugin-terser'

const outputDir = 'docs/'

const lint = eslint({
  throwOnError: true,
  throwOnWarning: true,
})

const minify = terser()

const minifyModule = terser({
  ecma: 2018,
  module: true,
})

function generate ({ input, module, browser }) {
  return [
    {
      input,
      plugins: [
        lint,
        minifyModule,
      ],
      output: {
        format: 'esm',
        file: outputDir + module,
      },
    },
    {
      input,
      plugins: [
        lint,
        minify,
      ],
      output: {
        format: 'umd',
        name: 'GLCanvas',
        file: outputDir + browser
      },
    },
  ]
}

const outputs = [
  {
    input: pkg.main,
    module: 'dist/gl-canvas-full.esm.js',
    browser: 'dist/gl-canvas-full.min.js',
  },
  {
    input: 'src/gl-canvas.js',
    module: pkg.module,
    browser: pkg.browser,
  },
]

export default [
  ...[].concat(...outputs.map(generate)),
]
