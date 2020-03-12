const STYLE = `
  :host { display: block }
  :host([hidden]) { display: none }

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }`

const BOOL_ATTRS = [
  'alpha',
  'depth',
  'stencil',
  'antialias',
  'desynchronized',
]

function getAlphaType (pref) {
  const premultipliedAlpha = (pref === 'premultiplied')
  const alpha = (pref === 'straight' || premultipliedAlpha)
  return { alpha, premultipliedAlpha }
}

function getPowerPreference (pref) {
  switch (pref) {
    case 'low-power':
    case 'high-performance':
      return pref
    default:
      return 'default'
  }
}

class ResizeEvent extends UIEvent {
  constructor (name, entry) {
    super(name, { bubbles: false })
    this.entry = entry
    this.size = entry.target.size
  }
}

export class GLCanvas extends HTMLElement {
  constructor () {
    super()

    this._gl = null
    this._requestId = null
    this._contextLost = false

    this._contextAttributes = {}
    this._pixelRatio = window.devicePixelRatio

    this._setup = null
    this._render = null
    this._resize = null
    this._dispose = null

    this._ctxLost = (e) => {
      e.preventDefault()
      cancelAnimationFrame(this._requestId)
      console.info('[GLCanvas] Context lost')
      this._contextLost = true
    }

    this._ctxRestored = () => {
      console.info('[GLCanvas] Context restored')
      this._contextLost = false
      this._initGL(true)
    }

    this._canvas = document.createElement('canvas')

    const shadow = this.attachShadow({ mode: 'closed' })
    shadow.appendChild(this.constructor.style)
    shadow.appendChild(this._canvas)
  }

  static get style () {
    if (!this._style) {
      this._style = document.createElement('style')
      this._style.textContent = STYLE
    }
    return this._style
  }

  static get resizeObserver () {
    if (!this._resizeObserver) {
      this._resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target._contextLost) { continue }
          const evt = new ResizeEvent('resize', entry)
          if (entry.target.dispatchEvent(evt)) {
            const canvas = entry.target._canvas
            const [width, height] = entry.target.size
            if (canvas.width !== width || canvas.height !== height) {
              canvas.width = width
              canvas.height = height
            }
          }
        }
      })
    }
    return this._resizeObserver
  }

  get size () {
    return [
      this._canvas.clientWidth * this.pixelRatio,
      this._canvas.clientHeight * this.pixelRatio,
    ]
  }

  get setup () {
    return this._setup
  }

  set setup (v) {
    this._setup = (typeof v === 'function') ? v : null
    this._initGL(null)
  }

  get render () {
    return this._render
  }

  set render (v) {
    if (v === undefined) { return }
    cancelAnimationFrame(this._requestId)
    this._render = (typeof v === 'function') ? v : null
    this._initRAF()
  }

  get onresize () {
    return this._resize
  }

  set onresize (v) {
    if (v === undefined) { return }
    this.removeEventListener('resize', this._resize)
    if (typeof v === 'function') {
      this._resize = v
      this.addEventListener('resize', this._resize)
      this._resize({ size: this.size })
    } else {
      this._resize = null
    }
  }

  get dispose () {
    return this._dispose
  }

  set dispose (v) {
    if (v === undefined) { return }
    this._dispose = (typeof v === 'function') ? v : null
  }

  get pixelRatio () {
    return this._pixelRatio
  }

  set pixelRatio (v) {
    this._pixelRatio = parseFloat(v) || window.devicePixelRatio
  }

  get contextAttributes () {
    return this._contextAttributes
  }

  set contextAttributes (opts) {
    Object.assign(this._contextAttributes, opts)
  }

  get gl () {
    if (this._gl === null) {
      const gl = this._canvas.getContext('webgl', Object.freeze(this._contextAttributes))
      if (gl === null) {
        console.warn('could not initialize WebGL')
      }
      this._gl = gl
    }
    return this._gl
  }

  connectedCallback () {
    this.constructor.resizeObserver.observe(this)
    this._canvas.addEventListener('webglcontextlost', this._ctxLost, false)
    this._canvas.addEventListener('webglcontextrestored', this._ctxRestored, false)

    const alphaType = getAlphaType(this.getAttribute('alpha'))
    const powerPreference = getPowerPreference(this.getAttribute('power'))

    const preserveDrawingBuffer = this.hasAttribute('preserve')
    const failIfMajorPerformanceCaveat = this.hasAttribute('caveat')

    this._contextAttributes = {
      ...Object.fromEntries(BOOL_ATTRS.map((a) => [a, this.hasAttribute(a)])),
      ...alphaType,
      powerPreference,
      preserveDrawingBuffer,
      failIfMajorPerformanceCaveat,
    }

    this._initGL(false)
  }

  disconnectedCallback () {
    this.constructor.resizeObserver.unobserve(this)
    this._canvas.removeEventListener('webglcontextlost', this._ctxLost, false)
    this._canvas.removeEventListener('webglcontextrestored', this._ctxRestored, false)

    if (this.dispose !== null) { this.dispose() }
  }

  _initGL (restored) {
    if (this.setup === null || this.gl === null) { return }
    const opts = this.setup(this.gl, restored)
    if (!opts) { return }
    this.render = opts.render
    this.dispose = opts.dispose
    this.onresize = opts.onresize

    this._initRAF()
  }

  _initRAF () {
    if (this.render === null) { return }
    const render = (time) => {
      if (this._contextLost) { return }
      this.render(time)
      this._requestId = requestAnimationFrame(render)
    }
    this._requestId = requestAnimationFrame(render)
  }

  toBlob (mimeType, qualityArgument) {
    return new Promise((resolve, reject) => {
      try {
        this._canvas.toBlob(resolve, mimeType, qualityArgument)
      } catch (e) {
        reject(e)
      }
    })
  }

  toDataURL (type, encoderOptions) {
    return this._canvas.toDataURL(type, encoderOptions)
  }
}

if ('customElements' in window) {
  window.customElements.define('gl-canvas', GLCanvas)
}
