control.js

import ticker from '../lib/utils/ticker';
import timer from '../lib/utils/timer';
import randomList from '../lib/utils/randomList';
import Events from '../lib/utils/events';

export default class Control {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.speedScalar = 1;
        this.interval = 300 / this.speedScalar;
        this.event = new Events();
        this.fourDirections = ["left", "up", "right", "down"];
        this.directions = [];
        this.setupSpeedProperty();
        this.bindMethods();
    }

    setupSpeedProperty() {
        Object.defineProperty(this, "speed", {
            get: () => this.speedScalar,
            set: (value) => {
                if (this.speedScalar !== value) {
                    this.speedScalar = value;
                    this.interval = 300 / this.speedScalar;
                    timer.set(this.intervalID, { delay: this.interval });
                }
            }
        });
    }

    bindMethods() {
        this.tickHandle = this.tickHandle.bind(this);
        this.update = this.update.bind(this);
    }

    init(config = {}) {
        ticker.addEventListener("tick", this.tickHandle);
        this.pause();

        const {
            width = 640, height = 640, row = 50, column = 50,
            border = 0x999999, color = 0x000000, food = color,
            min = 3, speed = 1
        } = config;

        this.config = config;
        this.model.init({ row, column, min });
        this.view.init({ width, height, row, column, border, color, food, data: this.model.getData() });
        this.intervalID = timer.setInterval(this.update, this.interval);
        this.speed = speed;
        this.food = this.model.food;
        if (config.time > 0) {
            let time = config.time / 1000;
            timer.setTimeout(() => this.gameover("timeout"), config.time);
            timer.setInterval(() => this.event.dispatch("countdown", --time), 1000);
        }
    }

    destroy() {
        ticker.removeEventListener("tick", this.tickHandle);
        timer.clean();
        this.model.destroy();
        this.view.destroy();
        this.GAMEOVER = false;
    }

    turn(direction) {
        if (!this.fourDirections.includes(direction)) return;
        let directionA = direction, directionB = this.directions[0] || this.direction;
        if (this.directions.length < 5 && directionA !== directionB && !this.isAdverse(directionA, directionB)) {
            this.directions.unshift(directionA);
        }
    }

    isAdverse(directionA, directionB) {
        let indexA = this.fourDirections.indexOf(directionA);
        let indexB = this.fourDirections.indexOf(directionB);
        return Math.abs(indexA - indexB) === 2;
    }

    pause() {
        if (this.GAMEOVER) return;
        ticker.pause();
    }

    resume() {
        if (this.GAMEOVER) return;
        ticker.resume();
    }

    start() {
        if (this.GAMEOVER) return;
        let { leader, zone } = this.model;
        this.directions.push(randomList(this.fourDirections.filter(item => leader[item] !== -1 && zone[leader[item]].fill === undefined), 1));
        this.update();
    }

    restart() {
        this.destroy();
        this.init(this.config);
        this.start();
    }

    gameover(type) {
        if (this.GAMEOVER) return;
        this.event.dispatch("gameover", type);
        this.pause();
        this.GAMEOVER = true;
    }

    update() {
        this.direction = this.directions.pop() || this.direction;
        this.model.move(this.direction);
        if (this.model.bar !== undefined) {
            this.gameover(this.model.bar);
        }
        let data = { snake: this.model.snake, food: this.model.food };
        if (this.model.dirty) {
            let hasEatEvent = false;
            if (this.food !== this.model.food) {
                this.food = this.model.food;
                hasEatEvent = true;
                this.event.dispatch("before-eat");
                this.length = this.model.snake.length;
            }
            this.view.update(data);
            if (hasEatEvent) this.event.dispatch("eat");
            this.model.cleanDirty();
        }
    }

    tickHandle() {
        timer.update(ticker.paused, ticker.elapsedMS * 1000);
        if (!ticker.paused) {
            this.view.updateTicker();
        }
    }
}
