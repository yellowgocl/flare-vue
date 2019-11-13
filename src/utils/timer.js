import { isUndefined, forEach } from 'lodash'
class Timer {
	constructor() {
		this.queue = new Map()
		this.paused = true
		this.usingRequestAnimationFrame = false

		Reflect.defineProperty(this, 'useRAF', {
			set: function(value) {
				Reflect.set(this, 'usingRequestAnimationFrame', value)
				value ? Timer.requestAnimationFrame.enable() : Timer.requestAnimationFrame.disable()
			}
		})

	}
	_set(fn, delay, type, id) {
		this.queue.set(id, {
			fn, 
			type, 
			paused: 0, 
			elapsed: 0,
			delay: delay
		})
		return id
	}
	setTimeout(fn, delay, id = Symbol('timeoutId')) {
		return this._set(fn, delay, 0, id)
	}
	setInterval(fn, delay, id = Symbol('timeoutId')) {
		return this._set(fn, delay, 1, id)
	}
	clearTimeout(qid) {
		return this.delete(qid)
	}
	clearInterval(qid) {
		return this.delete(qid)
	}
	set(qid, config = {}) {
		let item = this.queue.get(qid) || {}
		for(let key in config) {
			item[key] = config[key]
		}
		return true
	}
	delete(qid) {
		return this.queue.delete(qid)
	}
	pause(qid) {
		isUndefined(qid) ? this.pauseAll() : (this.queue.get(qid).paused = 1)
		return true
	}
	resume(qid) {
		return this.play(qid)
	}
	play(qid) {
		isUndefined(qid) ? this.playAll() : (this.queue.get(qid).paused = 0)
		return true
	}
	playAll() {
		forEach(this.queue, (o) => o.paused = 0)
		return true
	}
	pauseAll() {
		forEach(this.queue, (o) => o.paused = 1)
		return true
	}
	tick(delta) {
		this.paused || this.updateQueue(delta)
	}
	updateQueue(delta) {
		this.queue.forEach((o, i) => {
			if (o.paused) {
				return
			}
			o.elapsed += delta
			if (o.elapsed >= o.delay) {
				o.fn(delta, o.elapsed, Timer.requestAnimationFrame.time)
				o.type === 0 ? this.delete(i) : (o.elapsed = 0)
			}
		})
	}
	update() {
		this.useRAF = false
		this.update = (delta) => {
			if (this.usingRequestAnimationFrame) {
				return 
			}
			this.tick(delta)
		}
	}
}

class AnimationFrame {
	constructor() {
		this.time = 0
		this.auto = this.auto.bind(this)
	}

	auto(elapsed) {
		if (this.time === 0) {
			this.time = elapsed
		}
		timer.tick(elapsed - this.time)
		this.time = elapsed
		this.id = requestAnimationFrame(this.auto)
	}

	enable() {
		timer.paused = false
		this.id = requestAnimationFrame(this.auto)
	}

	disable() {
		cancelAnimationFrame(this.id)
	}
}

Timer.requestAnimationFrame = new AnimationFrame()

let timer = new Timer()

timer.useRAF = true

export default timer
