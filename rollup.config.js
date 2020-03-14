import pkg from './package.json'

import { eslint } from 'rollup-plugin-eslint'
import { terser } from 'rollup-plugin-terser'

export default [
	{
		input: 'gl-canvas.js',
    plugins: [
      eslint({ throwOnError: true }),
      terser(),
    ],
		output: [
			{ format: 'esm', file: pkg.module },
			{ format: 'cjs', file: 'build/gl-canvas.min.js' },
		]
	}
]
