# WebGL Context Attributes
Refer to the [WebGL Specification](https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2) for more details.

Changing these attributes has no effect after the WebGL Context has been created.
This is implied by the [HTML Specification](https://html.spec.whatwg.org/multipage/canvas.html#dom-canvas-getcontext),
as retrieving the same type of context on the canvas will return the same instance even if the options are different.

## Boolean attributes
All the booleans default to `false`. This may be different from the default in the Specification.

These boolean attributes mirror those specified in the spec:
- **`depth`**
- **`stencil`**
- **`antialias`**

These boolean attributes have been renamed for brevity, but are otherwise equivalent:
- **`preserve-buffer`** for `preserveDrawingBuffer`
- **`require-performance`** for `failIfMajorPerformanceCaveat`
- **`desync`** for `desynchronized`

## Other attributes

### **`power-preference`**
Equivalent to `powerPreference`. Unknown values will be sent as `"default"`.

### **`alpha`**
If the attribute is not set, `alpha` and `premultipliedAlpha` are both `false`.

If the attribute is set, `alpha` is `true`.

If the value is `"premultiplied"`, `premultipliedAlpha` is `true`. Otherwise it is false.
While it is not required, it is reccomended that the value `"straight"` be used (straight alpha).

Note that there is no corresponding HTML attribute for `premultipliedAlpha`.
