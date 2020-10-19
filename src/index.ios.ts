import { Canvas, CanvasView } from '@nativescript-community/ui-canvas';
import { File, ImageAsset, Utils, knownFolders, path } from '@nativescript/core';
import { RESOURCE_PREFIX, isFileOrResourcePath } from '@nativescript/core/utils/utils';
import { SVG as SVGBase, SVGView as SVGViewBase, srcProperty, stretchProperty } from './index.common';
export { CanvasSVG } from './index.common';

function getRenderer(src: string | ImageAsset | File) {
    let imagePath: string;
    if (src instanceof File) {
        return SVGRenderer.alloc().initWithInputStream(NSInputStream.alloc().initWithFileAtPath(src.path));
    } else if (src instanceof ImageAsset) {
        imagePath = src.ios;
    } else {
        imagePath = src;
    }
    if (isFileOrResourcePath(imagePath)) {
        if (imagePath.indexOf(RESOURCE_PREFIX) === 0) {
            const resName = imagePath.substr(RESOURCE_PREFIX.length);
            return SVGRenderer.alloc().initWithResourceNameInBundle(resName, NSBundle.mainBundle);
        } else if (imagePath.indexOf('~/') === 0) {
            const strPath = path.join(knownFolders.currentApp().path, imagePath.replace('~/', ''));
            return SVGRenderer.alloc().initWithContentsOfURL(NSURL.fileURLWithPath(strPath));
        } else if (imagePath.indexOf('/') === 0) {
            return SVGRenderer.alloc().initWithContentsOfURL(NSURL.fileURLWithPath(imagePath));

            // return com.caverock.androidsvg.SVG.getFromInputStream(stream);
        }
    }
    return SVGRenderer.alloc().initWithString(imagePath);
}
declare module '@nativescript-community/ui-canvas' {
    interface Canvas {
        ctx: any; // CGContextRef
    }
}
export class SVG extends SVGBase {
    _renderer: SVGRenderer;
    _src: string | File | ImageAsset;
    // private renderOptions = new com.caverock.androidsvg.RenderOptions();

    makeScales(availableWidth, availableHeight) {
        const width = this.getWidth(availableWidth, availableHeight);
        const height = this.getHeight(availableWidth, availableHeight);
        const preferredRect = this._renderer.viewRect;

        const nativeWidth = preferredRect ? preferredRect.size.width : width;
        const nativeHeight = preferredRect ? preferredRect.size.height : height;

        const nativeAspectRatio = nativeWidth / nativeHeight;
        const boundedAspectRatio = width / height;

        let paintedWidth = width;
        let paintedHeight = height;

        const myGravity = this._stretch;
        if (myGravity === 'aspectFit') {
            if (nativeAspectRatio >= boundedAspectRatio) {
                // blank space on top and bottom
                paintedHeight = paintedWidth / nativeAspectRatio;
            } else {
                paintedWidth = paintedHeight * nativeAspectRatio;
            }
            const xOrigin = (width - paintedWidth) / 2.0;
            const yOrigin = (height - paintedHeight) / 2.0;
            return { px: 0, py: yOrigin, sx: paintedWidth / nativeWidth, sy: paintedHeight / nativeHeight };
        } else if (myGravity === 'aspectFill') {
            if (nativeAspectRatio <= boundedAspectRatio) {
                // blank space on top and bottom
                paintedHeight = paintedWidth / nativeAspectRatio;
            } else {
                paintedWidth = paintedHeight * nativeAspectRatio;
            }
            const xOrigin = (width - paintedWidth) / 2.0;
            const yOrigin = (height - paintedHeight) / 2.0;
            return { px: xOrigin, py: yOrigin, sx: paintedWidth / nativeWidth, sy: paintedHeight / nativeHeight };
        } else {
            // flipped
            return { px: 0, py: 0, sx: width / nativeWidth, sy: height / nativeHeight };
        }
    }
    getWidth(availableWidth, availableHeight) {
        if (this.width) {
            return super.getWidth(availableWidth, availableHeight);
        }
        const viewRect = this._renderer.viewRect;
        if (viewRect) {
            const nativeWidth = viewRect.size.width;
            const nativeHeight = viewRect.size.height;
            const width = Math.min(nativeWidth, availableWidth);
            const height = this.height ? this.getHeight(availableWidth, availableHeight) : Math.min(nativeHeight, availableHeight);
            let paintedWidth = width;
            let paintedHeight = height;
            const nativeAspectRatio = nativeWidth / nativeHeight;
            const boundedAspectRatio = width / height;
            if (this._stretch === 'aspectFit') {
                if (nativeAspectRatio >= boundedAspectRatio) {
                    // blank space on top and bottom
                    paintedHeight = paintedWidth / nativeAspectRatio;
                } else {
                    paintedWidth = paintedHeight * nativeAspectRatio;
                }
                return paintedWidth;
            } else if (this._stretch === 'aspectFill') {
                if (nativeAspectRatio <= boundedAspectRatio) {
                    // blank space on top and bottom
                    paintedHeight = paintedWidth / nativeAspectRatio;
                } else {
                    paintedWidth = paintedHeight * nativeAspectRatio;
                }
                return paintedWidth;
            }
            return paintedWidth;
        }

        return 0;
    }
    getHeight(availableWidth: number, availableHeight: number) {
        if (this.height) {
            return super.getHeight(availableWidth, availableHeight);
        }
        const viewRect = this._renderer.viewRect;
        if (viewRect) {
            const nativeWidth = viewRect.size.width;
            const nativeHeight = viewRect.size.height;
            const height = Math.min(nativeHeight, availableHeight);
            const width = this.width ? this.getWidth(availableWidth, availableHeight) : Math.min(nativeHeight, availableHeight);
            let paintedWidth = width;
            let paintedHeight = height;
            const nativeAspectRatio = nativeWidth / nativeHeight;
            const boundedAspectRatio = width / height;
            if (this._stretch === 'aspectFit') {
                if (nativeAspectRatio >= boundedAspectRatio) {
                    // blank space on top and bottom
                    paintedHeight = paintedWidth / nativeAspectRatio;
                } else {
                    paintedWidth = paintedHeight * nativeAspectRatio;
                }
                return paintedHeight;
            } else if (this._stretch === 'aspectFill') {
                if (nativeAspectRatio <= boundedAspectRatio) {
                    // blank space on top and bottom
                    paintedHeight = paintedWidth / nativeAspectRatio;
                } else {
                    paintedWidth = paintedHeight * nativeAspectRatio;
                }
                return paintedHeight;
            }
            return paintedHeight;
        }

        return 0;
    }
    drawOnCanvas(canvas: Canvas, parent: CanvasView) {
        if (this._renderer) {
            const availableWidth = Utils.layout.toDevicePixels(canvas.getWidth());
            const availableHeight = Utils.layout.toDevicePixels(canvas.getHeight());

            const scales = this.makeScales(availableWidth, availableHeight);
            canvas.save();
            canvas.translate(scales.px, scales.py);
            canvas.scale(scales.sx, scales.sy, 0, 0);
            this._renderer.renderIntoContext(canvas.ctx);
            canvas.restore();
        }
    }
    set src(value: string | File | ImageAsset) {
        this._src = value;
        this._renderer = getRenderer(value);
    }
    get src(): string | File | ImageAsset {
        return this._src;
    }

    _stretch: 'fill' | 'aspectFill' | 'aspectFit';
    set stretch(value: 'fill' | 'aspectFill' | 'aspectFit') {
        this._stretch = value;
    }
    get stretch(): 'fill' | 'aspectFill' | 'aspectFit' {
        return this._stretch;
    }
}

export class SVGView extends SVGViewBase {
    nativeViewProtected: SVGDocumentView;
    createNativeView() {
        return SVGDocumentView.alloc().init();
    }
    [srcProperty.setNative](value) {
        this.nativeViewProtected.renderer = getRenderer(value);
    }
    [stretchProperty.setNative](value: 'none' | 'aspectFill' | 'aspectFit' | 'fill') {
        switch (value) {
            case 'aspectFit':
                this.nativeViewProtected.layer.contentsGravity = kCAGravityResizeAspect;
                break;
            case 'aspectFill':
                this.nativeViewProtected.layer.contentsGravity = kCAGravityResizeAspectFill;
                break;
            case 'fill':
                this.nativeViewProtected.layer.contentsGravity = kCAGravityResize;
                break;
            case 'none':
            default:
                this.nativeViewProtected.layer.contentsGravity = kCAGravityResize;
                break;
        }
    }
}
