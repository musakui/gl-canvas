import pkg from './package.json'

import { eslint } from 'rollup-plugin-eslint'
import { terser } from 'rollup-plugin-terser'

export default [
	{
		input: 'src/gl-canvas.js',
    plugins: [
      eslint({ throwOnError: true }),
      terser(),
    ],
		output: [
			{ format: 'cjs', file: pkg.main },
			{ format: 'esm', file: pkg.module },
		]
	}
]
