import { GLCanvasBase } from './base.js'

import {
  makeShader,
  makeProgram,
  getUniforms,
} from './utils.js'

const fragmentMain = 'void main(){mainImage(gl_FragColor,gl_FragCoord.xy);}'
const mainImageEmpty = 'void mainImage(out vec4 fragColor, in vec2 fragCoord){}'
const vertexBuffer = new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0])

function setupShader (gl, source) {
  const combined = 'precision mediump float;' + source + fragmentMain
  const fs = makeShader(gl, combined, gl.FRAGMENT_SHADER)
  if (!fs.shader) {
    return { error: fs.error }
  }

  const vs = makeShader(gl, 'attribute vec4 p;void main(){gl_Position=p;}', gl.VERTEX_SHADER)
  const { program, error } = makeProgram(gl, [vs.shader, fs.shader])
  if (!program) {
    return { error }
  }

  const pLoc = gl.getAttribLocation(program, 'p')
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, vertexBuffer, gl.STATIC_DRAW)
  gl.enableVertexAttribArray(pLoc)
  gl.vertexAttribPointer(pLoc, 3, gl.FLOAT, false, 0, 0)

  gl.useProgram(program)

  return {
    program,
    uniforms: getUniforms(gl, program),
  }
}

export class GLShaderToy extends GLCanvasBase {
  constructor () {
    super()

    this._draw = null
    this._requestId = null
    this._currentSource = null
    this._iResolution = () => {}

    const slot = document.createElement('slot')
    slot.name = 'shader'
    this._shadowRoot.appendChild(slot)

    this._onSlot = () => {
      let toShow = null
      for (const node of slot.assignedNodes()) {
        if (node.tagName !== 'SCRIPT') { continue }
        const text = this._getText(node)
        if (toShow === null) {
          toShow = text
        }
      }
      if (toShow !== null && this._currentSource !== toShow) {
        this._currentSource = toShow
        this.setupCallback(false)
      }
    }
    this._shaderSlot = slot
  }

  static get cache () {
    if (!this._cache) {
      this._cache = new WeakMap()
    }
    return this._cache
  }

  get currentSource () {
    return this._currentSource || mainImageEmpty
  }

  /**
   * @private
   */
  _getText (node) {
    let text = this.constructor.cache.get(node)
    if (!text) {
      text = node.text.trim()
      this.constructor.cache.set(node, text)
    }
    return text
  }

  /**
   * @private
   */
  connectedCallback () {
    super.connectedCallback()
    this._shaderSlot.addEventListener('slotchange', this._onSlot)
  }

  /**
   * @private
   */
  disconnectedCallback () {
    super.disconnectedCallback()
    this._shaderSlot.removeEventListener('slotchange', this._onSlot)
  }

  /**
   * Setup fragment shader and draw function
   * @private
   */
  setupCallback (restored) {
    const { uniforms } = setupShader(this.gl, this.currentSource)
    if (!uniforms) {
      return
    }

    const TRIANGLES = this.gl.TRIANGLES
    const draw = (t) => {
      uniforms.iTime = t * 0.001
      this.gl.drawArrays(TRIANGLES, 0, 6)
      this._requestId = requestAnimationFrame(draw)
    }

    this._iResolution = () => {
      uniforms.iResolution = [this.width, this.height, 1]
    }

    this._iResolution()
    this._requestId = requestAnimationFrame(draw)
  }

  /**
   * @private
   */
  contextLostCallback () {
    cancelAnimationFrame(this._requestId)
  }

  resizedCallback (rect) {
    super.resizedCallback(rect)
    this._iResolution()
  }
}

if ('customElements' in window) {
  window.customElements.define('gl-shadertoy', GLShaderToy)
}
