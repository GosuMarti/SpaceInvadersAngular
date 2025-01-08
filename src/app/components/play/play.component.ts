import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

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
  scoreTime = 0;
  gameActive = true;
  gameEnded = false;
  finalScore = 0;
  loggedIn = false;
  private c!: CanvasRenderingContext2D;
  private player!: Player;
  private grids: Grid[] = [];
  currentPreferences: { ufos: number; time: number } = { ufos: 1, time: 60 };

  constructor(private http: HttpClient, private authService: AuthService, private route: ActivatedRoute) { }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.c = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.authService.isLoggedIn$.subscribe((status) => {
      this.loggedIn = status;
    });

    this.route.queryParams.subscribe((params: { [key: string]: any }) => {
      const ufos = params['ufos'] ? parseInt(params['ufos'], 10) : undefined;
      const time = params['time'] ? parseInt(params['time'], 10) : undefined;
  
      this.startGame({ ufos, time });
    });
  }

  startGame(preferences?: { ufos?: number; time?: number }): void {
    const savedUFOs = preferences?.ufos || parseInt(localStorage.getItem('numberOfUFOs') || '1', 10);
    const savedTime = preferences?.time || parseInt(localStorage.getItem('timeLimit') || '60', 10);

    this.currentPreferences = { ufos: savedUFOs, time: savedTime };

    this.time = savedTime;
    this.scoreTime = savedTime;

    const scoreEL = document.querySelector('#scoreEl')!;
    const timeEL = document.querySelector('#timeEl')!;

    this.player = new Player(this.c, this.canvasRef.nativeElement, this);
    this.grids.push(new Grid(this.c, savedUFOs, this.canvasRef.nativeElement));

    // Timer
    const interval = setInterval(() => {
      timeEL.textContent = this.time.toString();
      if (this.time <= 1) {
        clearInterval(interval);
        timeEL.textContent = "Time's up!";
        this.gameActive = false;
        this.gameEnded = true;

        const minutes = savedTime / 60;
        let finalScore = this.score / minutes;

        if (savedUFOs > 1) {
          finalScore -= 50 * (savedUFOs - 1);
        }

        this.finalScore = Math.max(0, Math.floor(finalScore));
        scoreEL.textContent = this.finalScore.toString();
      }
      this.time--;
    }, 1000);

    const animate = () => {
      requestAnimationFrame(animate);
      this.c.fillStyle = 'black';
      this.c.fillRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

      if (this.gameActive) {
        this.player.update();
        this.grids.forEach((grid) => grid.update(this.player, this));
      }
    };
    animate();
  }

  addScore(points: number) {
    this.score += points;
    document.querySelector('#scoreEl')!.textContent = this.score.toString();
  }

  deductScore(points: number) {
    this.score -= points;
    document.querySelector('#scoreEl')!.textContent = this.score.toString();
  }

    recordScore() {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to record your score!');
        return;
      }

      const payload = {
        punctuation: this.finalScore,
        ufos: this.currentPreferences.ufos,
        disposedTime: this.currentPreferences.time
      };

      this.http
        .post('http://wd.etsisi.upm.es:10000/records', payload, {
          headers: { Authorization: token },
        })
        .subscribe({
          next: () => alert('Score recorded successfully!'),
          error: (err) => alert('Failed to record score: ' + err.message),
        });
    }
}

// Player Class
class Player {
  position!: { x: number; y: number };
  velocity: { x: number; y: number } = { x: 0, y: 0 };
  image: HTMLImageElement = new Image();
  ready = false;

  private keys = {
    a: false,
    d: false
  };

  constructor(
    private c: CanvasRenderingContext2D,
    private canvas: HTMLCanvasElement,
    private component: PlayComponent
  ) {
    this.image.src = 'app/assets/img/missile.png';
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

    // Disable horizontal movement if the player is in the air
    if (this.velocity.y !== 0) {
      this.velocity.x = 0;
    } else {
      if (this.keys.a && !this.keys.d) {
        this.velocity.x = -5;
      } else if (this.keys.d && !this.keys.a) {
        this.velocity.x = 5;
      } else {
        this.velocity.x = 0;
      }
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.x < 0) {
      this.position.x = 0;
    } else if (this.position.x + 50 > this.canvas.width) {
      this.position.x = this.canvas.width - 50;
    }

    if (this.position.y + 50 < 0) {
      this.component.deductScore(25);
      this.resetPosition();
    }
  }

  resetPosition() {
    this.position = {
      x: this.canvas.width / 2 - 25,
      y: this.canvas.height - 100
    };
    this.velocity.y = 0;
  }

  handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'a':
        this.keys.a = true;
        break;
      case 'd':
        this.keys.d = true;
        break;
      case ' ':
        if (this.velocity.y === 0) {
          this.velocity.y = -10;
        }
        break;
    }
  }

  handleKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case 'a':
        this.keys.a = false;
        break;
      case 'd':
        this.keys.d = false;
        break;
    }
  }
}

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
    this.image.src = 'app/assets/img/ufo.png';
    this.explosion.src = 'app/assets/img/explosion.gif';
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

class Grid {
  invaders: Invader[] = [];

  checkCollision(player: Player, invader: Invader): boolean {
    return (
      player.position.x < invader.position.x + 50 &&
      player.position.x + 50 > invader.position.x &&
      player.position.y < invader.position.y + 50 &&
      player.position.y + 50 > invader.position.y
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

  update(player: Player, component: PlayComponent) {
    this.invaders.forEach(invader => {
      invader.update();

      // Collision detection with player
      if (this.checkCollision(player, invader) && !invader.isDestroyed) {
        invader.isDestroyed = true;
        component.addScore(100);
        player.resetPosition();
      }
    });
  }
}