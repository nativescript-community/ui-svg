import { Canvas, CanvasView } from '@nativescript-community/ui-canvas';
import { File, ImageAsset, Length, PercentLength, Utils, knownFolders, path } from '@nativescript/core';
import { SVG as SVGBase, SVGView as SVGViewBase, srcProperty, stretchProperty } from './index.common';
export { CanvasSVG } from './index.common';
import { RESOURCE_PREFIX, ad, isFileOrResourcePath, isFontIconURI } from '@nativescript/core/utils/utils';
import { stretchLastChildProperty } from '@nativescript/core/ui/layouts/dock-layout';

function getSVG(src: string | ImageAsset | File) {
    let imagePath: string;
    if (src instanceof File) {
        return com.caverock.androidsvg.SVG.getFromInputStream(new java.io.FileInputStream(new java.io.File(src.path)));
    } else if (src instanceof ImageAsset) {
        imagePath = src.android;
    } else {
        imagePath = src;
    }
    if (isFileOrResourcePath(imagePath)) {
        const context = ad.getApplicationContext();
        const res = context.getResources();
        if (!res) {
            return null;
        }

        if (imagePath.indexOf(RESOURCE_PREFIX) === 0) {
            const resName = imagePath.substr(RESOURCE_PREFIX.length);
            const identifier = res.getIdentifier(resName, 'drawable', ad.getApplication().getPackageName());
            return com.caverock.androidsvg.SVG.getFromResource(res, identifier);
        } else if (imagePath.indexOf('~/') === 0) {
            const strPath = path.join(knownFolders.currentApp().path, imagePath.replace('~/', ''));
            const javaFile = new java.io.File(strPath);
            const stream = new java.io.FileInputStream(javaFile);
            return com.caverock.androidsvg.SVG.getFromInputStream(stream);
        } else if (imagePath.indexOf('/') === 0) {
            const javaFile = new java.io.File(imagePath);
            const stream = new java.io.FileInputStream(javaFile);
            return com.caverock.androidsvg.SVG.getFromInputStream(stream);
        }
    }
    return com.caverock.androidsvg.SVG.getFromString(imagePath);
}

declare module '@nativescript-community/ui-canvas' {
    interface Canvas {
        _native: android.graphics.Canvas;
    }
}
export class SVG extends SVGBase {
    _svg: com.caverock.androidsvg.SVG;
    _src: string | File | ImageAsset;
    private renderOptions = new com.caverock.androidsvg.RenderOptions();

    getWidth(availableWidth, availableHeight) {
        if (this.width) {
            return super.getWidth(availableWidth, availableHeight);
        }
        const viewRect = this._svg.getDocumentViewBox();
        if (viewRect) {
            const nativeWidth = viewRect.width();
            const nativeHeight = viewRect.height();
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
        const viewRect = this._svg.getDocumentViewBox();
        if (viewRect) {
            const nativeWidth = viewRect.width();
            const nativeHeight = viewRect.height();
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
        if (this._svg) {
            const availableWidth = Utils.layout.toDevicePixels(canvas.getWidth());
            const availableHeight = Utils.layout.toDevicePixels(canvas.getHeight());
            let options = this.renderOptions;
            const width = this.getWidth(availableWidth, availableHeight);
            const height = this.getHeight(availableWidth, availableHeight);
            // if (this.width || this.height) {
            const oldWidth = this._svg.getDocumentWidth();
            const oldHeight = this._svg.getDocumentHeight();
            this._svg.setDocumentWidth('100%');
            this._svg.setDocumentHeight('100%');
            const box = this._svg.getDocumentViewBox();
            const nativeWidth = box ? box.width() : width;
            const nativeHeight = box ? box.height() : height;

            const nativeAspectRatio = nativeWidth / nativeHeight;
            const boundedAspectRatio = width / height;

            let paintedWidth = width;
            let paintedHeight = height;
            if (nativeAspectRatio >= boundedAspectRatio) {
                // blank space on top and bottom
                paintedHeight = paintedWidth / nativeAspectRatio;
            } else {
                paintedWidth = paintedHeight * nativeAspectRatio;
            }
            const xOrigin = (width - paintedWidth) / 2.0;
            const yOrigin = (height - paintedHeight) / 2.0;
            options = options.viewPort(
                -xOrigin + Utils.layout.toDeviceIndependentPixels(Length.toDevicePixels(this.left)),
                -yOrigin + Utils.layout.toDeviceIndependentPixels(Length.toDevicePixels(this.top)),
                width,
                height
            );
            options = options.preserveAspectRatio(this._preserveAspectRatio);
            this._svg.renderToCanvas(canvas._native, options);
            this._svg.setDocumentWidth(oldWidth);
            this._svg.setDocumentHeight(oldHeight);
            // } else {
            //     this._svg.setDocumentWidth('100%');
            //     this._svg.setDocumentHeight('100%');
            //     this._svg.renderToCanvas(canvas._native);
            // }
        }
    }
    set src(value: string | File | ImageAsset) {
        this._src = value;
        this._svg = getSVG(value);
    }
    get src(): string | File | ImageAsset {
        return this._src;
    }

    _stretch: 'fill' | 'aspectFill' | 'aspectFit';
    _preserveAspectRatio: com.caverock.androidsvg.PreserveAspectRatio = com.caverock.androidsvg.PreserveAspectRatio.LETTERBOX;
    set stretch(value: 'fill' | 'aspectFill' | 'aspectFit') {
        this._stretch = value;
        switch (value) {
            case 'aspectFill':
                this._preserveAspectRatio = com.caverock.androidsvg.PreserveAspectRatio.FULLSCREEN;
                break;
            case 'fill':
                this._preserveAspectRatio = com.caverock.androidsvg.PreserveAspectRatio.STRETCH;
                break;
            case 'aspectFit':
                this._preserveAspectRatio = com.caverock.androidsvg.PreserveAspectRatio.LETTERBOX;
                break;
        }
    }
    get stretch(): 'fill' | 'aspectFill' | 'aspectFit' {
        return this._stretch;
    }
}

export class SVGView extends SVGViewBase {
    nativeViewProtected: com.caverock.androidsvg.SVGImageView;
    createNativeView() {
        return new com.caverock.androidsvg.SVGImageView(this._context);
    }

    [srcProperty.setNative](value) {
        this.nativeViewProtected.setSVG(getSVG(value));
    }
    [stretchProperty.setNative](value: 'none' | 'aspectFill' | 'aspectFit' | 'fill') {
        switch (value) {
            case 'aspectFit':
                this.nativeViewProtected.setScaleType(android.widget.ImageView.ScaleType.FIT_CENTER);
                break;
            case 'aspectFill':
                this.nativeViewProtected.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
                break;
            case 'fill':
                this.nativeViewProtected.setScaleType(android.widget.ImageView.ScaleType.FIT_XY);
                break;
            case 'none':
            default:
                this.nativeViewProtected.setScaleType(android.widget.ImageView.ScaleType.FIT_CENTER);
                break;
        }
    }
}
