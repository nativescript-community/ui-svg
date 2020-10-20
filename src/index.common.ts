import { Canvas, CanvasView, PorterDuffMode } from '@nativescript-community/ui-canvas';
import Shape, { lengthProperty, percentLengthProperty } from '@nativescript-community/ui-canvas/shapes/shape';
import { CSSType, ImageAsset, Length, PercentLength, Property, View, zeroLength } from '@nativescript/core';
import { TextTransform } from '@nativescript/core/ui/text-base';

export function xfermodeFromString(str) {
    switch (str) {
        case 'overlay':
            return PorterDuffMode.OVERLAY;
        case 'lighten':
            return PorterDuffMode.LIGHTEN;
        case 'screen':
            return PorterDuffMode.SCREEN;
        case 'multiply':
            return PorterDuffMode.MULTIPLY;
        case 'dst_atop':
            return PorterDuffMode.DST_ATOP;
        case 'dst_over':
            return PorterDuffMode.DST_OVER;
        case 'dst_out':
            return PorterDuffMode.DST_OUT;
        case 'dst_in':
            return PorterDuffMode.DST_IN;
        case 'clear':
            return PorterDuffMode.CLEAR;
        case 'src_atop':
            return PorterDuffMode.SRC_ATOP;
        case 'src_over':
            return PorterDuffMode.SRC_OVER;
        case 'src_in':
            return PorterDuffMode.SRC_IN;
        case 'src_out':
            return PorterDuffMode.SRC_OUT;
        default:
            return null;
    }
}
function getCapitalizedString(str: string): string {
    const words = str.split(' ');
    const newWords = [];
    for (let i = 0, length = words.length; i < length; i++) {
        const word = words[i].toLowerCase();
        newWords.push(word.substr(0, 1).toUpperCase() + word.substring(1));
    }

    return newWords.join(' ');
}

export function getTransformedText(text: string, textTransform: TextTransform): string {
    switch (textTransform) {
        case 'uppercase':
            return text.toUpperCase();
        case 'lowercase':
            return text.toLowerCase();
        case 'capitalize':
            return getCapitalizedString(text);
        case 'none':
        default:
            return text;
    }
}
export function computeBaseLineOffset(align, fontAscent, fontDescent, fontBottom, fontTop, fontSize, maxFontSize) {
    let result = 0;
    switch (align) {
        case 'top':
            result = -maxFontSize - fontBottom - fontTop;
            break;

        case 'bottom':
            result = fontBottom;
            break;

        case 'text-top':
            result = -maxFontSize - fontDescent - fontAscent;
            break;

        case 'text-bottom':
            result = fontBottom - fontDescent;
            break;

        case 'middle':
        case 'center':
            result = (fontAscent - fontDescent) / 2 - fontAscent - maxFontSize / 2;
            break;

        case 'super':
            result = -(maxFontSize - fontSize);
            break;

        case 'sub':
            result = 0;
            break;
    }
    return result;
}

export type VerticalTextAlignment = 'initial' | 'top' | 'middle' | 'bottom' | 'center';

// const debugPaint = new Paint();
// debugPaint.style = Style.STROKE;
// debugPaint.color = 'red';

export abstract class SVG extends Shape {
    _parent: WeakRef<any>;
    @percentLengthProperty width: PercentLength;
    @percentLengthProperty height: PercentLength;
    @lengthProperty left: Length = zeroLength;
    @lengthProperty top: Length = zeroLength;
    blendingMode: PorterDuffMode;
    cache: boolean = true;
    drawOnCanvas(canvas: Canvas, parent: CanvasView) {}
    _cachedImage: any;
    clearCache() {
        this._cachedImage = null;
    }
}

declare module '@nativescript/core/ui/core/view' {
    interface View {
        _addChildFromBuilder(name: string, value: any);
    }
}
export type Stretch = 'none' | 'fill' | 'aspectFill' | 'aspectFit';
export const srcProperty = new Property<SVGView, string | ImageAsset | File>({ name: 'src' });
export const stretchProperty = new Property<SVGView, Stretch>({ name: 'stretch' });
// export const blendingModeProperty = new Property<SVGView, string>({ name: 'blendingMode' });

@CSSType('SVGView')
export class SVGView extends View {}
srcProperty.register(SVGView);
stretchProperty.register(SVGView);
// blendingModeProperty.register(SVGView);

@CSSType('CanvasSVG')
export class CanvasSVG extends CanvasView {
    constructor() {
        super();
    }

    //@ts-ignore
    set color(value) {
        this.style.color = value;
        // this.handlePropertyChange();
    }

    get padding(): string | Length {
        return this.style.padding;
    }
    set padding(value: string | Length) {
        this.style.padding = value;
    }

    get paddingTop(): Length {
        return this.style.paddingTop;
    }
    set paddingTop(value: Length) {
        this.style.paddingTop = value;
    }

    get paddingRight(): Length {
        return this.style.paddingRight;
    }
    set paddingRight(value: Length) {
        this.style.paddingRight = value;
    }

    get paddingBottom(): Length {
        return this.style.paddingBottom;
    }
    set paddingBottom(value: Length) {
        this.style.paddingBottom = value;
    }

    get paddingLeft(): Length {
        return this.style.paddingLeft;
    }
    set paddingLeft(value: Length) {
        this.style.paddingLeft = value;
    }
}
