const TEXT_X_OFFSET = 10;
const TEXT_Y_OFFSET = 24;

spriteLookup = {
  'pc': { x: 4, y: 0, char: '@', color: 'white' },//{x: 35, y: 14},
  'npc': { x: 12, y: 1, char: 'N', color: 'teal' },
  'floor1': { x: 4, y: 4, char: ' ', color: 'gray' },
  'grass': { x: 5, y: 4, char: '\'', color: 'rgba(0,255,0,0.6)' },
  'floor2': { x: 1, y: 1, char: '.', color: 'gray' },
  'wall': { x: 2, y: 1, char: '#', color: 'gray' },//{x: 1, y: 17},
  'dog': { x: 5, y: 1, char: 'd', color: 'red' },
  'rat': { x: 6, y: 1, char: 'r', color: 'red' },
  'snake': { x: 4, y: 1, char: 's', color: 'red' },
  'crab': { x: 12, y: 0, char: 'c', color: 'red' },
  'beholder': { x: 13, y: 0, char: 'B', color: 'red' },
  'dead': { x: 9, y: 7, char: '%', color: 'white' },
  'tp': { x: 1, y: 8, char: '~', color: 'rgba(255,0,255,1.0)' },
  'stairsDown': { x: 4, y: 3, char: '>', color: 'white' },
  'stairsUp': { x: 5, y: 3, char: '<', color: 'white' },
  'coin': { x: 8, y: 5, char: '$', color: 'yellow' },
  'ring': { x: 9, y: 5, char: '!', color: 'white' },
  'heal': { x: 4, y: 8, char: 'H', color: 'white' },
  'explosion': { x: 3, y: 8, char: 'E', color: 'white' },
  'zap': { x: 2, y: 8, char: 'Z', color: 'white' },
  /* walls */
  'wall-topleft': { x: 0, y: 0, char: '#', color: 'gray' },
  'wall-top': { x: 1, y: 0, char: '#', color: 'gray' },
  'wall-topright': { x: 3, y: 0, char: '#', color: 'gray' },
  'wall-left': { x: 0, y: 1, char: '#', color: 'gray' },
  'wall-right': { x: 3, y: 1, char: '#', color: 'gray' },
  'wall-bottomleft': { x: 0, y: 2, char: '#', color: 'gray' },
  'wall-bottomright': { x: 3, y: 2, char: '#', color: 'gray' },
  'wall-bottom': { x: 1, y: 0, char: '#', color: 'gray' },
  'exit': { x: 4, y: 2, char: '<', color: 'orange' },
  /* weapons */
  'sword': { x: 6, y: 4, char: 'S', color: 'white' },
  /* items */
  'potion': { x: 7, y: 8, char: '!', color: 'magenta' },
};

const spriteMap = {
  'pc': { char: '@', color: 'yellow' },
  'npc': { char: 'N', color: 'teal' },
  'crab': { char: 'c', color: 'red' },
  'dog': { char: 'd', color: 'red' },
  'rat': { char: 'r', color: 'red' },
  'snake': { char: 's', color: 'red' },
  'beholder': { char: 'B', color: 'red' },
};

function setupCanvas() {
  canvas = document.querySelector("canvas");
  ctx = canvas.getContext("2d");

  canvas.width = tileSize * (numTiles + uiWidth);
  canvas.height = tileSize * numTiles;
  canvas.style.width = canvas.width + "px";
  canvas.style.height = canvas.height + "px";
  ctx.imageSmoothingEnabled = false;
}

function initSounds() {
  sounds = {
    hit1: new Audio('sounds/SFX_-_hit_basic_03.ogg'),
    hit2: new Audio('sounds/SFX_-_hit_basic_05.ogg'),
    treasure: new Audio('sounds/SFX_-_coin_01.ogg'),
    ring: new Audio('sounds/SFX_-_coins_multiple_04.ogg'),
    newLevel: new Audio('sounds/SFX_-_positive_01.ogg'),
    spell: new Audio('sounds/SFX_-_magic_spell_01.ogg'),
  };
}

function playSound(sound) {
  sounds[sound].currentTime = 0;
  sounds[sound].play();
}

function drawSprite(sprite, x, y) {
  if (!asciiMode) {
    ctx.drawImage(
      spritesheet,
      spriteLookup[sprite].x * 8,//sprite * 16,
      spriteLookup[sprite].y * 8, //0,
      8,
      8,
      x * tileSize + shakeX,
      y * tileSize + shakeY,
      tileSize,
      tileSize
    );
  } else {
    drawTextExact(spriteLookup[sprite].char, 24, false, x * tileSize + shakeX + TEXT_X_OFFSET, y * tileSize + shakeY + TEXT_Y_OFFSET, spriteLookup[sprite].color);
  }
}

function drawSpriteExact(sprite, x, y) {
  if (!asciiMode) {
    ctx.drawImage(
      spritesheet,
      spriteLookup[sprite].x * 8,//sprite * 16,
      spriteLookup[sprite].y * 8, //0,
      8,
      8,
      x + shakeX,
      y + shakeY,
      tileSize,
      tileSize
    );
  } else {
    drawTextExact(spriteLookup[sprite].char, 24, false, x + shakeX + TEXT_X_OFFSET, y + shakeY + TEXT_Y_OFFSET, spriteLookup[sprite].color);
  }
}

function screenshake() {
  if (shakeAmount) {
    shakeAmount--;
  }

  let shakeAngle = Math.random() * Math.PI * 2;
  shakeX = Math.round(Math.cos(shakeAngle) * shakeAmount);
  shakeY = Math.round(Math.sin(shakeAngle) * shakeAmount);
}

function draw() {
  if (gameState == STATES.running || gameState == STATES.dead || gameState == STATES.dialogue) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    screenshake();

    for (let i = 0; i < numTiles; i++) {
      for (let j = 0; j < numTiles; j++) {
        getTile(i, j).draw();
      }
    }

    for (let i = 0; i < monsters.length; i++) {
      monsters[i].draw();
    }

    for (let i = 0; i < npcs.length; i++) {
      npcs[i].draw();
    }

    player.draw();

    // UI
    if (player.ring)
      drawText("Level: " + upLevel, 30, false, 40, "#ccc");
    else
      drawText("Level: " + level, 30, false, 40, "#ccc");

    drawText("Score: " + score, 30, false, 70, "#ccc");

    drawText("Weapon", 18, false, 100, "aqua");
    ctx.beginPath();
    textX = canvas.width - uiWidth * tileSize + 32;
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ccc";
    ctx.rect(textX, 110, tileSize + 12, tileSize + 12);
    ctx.stroke();
    ctx.closePath();
    drawSpriteExact('sword', textX + 6, 116);

    drawTextExact("Item", 18, false, canvas.width - 120, 100, "aqua");
    ctx.beginPath();
    textX = canvas.width - uiWidth * tileSize + 134;
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ccc";
    ctx.rect(textX, 110, tileSize + 12, tileSize + 12);
    ctx.stroke();
    ctx.closePath();

    if (player.potion > 0) {
      // key
      drawTextExact('(q)', 14, false, textX + tileSize + 16, 116 + tileSize + 2, "white");
      // ctx.beginPath();
      // ctx.fillStyle = 'rgba(0,0,0,0.75)';
      // ctx.fillRect(textX+tileSize+5,116+tileSize, 22, 22);
      drawSpriteExact('potion', textX + 6, 116);
      // drawTextExact("q", 18, false, textX+tileSize+11, 116+tileSize+15, "aqua");
      // ctx.closePath();

      // amt
      drawTextExact(`x${player.potion}`, 14, false, textX + tileSize + 16, 116, "white");
    }


    drawText("Spells", 18, false, 200, "aqua");
    for (let i = 0; i < player.spells.length; i++) {
      let spellText = (i + 1) + ") " + (player.spells[i] || "");
      // drawText(spellText, 20, false, 110 + i * 40, "aqua");
      drawText(spellText, 14, false, 220 + i * 20, "aqua");
    }

    if (gameState == STATES.dialogue) {
      if (player.ring)
        showRingMessage();
      else
        if (player.dialogueTitle)
          showDialogue(player.dialogueTitle, player.dialogue);
        else
          showDialogue("TEST", "test");
    }
  }
}

function tick() {
  // console.log(player.ring);
  for (let k = monsters.length - 1; k >= 0; k--) {
    if (!monsters[k].dead) {
      monsters[k].update();
    } else {
      monsters.splice(k, 1);
    }
  }

  for (let k = npcs.length - 1; k >= 0; k--) {
    if (!npcs[k].dead) {
      npcs[k].update();
    } else {
      npcs.splice(k, 1);
    }
  }

  player.update();

  if (player.dead) {
    addScore(score, false);
    gameState = STATES.dead;
    player.ring = false;
  }

  // spawnCounter--;
  // if (spawnCounter <= 0) {
  //   spawnMonster();
  //   spawnCounter = spawnRate;
  //   spawnRate--;
  // }
}

// abstract this to accept a paragraph
function showWin() {
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let msg = ["You escaped with the Ring of Crendor!", "You use it to buy a dented lute."];
  drawText(msg[0], 24, true, 100, "white");
  drawText(msg[1], 24, true, 140, "white");
}
function showRingMessage() {
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let msg = ["You got the Ring of Crendor!", "Now bring it back to the Pawn Shop of Necromatic Intent!"];
  drawText(msg[0], 24, true, 100, "white");
  drawText(msg[1], 24, true, 140, "white");
}
function showDialogue(title, message) {
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // gameState = STATES.title;

  drawText(title, 24, true, canvas.height / 2 - 60, "white");
  drawText(message, 18, true, canvas.height / 2 - 40, "white");
}

function showTitle() {
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawText('><~=fishyRL=>', 40, true, 60, "white");
  if (gameState == STATES.dead) {
    drawText("You died again you ponce.", 24, true, 100, "white");
  } else {
    let msg = ["Go forth and find the infamous Ring of Crendor!", "It's sparkly majesty calls to the deep depths", "of your cold, dead heart,", "yearning to be pawned for a fiver"];
    drawText(msg[0], 24, true, 100, "white");
    drawText(msg[1], 24, true, 140, "white");
    drawText(msg[2], 24, true, 180, "white");
    drawText(msg[3], 24, true, 220, "white");
  }

  gameState = STATES.title;
  drawScores();
}

function startGame() {
  level = 1;
  score = 0;
  numSpells = 9;//1;
  startLevel(startingHP);
  gameState = STATES.running;
}

function startLevel(playerHP, playerSpells) {
  spawnRate = 15;
  spawnCounter = spawnRate;
  generateLevel();

  let ring = false;
  let numPotions = 0;
  if (typeof player != "undefined") {
    ring = player.ring;
    numPotions = player.potion;
  }
  player = new Player(randomPassableTile(), ring);
  player.hp = playerHP;
  player.maxHP = player.hp;
  player.potion = numPotions;

  if (playerSpells)
    player.spells = playerSpells;

  if (level < numLevels || (player.ring && upLevel < numLevels))
    randomPassableTile().replace(Exit);
}

function drawText(text, size, centered, textY, color) {
  ctx.fillStyle = color;
  ctx.font = size + "px monospace";
  let textX;
  if (centered) {
    textX = (canvas.width - ctx.measureText(text).width) / 2;
  } else {
    textX = canvas.width - uiWidth * tileSize + 25;
  }

  ctx.fillText(text, textX, textY);
}
function drawTextExact(text, size, centered, textX, textY, color) {
  ctx.fillStyle = color;
  ctx.font = size + "px monospace";
  ctx.fillText(text, textX, textY);
}

function getScores() {
  if (localStorage["scores"]) {
    return JSON.parse(localStorage["scores"]);
  } else {
    return [];
  }
}

function addScore(score, won) {
  let scores = getScores();
  let scoreObject = { score: score, run: 1, totalScore: score, active: won };
  let lastScore = scores.pop();

  if (lastScore) {
    if (lastScore.active) {
      scoreObject.run = lastScore.run + 1;
      scoreObject.totalScore += lastScore.totalScore;
    } else {
      scores.push(lastScore);
    }
  }
  scores.push(scoreObject);

  localStorage["scores"] = JSON.stringify(scores);
}

function drawScores() {
  let scores = getScores();
  if (scores.length) {
    drawText(
      rightPad(["RUN", "SCORE", "TOTAL"]),
      18,
      true,
      canvas.height / 2,
      "white"
    );

    let newestScore = scores.pop();
    scores.sort(function (a, b) {
      return b.totalScore - a.totalScore;
    });
    scores.unshift(newestScore);

    for (let i = 0; i < Math.min(10, scores.length); i++) {
      let scoreText = rightPad([scores[i].run, scores[i].score, scores[i].totalScore]);
      drawText(
        scoreText,
        18,
        true,
        canvas.height / 2 + 24 + i * 24,
        i == 0 ? "aqua" : "violet"
      );
    }
  }
}