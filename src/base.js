/** @license MIT. Copyright (c) 2020 musakui */

export class GLCanvasBase extends HTMLElement {
  /**
   * Setup Shadow DOM.
   * @param {object=} contextAttributes - Attributes for the WebGL context.
   */
  constructor (contextAttributes) {
    super()

    this._gl = null
    this._contextLost = null

    this._pixelRatio = window.devicePixelRatio
    this._contextAttrs = contextAttributes || {}

    this._ctxLost = (e) => {
      e.preventDefault()
      this._contextLost = true
      this.contextLostCallback()
    }

    this._ctxRestored = () => {
      this._contextLost = false
      this.setupCallback(true)
    }

    const shadow = this.attachShadow({ mode: 'closed' })
    this._canvas = this.constructor.populateShadow(shadow)
    this._shadowRoot = shadow
  }

  static get booleanContextAttrs () {
    return {
      depth: 'depth',
      stencil: 'stencil',
      antialias: 'antialias',

      // shortened for brevity
      desynchronized: 'desync',
      preserveDrawingBuffer: 'preserve-buffer',
      failIfMajorPerformanceCaveat: 'require-performance',
    }
  }

  static get resizeObserver () {
    if (!this._resizeObserver) {
      this._resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const target = entry.target
          const detail = entry.contentRect
          target._updateSize(detail)
          const evt = new CustomEvent('resize', { detail, cancelable: true })
          if (target.dispatchEvent(evt)) {
            target.resizedCallback(detail)
          }
        }
      })
    }
    return this._resizeObserver
  }

  static get style () {
    return ''
  }

  static populateShadow (shadow) {
    const canvas = document.createElement('canvas')

    if (this.style instanceof Element) {
      shadow.appendChild(this.style)
    } else if (this.style) {
      const el = document.createElement('style')
      el.textContent = this.style
      shadow.appendChild(el)
    }

    shadow.appendChild(canvas)

    return canvas
  }

  /**
   * The WebGL context, if successfully created.
   * @return {?WebGLRenderingContext}
   */
  get gl () {
    return this._gl
  }

  /**
   * Width of the canvas in pixels.
   * @return {number}
   */
  get width () {
    return this._canvas.width
  }

  /**
   * Height of the canvas in pixels.
   * @return {number}
   */
  get height () {
    return this._canvas.height
  }

  /**
   * Pixel scaling of the canvas. Default is `window.devicePixelRatio`.
   * @return {number}
   */
  get pixelRatio () {
    return this._pixelRatio
  }

  set pixelRatio (v) {
    this._pixelRatio = parseFloat(v) || window.devicePixelRatio
  }

  /**
   * WebGL context attributes. Cannot be modified after the element is attached.
   * @return {object}
   */
  get contextAttributes () {
    return this._contextAttrs
  }

  set contextAttributes (opts) {
    try {
      Object.assign(this._contextAttrs, opts || {})
    } catch (e) {
      // silently ignore
    }
  }

  /**
   * Parse WebGL context attributes from element attributes.
   * @private
   */
  _parseContextAttrs () {
    const alphaAttr = this.hasAttribute('alpha') ? this.getAttribute('alpha') : null

    const boolAttrs = Object.entries(this.constructor.booleanContextAttrs)
      .map(([prop, attr]) => [prop, this.hasAttribute(attr)])

    let powerPreference = this.getAttribute('power-preference')

    switch (powerPreference) {
      case 'high-performance':
      case 'low-power':
        break
      default:
        powerPreference = 'default'
    }

    return {
      ...Object.fromEntries(boolAttrs),
      powerPreference,
      alpha: alphaAttr !== null,
      premultipliedAlpha: alphaAttr === 'premultiplied',
    }
  }

  /**
   * Gets the WebGL context. Returns false if unsuccessful
   * @private
   */
  _getContext () {
    if (this._gl !== null) {
      return true
    }

    const contextType = this.getAttribute('type') || 'webgl'

    if (Object.keys(this._contextAttrs).length === 0) {
      Object.assign(this._contextAttrs, this._parseContextAttrs())
    }

    const gl = this._canvas.getContext(contextType, Object.freeze(this._contextAttrs))
    if (gl === null) {
      return false
    }

    this._gl = gl
    return true
  }

  /**
   * Update the canvas size.
   * @private
   */
  _updateSize (rect, force) {
    const rw = parseFloat(rect.width) || this._canvas.clientWidth
    const rh = parseFloat(rect.height) || this._canvas.clientHeight
    const width = Math.floor(rw * this.pixelRatio)
    const height = Math.floor(rh * this.pixelRatio)

    if (force || this.width !== width || this.height !== height) {
      this._canvas.width = width
      this._canvas.height = height
    }
  }

  /**
   * Create WebGL context and setup event listeners.
   */
  connectedCallback () {
    if (!this._getContext()) { return }

    this._updateSize({}, true)
    this.constructor.resizeObserver.observe(this)

    this._canvas.addEventListener('webglcontextlost', this._ctxLost)
    this._canvas.addEventListener('webglcontextrestored', this._ctxRestored)

    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'img')
    }

    this.setupCallback(false)
  }

  /**
   * Remove event listeners and dispatch dispose event.
   */
  disconnectedCallback () {
    this.constructor.resizeObserver.unobserve(this)
    this._canvas.removeEventListener('webglcontextlost', this._ctxLost)
    this._canvas.removeEventListener('webglcontextrestored', this._ctxRestored)

    this.dispatchEvent(new CustomEvent('dispose'))
  }

  /**
   * Run when connected and when the context is restored.
   * Will not be called if WebGL context creation failed.
   */
  setupCallback (restored) {
  }

  /**
   * Run when the context is lost.
   */
  contextLostCallback () {
  }

  /**
   * Run when the element is resized, after the canvas size is set.
   */
  resizedCallback (rect) {
  }

  /**
   * Create a Blob object representing the image shown in the canvas.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob}
   * @param {string=} mimeType - Image format. Default is `image/png`.
   * @param {number=} qualityArgument - A number between 0 and 1.
   *
   * @return {Promise<Blob>} A `Promise` that resolves to the `Blob` object
   */
  toBlob (mimeType, qualityArgument) {
    return new Promise((resolve, reject) => {
      try {
        this._canvas.toBlob(resolve, mimeType, qualityArgument)
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * Get a data URI representing the image shown in the canvas.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL}
   * @param {string=} type - Image format. Default is `image/png`.
   * @param {number=} encoderOptions - A number between 0 and 1.
   *
   * @return {string} The data URI
   */
  toDataURL (type, encoderOptions) {
    return this._canvas.toDataURL(type, encoderOptions)
  }
}
