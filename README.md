# NativeScript Label widget

[![npm downloads](https://img.shields.io/npm/dm/@nativescript-community/ui-svg.svg)](https://www.npmjs.com/package/@nativescript-community/ui-svg)
[![npm downloads](https://img.shields.io/npm/dt/@nativescript-community/ui-svg.svg)](https://www.npmjs.com/package/@nativescript-community/ui-svg)
[![npm](https://img.shields.io/npm/v/@nativescript-community/ui-svg.svg)](https://www.npmjs.com/package/@nativescript-community/ui-svg)

A NativeScript SVG plugin. Very basic implementation for now

## Installation

Run the following command from the root of your project:

`tns plugin add @nativescript-community/ui-svg`

## Configuration

For now only `vue` (and core) is supported.

```ts
import CanvasSVG from '@nativescript-community/ui-svg/vue';
Vue.use(CanvasSVG);
```

It works in 3 ways!.

`CanvasSVG` extending `Canvas`

```html
<CanvasSVG>
    <CSVG horizontalAlignment="left" src="~/assets/svgs/Ghostscript_Tiger.svg" height="100%" stretch="aspectFit" />
</CanvasSVG>
```

or `SVGView` which is a basic svg view with support for auto sizing

```html
<SVGView height="30%" src="~/assets/svgs/Ghostscript_Tiger.svg" stretch="aspectFit" backgroundColor="red" />
```

Or within and canvas extending view

```html
<CanvasLabel>
 <CGroup fontSize="18" verticalAlignment="middle" paddingLeft="20">
        <CSpan text="test" fontWeight="bold" />
        <CSpan text="test2" color="#ccc" fontSize="16" />
    </CGroup>
    <CSVG horizontalAlignment="left" src="~/assets/svgs/Ghostscript_Tiger.svg" height="10" stretch="aspectFit" />
</CanvasSVG>
```

For full example / doc look at the vue demo and the typings.
