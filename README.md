# gl-canvas
[![Published on NPM](https://img.shields.io/npm/v/gl-canvas.svg)](https://www.npmjs.com/package/gl-canvas) [![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/gl-canvas/elements/gl-canvas)

> a Custom Element that extends `<canvas>` with handlers for the WebGL context and various events.

## Usage
*Note*: [`twgl.js`](https://github.com/greggman/twgl.js) is not required but highly reccomended when working with raw WebGL calls

### in HTML
```htmlmixed
<script type="module" src="https://esm.run/gl-canvas/gl-canvas"></script>
<gl-canvas></gl-canvas>
```

### Installation
```shell
npm install gl-canvas
```

## Features
- Set [WebGL context attributes](https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2) with HTML attributes
- Viewport automatically resizes with element (using `ResizeObserver`)

## Contributing
Pull requests and suggestions are very welcome now

## License
MIT
