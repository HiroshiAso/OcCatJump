const openingOverlay = document.getElementById("openingOverlay");
const victoryOverlay = document.getElementById("victoryOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");

const itemCntDisplay = document.getElementById("itemCntDisplay");
const obsCntDisplay = document.getElementById("obsCntDisplay");

const timer = document.getElementById("timer");
if (!PREFERENCE.ON_TIMER) {
  timer.style.display = "none";
}

// ゲームの状態

var item_cnt = 0;
var obs_cnt = 0;

var lastObstacleTime = 0;
var lastItemTime = 0;
var startTime = 0;
var elapsedTime = 0;

var stoppedTime = 0;
var stoppedTimeAcc = 0;

var player = new Player();
var keys = { left: false, right: false };

var opening = true;
var over = false;
var tmpstop = false;

var gameObjects = { obstacles: [], items: [], particles: [] };

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (!opening && !tmpstop && !over) {
      gameObjects.particles.push(...player.jump());
      seplayer(PREFERENCE.SOUND, "jump");
    }

    e.preventDefault();
  }
  if (e.code === "ArrowLeft") {
    keys.left = true;
    e.preventDefault();
  }
  if (e.code === "ArrowRight") {
    keys.right = true;
    e.preventDefault();
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") keys.left = false;
  if (e.code === "ArrowRight") keys.right = false;
  if (e.code == "Enter") {
    e.preventDefault();
    if (!opening && !over) {
      if (tmpstop) {
        tmpstop = false;
        stoppedTimeAcc += Date.now() - stoppedTime;
        gameLoop();
      } else {
        tmpstop = true;
        stoppedTime = Date.now();
      }
    } else {
      main();
    }
  }
});

const init = () => {
  item_cnt = 0;
  obs_cnt = 0;

  itemCntDisplay.textContent = 0;
  obsCntDisplay.textContent = 0;

  openingOverlay.style.display = "none";
  victoryOverlay.style.display = "none";
  gameOverOverlay.style.display = "none";

  lastObstacleTime = 0;
  lastItemTime = 0;
  startTime = Date.now();
  elapsedTime = 0;

  stoppedTime = 0;
  stoppedTimeAcc = 0;

  over = false;
  gameObjects = { obstacles: [], items: [], particles: [] };
};

const updateObjects = () => {
  // パーティクルの更新
  gameObjects.particles = gameObjects.particles.filter((p) => {
    p.update();
    p.draw(ctx);
    return p.life > 0;
  });

  // アイテムと障害物の更新
  ["obstacles", "items"].forEach((type) => {
    gameObjects[type] = gameObjects[type].filter((obj) => {
      const isAlive = obj.update();
      if (player.intersects(obj)) {
        if (type === "items" && !obj.collected) {
          item_cnt++;
          itemCntDisplay.textContent = item_cnt;
          seplayer(PREFERENCE.SOUND, "item");
          gameObjects.particles.push(
            ...createParticles(15, obj.x + obj.width / 2, obj.y, {
              color: "rgba(100, 255, 100,",
            })
          );
          obj.collected = true;
          return false;
        } else if (type === "obstacles" && !obj.collected) {
          obs_cnt++;
          obsCntDisplay.textContent = obs_cnt;
          seplayer(PREFERENCE.SOUND, "obs");
          gameObjects.particles.push(
            ...createParticles(20, obj.x + obj.width / 2, obj.y, {
              color: "rgba(255, 100, 100,",
            })
          );
          obj.collected = true;
          return false;
        }
      }
      if (!obj.collected) {
        obj.draw(ctx);
      }
      return isAlive && !obj.collected;
    });
  });
};

const spawnObjects = () => {
  const currentTime = Date.now();

  if (currentTime - lastObstacleTime > PREFERENCE.NEZUMI_FREQ * 10) {
    gameObjects.obstacles.push(
      new Obstacle(Math.random() * (canvas.width - 30), -30)
    );
    lastObstacleTime = currentTime;
  }
  if (currentTime - lastItemTime > PREFERENCE.SAKANA_FREQ * 10) {
    gameObjects.items.push(new Item(Math.random() * (canvas.width - 20), -20));
    lastItemTime = currentTime;
  }
};

const showOpeningScreen = () => {
  // キャンバス内に配置するため、positioning を変更
  openingOverlay.style.position = "absolute";
  openingOverlay.style.zIndex = "10";
  openingOverlay.style.display = "flex";
  setTimeout(() => {
    openingOverlay.style.opacity = "1";
  }, 50);
};

const showVictoryScreen = () => {
  // キャンバス内に配置するため、positioning を変更
  victoryOverlay.style.position = "absolute";
  victoryOverlay.style.zIndex = "10";
  victoryOverlay.style.display = "flex";
  setTimeout(() => {
    victoryOverlay.style.opacity = "1";
  }, 50);
  seplayer(PREFERENCE.SOUND, "success");
};

const showGameoverScreen = () => {
  // キャンバス内に配置するため、positioning を変更
  gameOverOverlay.style.position = "absolute";
  gameOverOverlay.style.zIndex = "10";
  gameOverOverlay.style.display = "flex";
  setTimeout(() => {
    gameOverOverlay.style.opacity = "1";
  }, 50);
};

const gameLoop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  elapsedTime = Date.now() - startTime - stoppedTimeAcc;
  const leftTime = PREFERENCE.TIMER - elapsedTime / 1000;
  timer.textContent = leftTime < 0 ? "0.0" : leftTime.toFixed(1);

  // プレイヤーの移動
  movePlayer(player, keys);

  // ゲームオブジェクトの更新
  player.update();
  player.draw(ctx);
  spawnObjects();
  updateObjects();

  if (gameclear(item_cnt, obs_cnt, leftTime)) {
    showVictoryScreen();
    over = true;
    return;
  }

  if (gameover(item_cnt, obs_cnt, leftTime)) {
    showGameoverScreen();
    over = true;
    return;
  }

  if (PREFERENCE.ON_TIMER && leftTime <= 0) {
    if (timeover(item_cnt, obs_cnt)) {
      showVictoryScreen();
    } else {
      showGameoverScreen();
    }
    over = true;
    return;
  }

  if (tmpstop) {
    return;
  }

  requestAnimationFrame(gameLoop);
};

const main = () => {
  if (opening) {
    opening = false;
    init();
    gameLoop();
  }
  if (over) {
    init();
    gameLoop();
  }
};

document.querySelectorAll(".play").forEach((e) => {
  e.addEventListener("click", () => {
    main();
  });
});

showOpeningScreen();
