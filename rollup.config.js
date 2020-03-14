import pkg from './package.json'

import { eslint } from 'rollup-plugin-eslint'
import { terser } from 'rollup-plugin-terser'

const lint = eslint({
  throwOnError: true,
  throwOnWarning: true,
})

export default [
  {
    input: pkg.main,
    plugins: [
      lint,
      terser({
        ecma: 2018,
        module: true,
      }),
    ],
    output: [
      { format: 'esm', file: pkg.module },
    ]
  },
  {
    input: pkg.main,
    plugins: [
      lint,
      terser(),
    ],
    output: [
      { format: 'cjs', file: pkg.browser },
    ]
  },
]
