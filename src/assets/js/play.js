const canvas = document.querySelector('canvas')
const scoreEL = document.querySelector('#scoreEl')
const timeEL = document.querySelector('#timeEl')
const c = canvas.getContext('2d')

const savedUFOs = localStorage.getItem('numberOfUFOs') || '1';
const savedTime = localStorage.getItem('timeLimit') || '60';
const numOfUFOs = parseInt(savedUFOs, 10);


canvas.width = innerWidth
canvas.height = innerHeight

let score = 0
let time = savedTime
let gameActive = true;

const interval = setInterval(() => {
    timeEL.textContent = time;

    if (time <= 1) {
        clearInterval(interval);
        timeEL.textContent = "Time's up!";
        gameActive = false;

        const minutes = savedTime / 60;
        let finalScore = score / minutes;

        if (savedUFOs > 1) {
            finalScore -= 50 * (savedUFOs - 1);
        }

        scoreEL.innerHTML = Math.max(0, Math.floor(finalScore));
    }
    time--;
    timeEL.innerHTML = time
}, 1000);

class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        }

        const image = new Image()
        image.src = './img/missile.png'

        image.onload = () => {
            const scale = 0.35
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            }
            this.ready = true
        }
    }

    draw() {
        if (this.ready) {
            c.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            )
        }
    }

    update() {
        if (this.ready) {
            this.draw()
            this.position.x += this.velocity.x
            this.position.y += this.velocity.y

            if (this.position.y + this.height < -200) {
                score -= 25
                scoreEL.innerHTML = score
                this.position.x = canvas.width / 2 - this.width / 2
                this.position.y = canvas.height - this.height - 20
                this.velocity.y = 0
            }
        }
    }
}

class Invader {
    constructor({ position }) {
        this.velocity = {
            x: (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 2),
            y: 0
        };

        const image = new Image();
        image.src = './img/ufo.png';

        image.onload = () => {
            const scale = 0.15;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = { x: position.x, y: position.y };
            this.ready = true;
            this.isDestroyed = false;

            // Explosion GIF setup
            this.explosionGif = new Image();
            this.explosionGif.src = './img/explosion.gif';
            this.explosionTimer = 0;
            this.explosionDuration = 30;
        };
    }

    draw() {
        if (this.ready && !this.isDestroyed) {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        } else if (this.isDestroyed) {
            c.drawImage(this.explosionGif, this.position.x - 20, this.position.y - 20, 80, 80);
            this.explosionTimer++;

            if (this.explosionTimer >= this.explosionDuration) {
                this.respawn();
            }
        }
    }

    update() {
        if (this.ready && !this.isDestroyed) {
            this.position.x += this.velocity.x;

            // Bounce off the screen edges
            if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
                this.velocity.x = -this.velocity.x;
            }

            this.draw();
        } else if (this.isDestroyed) {
            this.draw();
        }
    }

    respawn() {
        console.log('Respawning invader...');
        this.position.x = Math.random() * (canvas.width - this.width);
        this.position.y = Math.random() * (canvas.height / 2);
        this.velocity.x = (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 2);
        this.isDestroyed = false;
        this.ready = true;
        this.explosionTimer = 0;
    }
}


class Grid {
    constructor() {
        this.resetGrid();
        this.invaders = [];

        // Spawn invaders based on `savedUFOs`
        for (let i = 0; i < savedUFOs; i++) {
            const invader = new Invader({
                position: {
                    x: Math.random() * (canvas.width - 50),
                    y: Math.random() * (canvas.height / 2)
                }
            });
            this.invaders.push(invader);
        }
    }

    update() {
        this.invaders.forEach(invader => {
            invader.update();
        });
    }

    resetGrid() {
        const startX = Math.random() * (canvas.width - 50);
        const startY = Math.random() * (canvas.height / 2);

        this.position = { x: startX, y: startY };
        this.velocity = { x: 2.5, y: 0 };
        
        console.log('New grid position:', this.position);
    }

    update() {
        if (this.invaders[0].ready && this.width === 0) {
            this.width = this.invaders[0].width;
        }

        this.position.x += this.velocity.x;

        // Bounce off the canvas edges
        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x;
        }
    }
}

const player = new Player()
const grids = [new Grid()]
const keys = {
    a: { pressed: false },
    d: { pressed: false },
    space: { pressed: false }
}

function isColliding(rect1, rect2) {
    return (
        rect1.position.x < rect2.position.x + rect2.width &&
        rect1.position.x + rect1.width > rect2.position.x &&
        rect1.position.y < rect2.position.y + rect2.height &&
        rect1.position.y + rect1.height > rect2.position.y
    );
}

function animate() {
    try {
        requestAnimationFrame(animate);
        c.fillStyle = 'black';
        c.fillRect(0, 0, canvas.width, canvas.height);

        if (gameActive){
            player.update();

            if (player.velocity.y === 0) {
                if (keys.a.pressed && player.position.x >= 0) {
                    player.velocity.x = -5;
                } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
                    player.velocity.x = +5;
                } else {
                    player.velocity.x = 0;
                }
            } else {
                player.velocity.x = 0;
            }
    
            grids.forEach(grid => {
                grid.update();
                grid.invaders.forEach(invader => {
                    invader.update({ velocity: grid.velocity });
            
                    // Check for collision
                    if (isColliding(player, invader) && !invader.isDestroyed) {
                        console.log('Collision detected!');
                        invader.isDestroyed = true;
                        score += 100
                        scoreEL.innerHTML = score
                        player.velocity.y = 0;
                        player.position.x = canvas.width / 2 - player.width / 2;
                        player.position.y = canvas.height - player.height - 20;
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error in animate function:', error);
    }
}

animate()

addEventListener('keydown', ({ key }) => {
    if (!gameActive) return
    switch (key) {
        case 'a':
            console.log('left')
            keys.a.pressed = true
            break
        case 'd':
            console.log('right')
            keys.d.pressed = true
            break
        case ' ':
            console.log('space')
            if (player.ready && player.velocity.y === 0) {
                player.velocity.y = -10
            }
            break
    }
})

addEventListener('keyup', ({ key }) => {
    if (!gameActive) return
    switch (key) {
        case 'a':
            console.log('left')
            keys.a.pressed = false
            break
        case 'd':
            console.log('right')
            keys.d.pressed = false
            break
    }
})


