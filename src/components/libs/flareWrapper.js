/* eslint-disable no-console */
import Flare from '@2dimensions/flare-js';
import Timer from '~/utils/timer';
import * as glMatrix from 'gl-matrix';
import { forEach, isEmpty, isNumber, find, isBoolean } from 'lodash';
import { BoundsUtil, ScaleType } from './transformUtil'


export default class FlareWrapper {
    _inited = false;
    _canvas;
    _graphics;
    _viewTransform;
    _animationInstance = null;
    _animationInstanceMap = {}
    _animationNames = []
    _animation = null;
    _width = 600;
    _height = 600;
    _actorInstance;
    _actor;
    _scale;
    _viewCenter = [0.0, 0.0];
    _timer;
    _fps = 60
    _scaleType;
    _timeScale;
    _trasparent = true
    _autoFit = true
    static async build(canvas, option) {
        let r = new FlareWrapper(canvas, option||{})
        return await r.initialize();
    }

    constructor(canvas, { width, height, scale, fps, scaleType, timeScale, autoFit }) {
        this._canvas = canvas;
        this._width = width;
        this._height = height;
        this._scale = scale;
        this.fps = fps;
        this.scaleType = scaleType
        this.timeScale = timeScale
        this.autoFit = autoFit
        // this.init();
    }
    set autoFit(v) {
        this._autoFit = v
    }
    get autoFit() {
        return !!this._autoFit
    }
    set timeScale(v) {
        this._timeScale = v
    }
    get timeScale() {
        return this._timeScale || 1.0
    }
    get trasparent() {
        return this._trasparent == true ? 0 : this._trasparent
    }
    set trasparent(v) {
        this._trasparent = v > 1 ? (v / 100) : v
    }
    set scaleType(v) {
        this._scaleType = v;
    }
    get scaleType() {
        return this._scaleType || ScaleType.FIT_CENTER;
    }

    get rect() {
        return BoundsUtil.getBounds(this.scaleType, this.width, this.height, this.vw, this.vh )
    }

    get vw() {
        let r = this._canvas ? this._canvas.width : this._width;
        return r || this.width
    }
    get vh() {
        let r = this._canvas ? this._canvas.height : this._height;
        return r || this.height
    }

    get width() {
        return this._animation ? this._animation._Artboard.width : 0;
    }
    get height() {
        return this._animation ? this._animation._Artboard.height : 0;
    }

    get animations() {
        return this._animationNames;
    }

    set fps(val) {
        this._fps = val;
    }
    get fps() {
        return this._fps || 60;
    }

    get scale() {
        return this._scale;
    }
    
    setActor(value, autoplay) {
        this.disposeActor();
        value.initialize(this._graphics);
        const instance = value.makeInstance();
        instance.initialize(this._graphics);
        this._actor = value;
        this._actorInstance = instance;
        if (instance) {
            instance.initialize(this._graphics);
            this.disposeAnimations();
            if (instance.animations.length) {
                forEach(instance.animations, (v, k) => {
                    this._animationInstanceMap[v._Name] = { 
                        animation: v, 
                        index: k, 
                        name: v._Name,
                        instance: new Flare.AnimationInstance(v._Actor, v)
                    }
                    this._animationNames[k] = v._Name
                })
                
                this.play(isBoolean(autoplay) ? 0 : autoplay)
                // this._animation = instance.animations[0];
                // this._animationInstance = new Flare.AnimationInstance(this._animation._Actor, this._animation);
                // if (!this._animationInstance) {
                //     console.warn('no animation in here?');
                //     return;
                // }
            }
        }
    }

    play(name = 0) {
        if (isNumber(name)) {
            let temp = find(this._animationInstanceMap, { index: name });
            if (temp) {
                name = temp.name;
            }
        }
        if (isEmpty(this._animationInstanceMap) || !(this._animationInstanceMap[name])) {
            console.warn(`no animtaion instance by ${name}`);
            return;
        }
        const ins = this._animationInstanceMap[name];
        this._animation = ins.animation;
        this._animationInstance = ins.instance;
        if (!this._animationInstance) {
            console.warn('no animation in artboards?');
            return;
        } else {
            this.restart()
        }
    }

    disposeAnimations() {
        this._animation = null;
        this._animationNames = [];
        this._animationInstance = null;
        this._animationInstanceMap = {};
    }
    disposeActor() {
        if (this._actor)
            this._actor.dispose(this._graphics);

        if (this._actorInstance)
            this._actorInstance.dispose(this._graphics);
    }

    load(url, autoplay) {
        const loader = new Flare.ActorLoader();
        const result = new Promise((resolve, reject) => {
            loader.load(url, (actor) => {
                if (!actor || actor.error){
                    reject(!actor ? null : actor.error, this)
                } else {
                    this.setActor(actor, autoplay);
                    resolve(this);
                }
            })
        })
        
        return result;
    }
    dispose() {
        Timer.clearInterval(this._timer)
        this.disposeActor();
        this.disposeAnimations();
        this._canvas = null;
        this._graphics = null;
        this._inited = false;
    }
    initialize() {
        if (this._inited) {
            return Promise.reject('already inited')
        }
        return new Promise((resolve) => {
            let canvas = this._canvas;
            this._graphics = new Flare.Graphics(canvas);
            this._graphics.initialize(() => {
                this._viewTransform = glMatrix.mat2d.create();
                this.disposeAnimations();
                this._timer = Timer.setInterval(this._render.bind(this), 1000 / this.fps);
                this._render(0);
                // this._onReady && this._onReady(this);
                resolve(this)
            }, '');
        })   
    }

    restart() {
        if (this._animationInstance) {
            this._animationInstance.reset();
        }
    }
    
    _render(delta) {
        this.setSize(this.autoFit ? this.width : this.vw, this.autoFit ? this.height : this.vh);
        const actor = this._actorInstance;

        if (this._animationInstance) {
            const ai = this._animationInstance;
            ai.time = ai.time + delta / 1000;
            ai.apply(this._actorInstance, this.timeScale);
        }
        if (actor) {
            let rect = this.rect
            let scale = rect.scale;
            //const graphics = this._graphics;
            //const vw = graphics.viewportWidth;
            //const vh = graphics.viewportHeight;
            const vt = this._viewTransform;
            vt[0] = vt[3] = scale;
            vt[4] = rect.x //(-this._viewCenter[0] * scale + vw >> 1)
            vt[5] = rect.y //(-this._viewCenter[1] * scale + vh >> 1)
            actor.advance(delta);
        }
        this._draw();
    }

    _draw() {
        const actor = this._actor;
        if (!actor) {
            return;
        }
        const graphics = this._graphics;
        graphics.clear([.3628, .3628, .3628, this.trasparent]);
        graphics.setView(this._viewTransform);
        this._actorInstance.draw(graphics);
        graphics.flush();
    }
    
    setSize(width, height) {
        width = width || this.width
        height = height || this.height
        // this._width = width;
        // this._height = height
        this._graphics.setSize(width, height);
    }
}
