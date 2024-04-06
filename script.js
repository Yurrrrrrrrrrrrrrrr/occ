document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const scale = 20;
    const rows = canvas.height / scale;
    const columns = canvas.width / scale;
    let wallX = null;
    let wallY = null;
    let score = 0;

    class Snake {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.xSpeed = scale * 1;
            this.ySpeed = 0;
            this.total = 0;
            this.tail = [];
        }

        draw() {
            let gradient = ctx.createLinearGradient(this.x, this.y, this.x + scale, this.y + scale);
            gradient.addColorStop(0, "#00FF00");
            gradient.addColorStop(1, "#008000");

            for (let i = 0; i < this.tail.length; i++) {
                ctx.fillStyle = gradient;
                ctx.fillRect(this.tail[i].x, this.tail[i].y, scale, scale);
            }

            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(this.x, this.y, scale, scale);
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, scale, scale);
        }

        // Обновление позиции змеи
        update() {
            for (let i = 0; i < this.tail.length - 1; i++) {
                this.tail[i] = this.tail[i + 1];
            }
            this.tail[this.total - 1] = { x: this.x, y: this.y };
            this.x += this.xSpeed;
            this.y += this.ySpeed;

            if (this.x >= canvas.width) {
                this.x = 0;
            }
            if (this.y >= canvas.height) {
                this.y = 0;
            }
            if (this.x < 0) {
                this.x = canvas.width - scale;
            }
            if (this.y < 0) {
                this.y = canvas.height - scale;
            }
        }

        changeDirection(direction) {
            switch (direction) {
                case 'Up':
                    if (this.ySpeed !== scale * 1) {
                        this.xSpeed = 0;
                        this.ySpeed = -scale * 1;
                    }
                    break;
                case 'Down':
                    if (this.ySpeed !== -scale * 1) {
                        this.xSpeed = 0;
                        this.ySpeed = scale * 1;
                    }
                    break;
                case 'Left':
                    if (this.xSpeed !== scale * 1) {
                        this.xSpeed = -scale * 1;
                        this.ySpeed = 0;
                    }
                    break;
                case 'Right':
                    if (this.xSpeed !== -scale * 1) {
                        this.xSpeed = scale * 1;
                        this.ySpeed = 0;
                    }
                    break;
            }
        }

        eat(fruit) {
            if (this.x === fruit.x && this.y === fruit.y) {
                this.total++;
                score++;
                return true;
            }
            return false;
        }

        checkCollision() {
            for (let i = 0; i < this.tail.length; i++) {
                if (this.x === this.tail[i].x && this.y === this.tail[i].y) {
                    this.total = 0;
                    this.tail = [];
                    return;
                }
            }

            if (this.x >= canvas.width || this.y >= canvas.height || this.x < 0 || this.y < 0) {
                this.total = 0;
                this.tail = [];
            }
        }
    }

    // Класс Фрукта
    class Fruit {
        constructor() {
            this.x = 0;
            this.y = 0;
        }

        // Выбор случайного местоположения для фрукта
        pickLocation() {
            this.x = (Math.floor(Math.random() * rows)) * scale;
            this.y = (Math.floor(Math.random() * columns)) * scale;
        }

        // Отрисовка фрукта
        draw() {
            ctx.fillStyle = "#FF0000";
            ctx.fillRect(this.x, this.y, scale, scale);
        }
    }

    let snake = new Snake();
    let fruit = new Fruit();
    fruit.pickLocation();

    // Генерация стены
    function generateWall() {
        wallX = (Math.floor(Math.random() * rows)) * scale;
        wallY = (Math.floor(Math.random() * columns)) * scale;
    }

    // Удаление стены
    function removeWall() {
        wallX = null;
        wallY = null;
    }

    // Отрисовка стены
    function drawWall() {
        ctx.fillStyle = "#000000";
        ctx.fillRect(wallX, wallY, scale, scale);
    }

    // Обновление игры
    function updateGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawWall(); // Рисуем стену перед фруктом
        fruit.draw();
        snake.update();
        snake.draw();

        // Проверка счета и создание стены при необходимости
        if (score !== 0 && score % 5 === 0) {
            generateWall();
        }

        if (snake.eat(fruit)) {
            fruit.pickLocation(); // Получаем новое положение фрукта
        }

        if (snake.x === wallX && snake.y === wallY) {
            snake.total = 0;
            snake.tail = [];
            removeWall();
        }

        document.querySelector('.score').innerText = snake.total;

        const bestScore = localStorage.getItem('bestScore') || 0;
        if (snake.total > bestScore) {
            localStorage.setItem('bestScore', snake.total);
        }
        document.querySelector('.best-score').innerText = localStorage.getItem('bestScore');
    }

    const gameInterval = setInterval(updateGame, 100);

    canvas.addEventListener('touchstart', handleTouchStart, false);
    canvas.addEventListener('touchmove', handleTouchMove, false);

    let xDown = null;
    let yDown = null;

    function handleTouchStart(evt) {
        const firstTouch = evt.touches[0];
        xDown = firstTouch.clientX;
        yDown = firstTouch.clientY;
    };

    function handleTouchMove(evt) {
        if (!xDown || !yDown) {
            return;
        }

        let xUp = evt.touches[0].clientX;
        let yUp = evt.touches[0].clientY;

        let xDiff = xDown - xUp;
        let yDiff = yDown - yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0) {
                // Свайп влево
                snake.changeDirection('Left');
            } else {
                // Свайп вправо
                snake.changeDirection('Right');
            }
        } else {
            if (yDiff > 0) {
                // Свайп вверх
                snake.changeDirection('Up');
            } else {
                // Свайп вниз
                snake.changeDirection('Down');
            }
        }

        xDown = null;
        yDown = null;
    };

    // Остановка игры перед закрытием страницы
    window.addEventListener('beforeunload', () => {
        clearInterval(gameInterval);
    });
});
