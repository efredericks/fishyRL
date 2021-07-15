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

    if (this.treasure)
      drawSprite('coin', this.x, this.y);

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
  constructor(x, y) {
    super(x, y, 'floor', true);
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
    }
  }
}

class Wall extends Tile {
  constructor(x, y) {
    super(x, y, 'wall', false);
  }
}

class Exit extends Tile {
  constructor(x, y) {
    super(x, y, 'stairsDown', true);
  }

  stepOn(monster) {
    if (monster.isPlayer) {
      playSound("newLevel");
      if (level == numLevels) {
        addScore(score, true);
        showTitle();
      } else {
        level++;
        startLevel(Math.min(maxHP, player.hp+1));
      }
    }
  }
}