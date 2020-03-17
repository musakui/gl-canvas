# gl-canvas

> a Custom Element that extends `<canvas>` with handlers for the WebGL context and various events.

## Features
- Set [WebGL context attributes](webgl_context_attributes.md) with HTML attributes
- Viewport automatically resizes with element (using `ResizeObserver`)

## Usage
Include the script and use the `<gl-canvas>` tag
```htmlmixed
<script type="module" src="gl-canvas.esm.js"></script>
<gl-canvas id="glc"></gl-canvas>
<script>
const canvas = document.querySelector('#glc')
// setup the canvas
</script>
```

Result ([open in new tab](demo.html ':ignore :target=_blank'))

[demo](demo.html ':include height=200px')

---
Docs powered by [docsify](https://docsify.js.org/)
