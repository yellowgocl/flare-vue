/* eslint-disable no-console */
import Flare from '@2dimensions/flare-js';
import Timer from '~/utils/timer';
import * as glMatrix from 'gl-matrix';

export default class FlareWrapper {
    _canvas;
    _graphics;
    _onReady;
    _viewTransform;
    _animationInstance = null;
    _animation = null;
    _width = 600;
    _height = 600;
    _actorInstance;
    _actor;
    _scale;
    _viewCenter = [0.0, 0.0];
    _timer;

    constructor(canvas, { onReady, width, height, scale }) {
        this._onReady = onReady;
        this._canvas = canvas;
        this._width = width || canvas.width;
        this._height = height || canvas.height;
        this._scale = scale || .25;
        this.init();
    }

    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    set actor(value) {
        this.disposeActor();
        console.info(value)
        value.initialize(this._graphics);
        const instance = value.makeInstance();
        instance.initialize(this._graphics);
        this._actor = value;
        this._actorInstance = instance;
        console.info(value)
        if (instance) {
            instance.initialize(this._graphics);
            if (instance._Animations.length) {
                this._animation = instance.animations[0];
                this._animationInstance = new Flare.AnimationInstance(this._animation._Actor, this._animation);
                if (!this._animationInstance) {
                    console.warn('no animation in here?');
                    return;
                }
            }
        }
    }

    disposeActor() {
        if (this._actor)
            this._actor.dispose(this._graphics);

        if (this._actorInstance)
            this._actorInstance.dispose(this._graphics);
    }

    load(url) {
        const loader = new Flare.ActorLoader();
        loader.load(url, (actor) => {
            if (!actor || actor.error){
                return Promise.reject(!actor ? null : actor.error)
            } else {
                this.actor = actor;
                return Promise.resolve(actor);
            }
        })
    }

    init() {
        let canvas = this._canvas;
        this._graphics = new Flare.Graphics(canvas);
        this._graphics.initialize(() => {
            this._viewTransform = glMatrix.mat2d.create();
            this._animation = null;
            this._animationInstance = null;
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
        this.setSize();
        const actor = this._actorInstance;

        if (this._animationInstance) {
            const ai = this._animationInstance;
            ai.time = ai.time + delta / 1000;
            ai.apply(this._actorInstance, 1.0);
        }

        if (actor) {
            const graphics = this._graphics;
            const vw = graphics.viewportWidth;
            const vh = graphics.viewportHeight;
            const vt = this._viewTransform;
            let scale = this._scale;
            vt[0] = vt[3] = this._scale;
            vt[4] = (-this._viewCenter[0] * scale + vw >> 1)
            vt[5] = (-this._viewCenter[1] * scale + vh >> 1)
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
    
    setSize(width, height) {
        width = width || this.width;
        height = height || this.height;
        this._width = width;
        this._height = height;
        this._graphics.setSize(width, height);
    }
}
