view.js

import '../lib/utils/getContentBoxSize';
import '../lib/utils/noHello';
import Chain from '../lib/utils/Chain';

export default class View {
    constructor(dom) {
        this.app = new PIXI.Application({ width: 750, height: 1206, transparent: true });
        dom.appendChild(this.app.view);
        this.app.ticker.destroy(); // Disabling PIXI's default ticker

        this.snake = new Chain();
        this.decorateSnakeMethods();
        this.collection = [];
        this.initGraphicsExtension();
        this.stage = this.app.stage;
    }

    decorateSnakeMethods() {
        const methods = ['shift', 'unshift', 'pop', 'push', 'insertAfter'];
        methods.forEach(method => {
            const original = this.snake[method];
            this.snake[method] = (data) => {
                const node = this.snakeNodeHandler(data);
                const result = original.call(this.snake, data);
                if (['shift', 'pop'].includes(method)) this.collect(node);
                return result;
            };
        });
    }

    snakeNodeHandler(data) {
        let node = this.calloc();
        node.position.set(...this.getPosition(data));
        return node;
    }

    init(config) {
        const { width, height, row, column, data } = config;
        this.config = { ...config, size: { width: width / row, height: height / column } };
        this.data = data;
        this.zone = new PIXI.Container();
        this.stage.addChild(this.zone);
        this.drawBounds();
        this.food = this.createFood();
        this.syncInitialData();
    }

    drawBounds() {
        const { border, width, height } = this.config;
        const bounds = new PIXI.Graphics();
        bounds.beginFill(0xffffff).lineStyle(8, border).drawRect(0, 0, width, height);
        this.stage.addChild(bounds);
        this.zone.x = bounds.x + 4;
        this.zone.y = bounds.y + 4;
    }

    createFood() {
        let food = this.calloc();
        food.alpha = 0;
        TweenMax.to(food, 0.2, { alpha: 1, repeat: -1, yoyo: true });
        return food;
    }

    syncInitialData() {
        this.data.snake.forEach(node => this.snake.push(node.data));
    }

    update(data) {
        this.updateFood(data.food);
        this.updateSnake(data.snake);
    }

    updateFood(index) {
        if (index !== undefined) {
            this.food.visible = true;
            this.food.position.set(...this.getPosition(index));
        } else {
            this.food.visible = false;
        }
    }

    updateSnake(snakeData) {
        // Efficiently update snake chain with the new data
        // This should be implemented based on how your data changes
    }

    calloc() {
        let node;
        if (this.collection.length > 0) {
            node = this.collection.pop();
        } else {
            node = new PIXI.Graphics();
            node.beginFill(this.config.color).drawRect(0, 0, this.config.size.width, this.config.size.height);
            node.pivot.set(this.config.size.width / 2, this.config.size.height / 2);
        }
        this.zone.addChild(node);
        return node;
    }

    collect(node) {
        this.zone.removeChild(node);
        this.collection.push(node);
    }

    getPosition(index) {
        const col = index % this.config.column;
        const row = Math.floor(index / this.config.column);
        return [col * this.config.size.width, row * this.config.size.height];
    }
}
