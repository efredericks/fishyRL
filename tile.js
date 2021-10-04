class Tile {
  constructor(x, y, sprite, passable) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.passable = passable;
  }

  replace(newTileType) {
    tiles[this.x][this.y] = new newTileType(this.x, this.y);
    return tiles[this.x][this.y];
  }

  dist(other) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }

  getNeighbor(dx, dy) {
    return getTile(this.x + dx, this.y + dy);
  }

  getAdjacentNeighbors() {
    return shuffle([
      this.getNeighbor(0, -1),
      this.getNeighbor(0, 1),
      this.getNeighbor(-1, 0),
      this.getNeighbor(1, 0)
    ]);
  }

  getAdjacentPassableNeighbors() {
    return this.getAdjacentNeighbors().filter(t => t.passable);
  }

  getConnectedTiles() {
    let connectedTiles = [this];
    let frontier = [this];
    while (frontier.length) {
      let neighbors = frontier.pop()
        .getAdjacentPassableNeighbors()
        .filter(t => !connectedTiles.includes(t));
      connectedTiles = connectedTiles.concat(neighbors);
      frontier = frontier.concat(neighbors);
    }
    return connectedTiles;
  }

  draw() {
    drawSprite(this.sprite, this.x, this.y);

    // TBD - layering?
    if (this.treasure)
      drawSprite('coin', this.x, this.y);
    else if (this.potion)
      drawSprite('potion', this.x, this.y);
    else if (this.ring)
      drawSprite('ring', this.x, this.y);

    if (this.effectCounter) {
      this.effectCounter--;
      ctx.globalAlpha = this.effectCounter / 30;
      drawSprite(this.effect, this.x, this.y);
      ctx.globalAlpha = 1;
    }
  }

  setEffect(effectSprite) {
    this.effect = effectSprite;
    this.effectCounter = 30;
  }
}

class Floor extends Tile {
  constructor(x, y, spr) {
    let _r = Math.random();
    let _t;

    if (typeof spr === 'undefined') {
      _t = 'floor1';
      if (_r > 0.95)
        _t = 'grass';
      else if (_r > 0.45)
        _t = 'floor2'
    } else {
      _t = spr;
    }
    super(x, y, _t, true);
  }

  stepOn(monster) {
    if (monster.isPlayer && this.treasure) {
      score++;

      if (score % 3 == 0 && numSpells < 9) {
        numSpells++;
        player.addSpell();
      }

      playSound("treasure");
      this.treasure = false;
      spawnMonster();
    } else if (monster.isPlayer && this.potion) {
      player.potion++;
      this.potion = false;
      playSound("treasure"); // TBD - new sound

    } else if (monster.isPlayer && this.ring) {
      playSound("ring");
      asciiMode = true;
      this.ring = false;
      score += 100;

      gameState = STATES.dialogue;
      player.ring = true;
      // showDialogue("RING", "GO UP NOW");
      showRingMessage();
      addScore(100, true);
      // showTitle();

      if (level > 1)
        randomPassableTile().replace(Exit);
    }
  }
}

class Wall extends Tile {
  constructor(x, y) {
    let _t = 'wall';
    if (x == 0 && y == 0) // top left
      _t = 'wall-topleft';
    else if (x == 0 && y == numTiles - 1) // bottom left
      _t = 'wall-bottomleft';
    else if (x == 0) // left
      _t = 'wall-left';
    else if (y == 0 && x == numTiles - 1) // top right
      _t = 'wall-topright';
    else if (y == 0) // top
      _t = 'wall-top';
    else if (x == numTiles - 1 && y == numTiles - 1) // bottom right
      _t = 'wall-bottomright';
    else if (x == numTiles - 1) // right
      _t = 'wall-right';
    else if (y == numTiles - 1) // bottom
      _t = 'wall-bottom';
    super(x, y, _t, false);
  }
}

class InnerWall extends Tile {
  constructor(x, y) {
    let _t = 'wall';
    super(x, y, _t, false);
  }
}

class OpenDoor extends Tile {
  constructor(x, y) {
    let _t = 'door-open';
    super(x, y, _t, true);
  }
  stepOn(monster) {}
}
class ClosedDoor extends Tile {
  constructor(x, y) {
    let _t = 'door-closed';
    super(x, y, _t, true);
  }
  stepOn(monster) {
    // if (monster.isPlayer)
      this.replace(OpenDoor);
  }
}

class Exit extends Tile {
  constructor(x, y) {
    currentExitPosition = { x: x, y: y };
    // player.exitPosition = { x: x, y: y };

    if (typeof player === 'undefined') { // first level
      super(x, y, 'stairsDown', true);
    } else {
      if (player.ring)
        if (upLevel == 1)
          super(x, y, 'exit', true);
        else
          super(x, y, 'stairsUp', true);
      else
        if (level == numLevels)
          super(x, y, 'exit', true);
        else
          super(x, y, 'stairsDown', true);
    }
  }

  stepOn(monster) {
    if (monster.isPlayer) {
      playSound("newLevel");
      if (level == numLevels && (this.sprite == "stairsDown" || this.sprite == 'exit')) {
        addScore(score, true);
        showTitle();
      } else {
        level++;
        if (player.ring)
          upLevel--;

        if (upLevel == 0) {
          gameState = STATES.win;
          player.ring = false;
          showWin();
        } else
          startLevel(Math.min(player.maxHP, player.hp + 1));
      }
    }
  }
}

class AsciiTrap extends Tile {
  constructor(x, y) {
    let _r = Math.random();
    let _t = 'asciitile';
    super(x, y, _t, true);
  }

  stepOn(monster) {
    if (monster.isPlayer) {
      playSound("spell");
      asciiMode = !asciiMode;
    }
  }
}

class ConfuseTrap extends Tile {
  constructor(x, y) {
    let _t = 'confusetile';
    super(x, y, _t, true);
  }

  stepOn(monster) {
    // if (monster.isPlayer) {
    playSound("spell");
    // console.log(monster.tile.getAdjacentPassableNeighbors())
    // monster.tile.getAdjacentPassableNeighbors().forEach(function (t) {
    //   if (t.passable && inBounds(t.x, t.y)) {

    if (monster.isPlayer)
      monster.confuseTimer = 10;
    this.replace(Floor);


    // console.log(t.x,t.y);
    // t.confuse = true;
    // t.confuseTimer = 5;
    // t.replace(ConfuseTrap);
    // }
    // });
    // }
  }
}