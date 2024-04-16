model.js

import randomList from '../lib/utils/randomList';
import Chain from '../lib/utils/Chain';

export default class Model {
    constructor() {
        this.zone = [];
        this.snake = new Chain();
        this.setupSnakeMethods();
    }

    setupSnakeMethods() {
        const snakeMethods = ['unshift', 'push', 'shift', 'pop'];
        snakeMethods.forEach(method => {
            const original = this.snake[method];
            this.snake[method] = (data) => {
                const result = original.call(this.snake, data);
                this.updateZone(data, method === 'shift' || method === 'pop' ? undefined : 'snake');
                return result;
            };
        });

        Object.defineProperty(this, 'food', {
            get: () => this._food,
            set: (value) => {
                this._food = value;
                if (value !== undefined) {
                    this.updateZone(value, 'food');
                }
            }
        });
    }

    init(config) {
        const { row, column, min } = config;
        this.zone = new Array(row * column).fill().map((_, i) => {
            const col = i % column;
            const row = Math.floor(i / column);
            return {
                col, row,
                left: col > 0 ? i - 1 : -1,
                right: col < column - 1 ? i + 1 : -1,
                up: row > 0 ? i - column : -1,
                down: row < row - 1 ? i + column : -1,
                fill: undefined
            };
        });

        while (this.snake.length < min) {
            const index = this.snake.length ? this.neighbour() : Math.floor(Math.random() * this.zone.length);
            this.snake.unshift(index);
        }
        this.feed();
    }

    destroy() {
        this.zone = [];
        this.snake.clean();
        this.food = undefined;
    }

    neighbour() {
        return randomList(this.zone.filter(cell => cell.fill === undefined), 1);
    }

    updateZone(index, fill) {
        this.zone[index].fill = fill;
        this.dirty = true;
    }

    cleanDirty() {
        this.dirty = false;
    }

    move(direction) {
        const currentIndex = this.snake.first().data;
        const nextIndex = this.zone[currentIndex][direction];
        if (nextIndex === -1 || this.zone[nextIndex].fill === 'snake') {
            this.collision('self');
        } else {
            if (this.zone[nextIndex].fill === 'food') {
                this.eat(nextIndex);
            } else {
                this.snake.shift();
                this.snake.unshift(nextIndex);
            }
        }
    }

    eat(index) {
        this.snake.unshift(index);
        this.feed();
    }

    collision(type) {
        this.gameOver = true;
        console.error(type);
    }

    feed() {
        let emptyCells = this.zone.filter(cell => cell.fill === undefined);
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.food = randomCell;
        } else {
            this.food = undefined; // No space left
        }
    }
}
