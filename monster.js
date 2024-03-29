function drawHealthBar(x, y, w, h, perc, col) {
  let _x = x * tileSize;// + shakeX;
  let _y = y * tileSize + tileSize - 4;// + shakeY + tileSize - 4;
  let _w = (tileSize - 4) * perc;

  // outer bar
  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(_x, _y, tileSize, 6);
  ctx.closePath();

  // inner bar
  ctx.beginPath();
  ctx.fillStyle = "rgba(0,255,0,0.8)";
  if (col)
    ctx.fillStyle = col;
  ctx.fillRect(_x + 2, _y + 2, _w, 2);
  ctx.closePath();
}

// block is a monster?

class Monster {
  constructor(tile, sprite, hp) {
    this.move(tile);
    this.sprite = sprite;
    this.hp = hp;
    this.maxHP = hp;
    this.teleportCounter = 2;
    this.offsetX = 0;
    this.offsetY = 0;
    this.lastMove = [-1, 0];
    this.bonusAttack = 0;
  }

  heal(amt) {
    this.hp = Math.min(this.maxHP, this.hp + amt);
  }

  update() {
    this.teleportCounter--;
    if (this.stunned || this.teleportCounter > 0) {
      this.stunned = false;
      return;
    }
    this.doStuff();
  }

  doStuff() {
    let neighbors = this.tile.getAdjacentPassableNeighbors();

    neighbors = neighbors.filter(t => !t.monster || t.monster.isPlayer);

    if (neighbors.length) {
      neighbors.sort((a, b) => a.dist(player.tile) - b.dist(player.tile));
      let newTile = neighbors[0];
      this.tryMove(newTile.x - this.tile.x, newTile.y - this.tile.y);
    }
  }

  draw() {
    if (this.teleportCounter > 0)
      drawSprite('tp', this.getDisplayX(), this.getDisplayY());
    else {
      drawSprite(this.sprite, this.getDisplayX(), this.getDisplayY());
      if (!this.dead && !this.isNPC) {
        this.drawHP();
        if (this.confuseTimer !== undefined && this.confuseTimer > 0)
          this.drawEffect();
      }
    }

    this.offsetX -= Math.sign(this.offsetX) * (1 / 8);
    this.offsetY -= Math.sign(this.offsetY) * (1 / 8);
  }

  drawHP() {
    let percHealth = this.hp / this.maxHP;

    let i = 0;
    drawHealthBar(
      this.getDisplayX() + (i % 3) * (5 / 16),
      this.getDisplayY() - Math.floor(i / 3) * (5 / 16),
      100, 24,
      percHealth
    );
  }

  drawEffect() {
    if (this.confuseTimer !== undefined) {
      let percEffect = this.confuseTimer / 10;

      let i = 0;
      drawHealthBar(
        this.getDisplayX() + (i % 3) * (5 / 16),
        (this.getDisplayY() - Math.floor(i / 3) * (5 / 16)) - (1 / 8),
        100, 24,
        percEffect,
        "rgba(255,0,0,0.8)"
      );
    }
  }


  tryMove(dx, dy) {
    let newTile = this.tile.getNeighbor(dx, dy);

    if (newTile.passable) {
      this.lastMove = [dx, dy];
      if (!newTile.monster) {
        this.move(newTile);
      } else {
        if (this.isPlayer != newTile.monster.isPlayer && !newTile.monster.isNPC && !this.isNPC) {
          this.attackedThisTurn = true;
          newTile.monster.stunned = true;

          newTile.monster.hit(1 + this.bonusAttack);

          shakeAmount = 5;

          this.offsetX = (newTile.x - this.tile.x) / 2;
          this.offsetY = (newTile.y - this.tile.y) / 2;
        } else if (newTile.monster.isNPC) { // chat!
          shakeAmount = 5;
          this.offsetX = (newTile.x - this.tile.x) / 2;
          this.offsetY = (newTile.y - this.tile.y) / 2;

          newTile.monster.chat();
          gameState = STATES.dialogue;
        }
      }
      return true;
    }
  }

  hit(dmg) {
    if (this.shield > 0)
      return;

    this.hp -= dmg;
    if (this.hp <= 0) {
      this.die();
    }

    if (this.isPlayer) {
      playSound('hit1');
    } else {
      playSound('hit2');
    }
  }

  die() {
    this.dead = true;
    this.tile.monster = null;

    this.sprite = 'dead';

    if (!this.isPlayer) {
      score += this.maxHP;
    }
  }

  getDisplayX() {
    return this.tile.x + this.offsetX;
  }
  getDisplayY() {
    return this.tile.y + this.offsetY;
  }

  move(tile) {
    if (this.tile) {
      this.tile.monster = null;
      this.offsetX = this.tile.x - tile.x;
      this.offsetY = this.tile.y - tile.y;
    }

    this.tile = tile;
    tile.monster = this;
    tile.stepOn(this);
  }
}

class NPC extends Monster {
  constructor(tile, name, dialogue, dialogueRandom = true) {
    super(tile, 'npc', -1);
    this.isNPC = true;
    this.teleportCounter = 0;
    this.name = name;
    this.dialogue = dialogue;
    this.dialogueIndex = 0;
    this.dialogueRandom = dialogueRandom;
  }

  doStuff() {
    let neighbors = this.tile.getAdjacentPassableNeighbors();
    if (neighbors.length) {
      this.tryMove(neighbors[0].x - this.tile.x, neighbors[0].y - this.tile.y);
    }
  }

  chat() {
    player.dialogueTitle = this.name;

    // grab a random index
    if (this.dialogueRandom) this.dialogueIndex = randomRange(0, this.dialogue.length - 1);

    if (!asciiMode)
      player.dialogue = this.dialogue[this.dialogueIndex];
    else
      player.dialogue = "WHAT HAVE YOU DONE!?!?!?!";
    showDialogue(player.dialogueTitle, player.dialogue);

    // if this is an ordered conversation...
    if (!this.dialogueRandom) {
      this.dialogueIndex++;
      if (this.dialogueIndex >= this.dialogue.length)
        this.dialogueIndex = 0;
    }
  }
}

class Player extends Monster {
  constructor(tile, ring) {
    super(tile, 'pc', 100);//3);
    this.isPlayer = true;
    this.teleportCounter = 0;
    this.spells = shuffle(Object.keys(spells).filter(k => !k.includes("ENEMY"))).splice(0, numSpells);
    this.ring = ring;
    this.potion = 0;

    if (currentExitPosition !== undefined)
      this.exitPosition = currentExitPosition;
  }

  update() {
    this.shield--;

    if (this.confuseTimer !== undefined && this.confuseTimer > 0)
      this.confuseTimer--;
  }

  addSpell() {
    let newSpell = shuffle(Object.keys(spells))[0];
    this.spells.push(newSpell);
  }

  castRing() {

  }

  usePotion() {
    if (player.potion > 0) {
      player.heal(10);
      player.potion--;
      playSound("spell");
    }
  }

  castSpell(index) {
    let spellName = this.spells[index];
    if (spellName) {
      // delete this.spells[index];
      this.spells.splice(index, 1);
      spells[spellName]();
      playSound("spell");
      tick();
    }
  }

  wait() {
    this.heal(0.5);
    tick();
  }

  tryMove(dx, dy) {
    if (super.tryMove(dx, dy)) {
      tick();
    }
  }
}

/* Traps */
class Barrel extends Monster {
  constructor(tile) {
    super(tile, 'barrel', randomRange(5, 15));
  }

  explode() {
    spells['ENEMY_CROSS'](this);
    playSound("spell");
    console.log('KABOOM');
    this.die();
    // tick();
  }

  doStuff() {
    if (this.teleportCounter <= 0) {
      this.hp--;
      if (this.hp <= 0) this.explode();
    }
  }
  tryMove() { ; }
  hit() {
    this.hp = 1;
  }
}
class BarrelX extends Monster {
  constructor(tile) {
    super(tile, 'barrelx', randomRange(5, 15));
  }

  explode() {
    spells['ENEMY_EX'](this);
    playSound("spell");
    console.log('KABOOM');
    this.die();
    // tick();
  }

  doStuff() {
    if (this.teleportCounter <= 0) {
      this.hp--;
      if (this.hp <= 0) this.explode();
    }
  }
  tryMove() { ; }
  hit() {
    this.hp = 1;
  }
}

/* Enemies */
class Dog extends Monster {
  constructor(tile) {
    super(tile, 'dog', 3);
  }
}
class Rat extends Monster {
  constructor(tile) {
    super(tile, 'rat', 2);
  }

  doStuff() {
    let neighbors = this.tile.getAdjacentNeighbors().filter(t => !t.passable && inBounds(t.x, t.y));

    if (neighbors.length) {
      neighbors[0].replace(Floor);
      this.heal(0.5);
    } else {
      super.doStuff();
    }
  }
}
class Crab extends Monster {
  constructor(tile) {
    super(tile, 'crab', 2);
  }

  update() {
    let startStunned = this.stunned;
    super.update();
    if (!startStunned)
      this.stunned = true;
  }
}
class Snake extends Monster {
  constructor(tile) {
    super(tile, 'snake', 3);
  }

  doStuff() {
    this.attackedThisTurn = false;
    super.doStuff();

    if (!this.attackedThisTurn)
      super.doStuff();
  }
}
class Beholder extends Monster {
  constructor(tile) {
    super(tile, 'beholder', 3);
  }

  doStuff() {
    let neighbors = this.tile.getAdjacentPassableNeighbors();
    if (neighbors.length) {
      this.tryMove(neighbors[0].x - this.tile.x, neighbors[0].y - this.tile.y);
    }
  }
}