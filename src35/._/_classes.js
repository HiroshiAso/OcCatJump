const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const PREFERENCE = {
  ...matome,
  GROUND_Y: canvas.height, // キャンバスの最下部
};

// 基本のGameObjectクラス
class GameObject {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  setImage(src) {
    this.image = new Image();
    this.image.src = src;
  }

  update() {
    return true;
  }

  draw(ctx) {
    if (this.image) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  intersects(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }
}

// パーティクルクラス
class Particle {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.size = options.size || Math.random() * 4 + 2;
    this.speedX = options.speedX || (Math.random() - 0.5) * 6;
    this.speedY = options.speedY || -(Math.random() * 4 + 2);
    this.gravity = options.gravity || 0.2;
    this.life = 1.0;
    this.decay = options.decay || Math.random() * 0.02 + 0.02;
    this.color = options.color || "rgba(255, 220, 100,";
  }

  update() {
    this.speedY += this.gravity;
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= this.decay;
    return this.life > 0;
  }

  draw(ctx) {
    ctx.fillStyle = `${this.color} ${this.life})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
const createParticles = (count, x, y, options = {}) => {
  var particles = [];
  for (let i = 0; i < count; i++) {
    particles = [...particles, new Particle(x, y, options)];
  }
  return particles;
};

// プレイヤークラス
class Player extends GameObject {
  constructor() {
    super(50, PREFERENCE.GROUND_Y, 40, 40);
    this.velocityY = 0;
    this.isJumping = false;
    this.canDoubleJump = true;
    this.direction = 1;
    this.images = {
      standing: new Image(),
      jumping: new Image(),
    };

    switch (PREFERENCE.PLAYER_ICON) {
      case "neko":
        this.images.standing.src = "./._/cat.gif";
        this.images.jumping.src = "./._/cat.gif";
        break;
      case "inu":
        this.images.standing.src = "./._/dog.png";
        this.images.jumping.src = "./._/dog.png";
        break;
      case "hebi":
        this.images.standing.src = "./._/snake.png";
        this.images.jumping.src = "./._/snake.png";
        break;
      default:
        this.images.standing.src = "./._/cat.gif";
        this.images.jumping.src = "./._/cat.gif";
        break;
    }
  }

  update() {
    this.velocityY += PREFERENCE.GRAVITY;
    this.y += this.velocityY;
    if (this.y >= PREFERENCE.GROUND_Y) {
      this.y = PREFERENCE.GROUND_Y;
      this.velocityY = 0;
      this.isJumping = false;
      this.canDoubleJump = true;
    }
    return true;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y - this.height / 2);
    ctx.scale(this.direction, 1);
    const image = this.images[this.isJumping ? "jumping" : "standing"];
    ctx.drawImage(
      image,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    ctx.restore();
  }

  jump() {
    if (!this.isJumping) {
      ctx.fillStyle = "rgba(100, 200, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y - this.height / 2,
        12,
        0,
        Math.PI * 2
      );
      ctx.fill();
      this.velocityY = -PREFERENCE.JUMP_POWER;
      this.isJumping = true;
      return createParticles(5, this.x + this.width / 2, this.y);
    } else if (this.canDoubleJump) {
      this.velocityY = -PREFERENCE.JUMP_POWER * 0.8;
      this.canDoubleJump = false;
      return createParticles(8, this.x + this.width / 2, this.y, {
        color: "rgba(100, 200, 255,",
      });
    }
    return [];
  }
}

// 障害物クラス
class Obstacle extends GameObject {
  constructor(x, y) {
    super(x, y, 50, 50);
    this.collected = false;
    this.speedY = PREFERENCE.NEZUMI_SPEED;
    this.setImage("./._/obs.png");
  }

  update() {
    this.y += this.speedY;
    return this.y < canvas.height;
  }
}

// アイテムクラス
class Item extends GameObject {
  constructor(x, y) {
    super(x, y, 40, 40);
    this.collected = false;
    this.speedY = PREFERENCE.SAKANA_SPEED;
    this.setImage("./._/item.png");
  }

  update() {
    this.y += this.speedY;
    return this.y < canvas.height;
  }
}
