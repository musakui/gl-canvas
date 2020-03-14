# gl-canvas
[![Published on NPM](https://img.shields.io/npm/v/gl-canvas.svg)](https://www.npmjs.com/package/musakui/gl-canvas) [![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/gl-canvas/elements/gl-canvas)

`<gl-canvas>` is a wrapper around `<canvas>` that handles the WebGL context and various events.

## Usage
*Note*: [`twgl.js`](https://github.com/greggman/twgl.js) is not required but highly reccomended when working with raw WebGL calls

### in HTML
```htmlmixed
<script type="module" src="build/gl-canvas.esm.js"></script>
<gl-canvas></gl-canvas>
```

### Module import
```javascript
import { GLCanvas } from './build/gl-canvas.esm.js'
const renderer = new GLCanvas()
```

### Installation
```shell
npm install gl-canvas
```

## Features
- Set WebGL context attributes with HTML attributes
- Viewport automatically resizes with element (using `ResizeObserver`)

## Contributing
Pull requests and suggestions are very welcome now

## License
MIT
