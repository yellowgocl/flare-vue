import { assign } from 'lodash';

const ScaleType = Object.freeze({
    FIT_START: Symbol('fitStart'),
    FIT_CENTER: Symbol('fitCenter'),
    FIT_END: Symbol('fitEnd'),
    CENTER: Symbol('center'), // 保持原始尺寸，超出部分裁剪
    CENTER_CROP: Symbol('centerCrop'), // 保持比例填充，超出部分裁剪
    CONTAIN: Symbol('contain'),
    MATRIX: Symbol('matrix')
})

export { ScaleType }

export class BoundsUtil {
    // 200, 110, 100, 10)
    static getBounds(scaleType, originalWidth, originalHeight, constraintWidth, constraintHeight) {
        let ow = originalWidth, oh = originalHeight, vw = constraintWidth, vh = constraintHeight;
        let fits = (ow < 0 || ow == vw) &&(oh < 0 || oh == vh);
        let scale = 1, dx = 0, dy = 0;
        let bounds = { x: 0, y: 0, w: ow, h: oh, scale };
        if (fits) {
            return bounds;
        }
        switch(scaleType) {
            case ScaleType.CENTER:
                bounds = assign(bounds, { x: (vw - ow) >> 1, y: (vh - oh) >> 1 });
                break;
            case ScaleType.CENTER_CROP:
                if (ow * vh > vw * oh) { 
                    scale = vh / oh; 
                    dx = (vw - ow * scale) >> 1; 
                } else { 
                    scale = vw / ow; 
                    dy = (vh - oh * scale) >> 1; 
                }
                bounds = assign(bounds, { scale, x: dx, y: dy, w: ow * scale, h: oh * scale })
                break;
            case ScaleType.CONTAIN:
                if (ow <= vw && oh <= vh) { 
                    scale = 1.0; 
                } else { 
                    scale = Math.min(vw / ow, vh / oh); 
                } 
                dx = (vw - ow * scale) >> 1; 
                dy = (vh - oh * scale) >> 1;
                bounds = assign(bounds, { scale, x: dx, y: dy, w: ow * scale, h: oh * scale }) 
                break;
            case ScaleType.FIT_START:
            case ScaleType.FIT_CENTER:
            case ScaleType.FIT_END:
                dx = 0
                dy = 0
                scale = Math.min(vw / ow, vh / oh);
                if (ScaleType.FIT_END == scaleType) {
                    dx = vw - ow * scale
                    dy = vh - oh * scale
                } else if (ScaleType.FIT_CENTER == scaleType) {
                    dx = (vw - ow * scale) >> 1; 
                    dy = (vh - oh * scale) >> 1; 
                }
                bounds = assign(bounds, { scale, x: dx, y: dy, w: ow * scale, h: oh * scale }) 
                break;
        }
        console.info(bounds);
        return bounds;
    }
}
