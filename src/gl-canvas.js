import { GLCanvasBase } from './base.js'

/**
 * `<gl-canvas>` extends `<canvas>` with handlers for the WebGL context and various events.
 */
export class GLCanvas extends GLCanvasBase {
  /**
   * Run setup code and initialize draw function.
   * @private
   */
  setupCallback (restored) {
    if (!this._setup) { return }
    const draw = this._setup(this.gl, restored)
    if (draw === null || typeof draw === 'function') {
      this._draw = draw
    }
  }

  /**
   * Define WebGL setup function.
   * @callback setupFunction
   * @param {?WebGLRenderingContext} gl - The current WebGL context.
   * @param {boolean} restored - Was context restored?
   * @return {?function} Draw function, or null to unset.
   *
   * @param {setupFunction}
   */
  init (setup) {
    if (typeof setup !== 'function') { return }
    this._setup = setup
    if (this.gl === null) { return }
    this.setupCallback(false)
  }

  /**
   * Run draw function
   * @param {...*} args - Arguments for the draw function.
   *
   * @return {?object} Null if draw was not run.
   */
  draw (...args) {
    if (this._contextLost || !this._draw) {
      return null
    }
    return this._draw(...args)
  }
}

if ('customElements' in window) {
  window.customElements.define('gl-canvas', GLCanvas)
}
