import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PlayComponent implements AfterViewInit {
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  score = 0;
  time = 60;
  gameActive = true;
  private c!: CanvasRenderingContext2D;
  private player!: Player;
  private grids: Grid[] = [];
  private missiles: Missile[] = [];

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.c = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.startGame();
  }

  startGame() {
    const savedUFOs = parseInt(localStorage.getItem('numberOfUFOs') || '1', 10);
    const savedTime = parseInt(localStorage.getItem('timeLimit') || '60', 10);
    this.time = savedTime;

    const scoreEL = document.querySelector('#scoreEl')!;
    const timeEL = document.querySelector('#timeEl')!;

    this.player = new Player(this.c, this.canvasRef.nativeElement, this.missiles);
    this.grids.push(new Grid(this.c, savedUFOs, this.canvasRef.nativeElement));

    // Timer
    const interval = setInterval(() => {
      timeEL.textContent = this.time.toString();
      if (this.time <= 1) {
        clearInterval(interval);
        timeEL.textContent = "Time's up!";
        this.gameActive = false;
        scoreEL.textContent = this.score.toString();
      }
      this.time--;
    }, 1000);

    // Game loop
    const animate = () => {
      requestAnimationFrame(animate);
      this.c.fillStyle = 'black';
      this.c.fillRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

      if (this.gameActive) {
        this.player.update();
        this.grids.forEach(grid => grid.update(this.player, this.missiles, this));
        this.missiles.forEach(missile => missile.update());
      }
    };
    animate();
  }

  addScore(points: number) {
    this.score += points;
    document.querySelector('#scoreEl')!.textContent = this.score.toString();
  }
}

// Player Class
class Player {
  position!: { x: number; y: number };
  velocity: { x: number; y: number } = { x: 0, y: 0 };
  image: HTMLImageElement = new Image();
  ready = false;

  constructor(
    private c: CanvasRenderingContext2D,
    private canvas: HTMLCanvasElement,
    private missiles: Missile[]
  ) {
    this.image.src = 'assets/img/missile.png';
    this.image.onload = () => {
      this.ready = true;
      this.position = {
        x: this.canvas.width / 2 - 25,
        y: this.canvas.height - 100
      };
    };

    addEventListener('keydown', this.handleKeyDown.bind(this));
    addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  draw() {
    if (this.ready) {
      this.c.drawImage(this.image, this.position.x, this.position.y, 50, 50);
    }
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;

    if (this.position.x < 0) this.position.x = 0;
    if (this.position.x + 50 > this.canvas.width) this.position.x = this.canvas.width - 50;
  }

  handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'a':
        this.velocity.x = -5;
        break;
      case 'd':
        this.velocity.x = 5;
        break;
      case ' ':
        this.missiles.push(new Missile(this.c, this.position.x + 20, this.position.y));
        break;
    }
  }

  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'a' || event.key === 'd') this.velocity.x = 0;
  }
}

// Missile Class
class Missile {
  position: { x: number; y: number };
  velocity = { x: 0, y: -10 };
  width = 5;
  height = 20;
  color = 'red';

  constructor(private c: CanvasRenderingContext2D, x: number, y: number) {
    this.position = { x, y };
  }

  draw() {
    this.c.fillStyle = this.color;
    this.c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.position.y += this.velocity.y;
    this.draw();
  }
}

// Invader Class (UFOs)
class Invader {
  position: { x: number; y: number };
  velocity = { x: Math.random() < 0.5 ? -2 : 2, y: 0 };
  image: HTMLImageElement = new Image();
  ready = false;
  isDestroyed = false;
  explosion = new Image();
  explosionTimer = 0;
  explosionDuration = 30;

  constructor(private c: CanvasRenderingContext2D, startPos: { x: number; y: number }) {
    this.image.src = 'assets/img/ufo.png';
    this.explosion.src = 'assets/img/explosion.gif';
    this.position = startPos;
    this.image.onload = () => {
      this.ready = true;
    };
  }

  draw() {
    if (this.ready && !this.isDestroyed) {
      this.c.drawImage(this.image, this.position.x, this.position.y, 50, 50);
    } else if (this.isDestroyed) {
      this.c.drawImage(this.explosion, this.position.x - 20, this.position.y - 20, 80, 80);
      this.explosionTimer++;
    }
  }

  update() {
    this.draw();
    if (!this.isDestroyed) {
      this.position.x += this.velocity.x;
      if (this.position.x <= 0 || this.position.x + 50 >= this.c.canvas.width) {
        this.velocity.x = -this.velocity.x;
      }
    }
    if (this.explosionTimer >= this.explosionDuration) {
      this.respawn();
    }
  }

  respawn() {
    this.isDestroyed = false;
    this.position.x = Math.random() * (this.c.canvas.width - 50);
    this.position.y = Math.random() * (this.c.canvas.height / 2);
    this.explosionTimer = 0;
  }
}

// Grid Class (Spawns Invaders)
class Grid {
  invaders: Invader[] = [];

  checkCollision(missile: Missile, invader: Invader): boolean {
    return (
      missile.position.x < invader.position.x + 50 &&
      missile.position.x + missile.width > invader.position.x &&
      missile.position.y < invader.position.y + 50 &&
      missile.position.y + missile.height > invader.position.y
    );
  }
  

  constructor(private c: CanvasRenderingContext2D, numberOfUFOs: number, private canvas: HTMLCanvasElement) {
    for (let i = 0; i < numberOfUFOs; i++) {
      const invader = new Invader(this.c, {
        x: Math.random() * (this.canvas.width - 50),
        y: Math.random() * (this.canvas.height / 2)
      });
      this.invaders.push(invader);
    }
  }

  update(player: Player, missiles: Missile[], component: PlayComponent) {
    this.invaders.forEach(invader => {
      invader.update();
      
      // Collision detection with missiles
      missiles.forEach((missile, missileIndex) => {
        if (this.checkCollision(missile, invader) && !invader.isDestroyed) {
          invader.isDestroyed = true;
          missiles.splice(missileIndex, 1);
          component.addScore(100);
        }
      });
    });
  }
}
