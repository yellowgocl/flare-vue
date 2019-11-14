/* eslint-disable no-console */
import Flare from '@2dimensions/flare-js';
import Timer from '~/utils/timer';
import * as glMatrix from 'gl-matrix';
import { first, forEach, isEmpty, isNumber, find } from 'lodash';

const ScaleType = Object.freeze({
    FIT: Symbol('fit'),
    ORIGINAL: Symbol('original'),
})

export { ScaleType }

export default class FlareWrapper {

    

    _canvas;
    _graphics;
    _onReady;
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

    constructor(canvas, { onReady, width, height, scale, fps }) {
        this._onReady = onReady;
        this._canvas = canvas;
        this._width = width;
        this._height = height;
        this._scale = scale;
        this.fps = fps;
        this.init();
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
        return this._scale || this.width / (this.artboardWidth || 1);
    }

    get width() {
        return this._width || (this._actor ? first(this._actor._Artboards)._Width : this._canvas.width);
    }
    get height() {
        return this._height || (this._actor ? first(this._actor._Artboards)._Height : this._canvas.height);
    }
    get artboardWidth() {
        return this._actor ? first(this._actor._Artboards)._Width : this._canvas.width;
    }
    get artboardHeight() {
        return (this._actor ? first(this._actor._Artboards)._Height : this._canvas.height);
    }
    set actor(value) {
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
                console.info(this._animationNames)
                this.play('full')
                // this._animation = instance.animations[0];
                // this._animationInstance = new Flare.AnimationInstance(this._animation._Actor, this._animation);
                // if (!this._animationInstance) {
                //     console.warn('no animation in here?');
                //     return;
                // }
            }
        }
    }

    play(name) {
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
            console.warn('no animation in here?');
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

    load(url) {
        const loader = new Flare.ActorLoader();
        const result = new Promise((resolve, reject) => {
            loader.load(url, (actor) => {
                if (!actor || actor.error){
                    reject(!actor ? null : actor.error, this)
                } else {
                    this.actor = actor;
                    resolve(this);
                }
            })
        })
        
        return result;
    }

    init() {
        let canvas = this._canvas;
        this._graphics = new Flare.Graphics(canvas);
        this._graphics.initialize(() => {
            this._viewTransform = glMatrix.mat2d.create();
            this.disposeAnimations();
            this._timer = Timer.setInterval(this._render.bind(this), 1000 / 60);
            this._render(0);
            this._onReady && this._onReady(this);
        }, '');
    }

    restart() {
        if (this._animationInstance) {
            this._animationInstance.reset();
        }
    }

    _render(delta) {
        this.setSize(this.width, this.height);
        const actor = this._actorInstance;

        if (this._animationInstance) {
            const ai = this._animationInstance;
            ai.time = ai.time + delta / 1000;
            ai.apply(this._actorInstance, 1.0);
        }

        if (actor) {
            let scale = this.scale;
            //const graphics = this._graphics;
            //const vw = graphics.viewportWidth;
            //const vh = graphics.viewportHeight;
            const vt = this._viewTransform;
            vt[0] = vt[3] = scale;
            vt[4] = 0 //(-this._viewCenter[0] * scale + vw >> 1)
            vt[5] = 0 //(-this._viewCenter[1] * scale + vh >> 1)
            
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
        graphics.clear([.3628, .3628, .3628, 1.0]);
        graphics.setView(this._viewTransform);
        this._actorInstance.draw(graphics);
        graphics.flush();
    }
    
    setSize(width, height, force = true) {
        width = width || this.width;
        height = height || this.height;
        if (force) {
            this._width = width;
            this._height = height;
        }
        this._graphics.setSize(this.artboardWidth * this.scale, this.artboardHeight * this.scale);
    }
}
