export function makeShader (gl, source, type) {
	const shader = gl.createShader(type)
	gl.shaderSource(shader, source.replace(/^[ \t]*\n/, ''))
	gl.compileShader(shader)
	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return { shader }
	}

	const error = gl.getShaderInfoLog(shader)
	gl.deleteShader(shader)
	return { error }
}

export function makeProgram (gl, shaders) {
	const program = gl.createProgram()
	for (const shader of shaders) {
		gl.attachShader(program, shader)
	}

	gl.linkProgram(program)
	if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
		return { program }
	}

	const error = gl.getProgramInfoLog(program)
	gl.deleteProgram(program)
	for (const shader of shaders) {
		gl.deleteShader(shader)
	}
	return { error }
}

export function getUniforms (gl, program) {
	function toString (type, isArray) {
		switch (type) {
			case gl.INT:
			case gl.BOOL:
				return isArray ? '1iv' : '1i'
			case gl.FLOAT:
				return isArray ? '1fv' : '1f'
			case gl.UNSIGNED_INT:
				return isArray ? '1uiv' : '1ui'
			case gl.INT_VEC2:
			case gl.BOOL_VEC2:
				return '2iv'
			case gl.INT_VEC3:
			case gl.BOOL_VEC3:
				return '3iv'
			case gl.INT_VEC4:
			case gl.BOOL_VEC4:
				return '4iv'
			case gl.FLOAT_VEC2:
				return '2fv'
			case gl.FLOAT_VEC3:
				return '3fv'
			case gl.FLOAT_VEC4:
				return '4fv'
			case gl.UNSIGNED_INT_VEC2:
				return '2uiv'
			case gl.UNSIGNED_INT_VEC3:
				return '3uiv'
			case gl.UNSIGNED_INT_VEC4:
				return '4uiv'
			case gl.FLOAT_MAT2:
				return 'Matrix2fv'
			case gl.FLOAT_MAT3:
				return 'Matrix3fv'
			case gl.FLOAT_MAT4:
				return 'Matrix4fv'
			default:
				return ''
		}
	}

	const uniforms = {}
	const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
	for (let i = 0; i < numUniforms; ++i) {
		const info = gl.getActiveUniform(program, i)
		let name = info.name
		if (/^(web)?gl_/.test(name)) {
			continue
		}

		let isArray = false
		if (name.substr(-3) === '[0]') {
			isArray = info.size > 1
			name = name.substr(0, name.length - 3)
		}

		const type = 'uniform' + toString(info.type, isArray)
		const loc = gl.getUniformLocation(program, info.name)

		Object.defineProperty(uniforms, name, {
			get: () => gl.getUniform(program, loc),
			set: (v) => gl[type](loc, v),
		})
	}
	return uniforms
}
