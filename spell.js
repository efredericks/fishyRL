spells = {
  BLINK: function () {
    player.move(randomPassableTile());
  },

  QUAKE: function () {
    for (let i = 0; i < numTiles; i++) {
      for (let j = 0; j < numTiles; j++) {
        let tile = getTile(i, j);
        if (tile.monster && !tile.monster.isNPC) {
          let numWalls = 4 - tile.getAdjacentPassableNeighbors().length;
          tile.monster.hit(numWalls * 2);
        }
      }
    }
  },

  MAELSTROM: function () {
    for (let i = 0; i < monsters.length; i++) {
      monsters[i].move(randomPassableTile());
      monsters[i].teleportCounter = 2;
    }
  },

  MULLIGAN: function () {
    startLevel(1, player.spells);
  },

  AURA: function () {
    player.tile.getAdjacentNeighbors().forEach(function (t) {
      t.setEffect('heal');
      if (t.monster) {
        t.monster.heal(1);
      }
    });
    player.tile.setEffect('heal');
    player.heal(1);
  },

  DASH: function () {
    let newTile = player.tile;
    while (true) {
      let testTile = newTile.getNeighbor(player.lastMove[0], player.lastMove[1]);
      if (testTile.passable && !testTile.monster) {
        newTile = testTile;
      } else {
        break;
      }
    }
    if (player.tile != newTile) {
      player.move(newTile);
      newTile.getAdjacentNeighbors().forEach(t => {
        if (t.monster) {
          t.setEffect('explosion');
          t.monster.stunned = true;
          t.monster.hit(1);
        }
      });
    }
  },

  DIG: function () {
    for (let i = 1; i < numTiles - 1; i++) {
      for (let j = 1; j < numTiles - 1; j++) {
        let tile = getTile(i, j);
        if (!tile.passable) {
          tile.replace(Floor);
        }
      }
    }
    player.tile.setEffect('heal');
    player.heal(2);
  },

  KINGMAKER: function () {
    for (let i = 0; i < monsters.length; i++) {
      monsters[i].heal(1);
      monsters[i].tile.treasure = true;
    }
  },

  ALCHEMY: function () {
    player.tile.getAdjacentNeighbors().forEach(function (t) {
      if (!t.passable && inBounds(t.x, t.y)) {
        t.replace(Floor).treasure = true;
      }
    });
  },

  POWER: function () {
    player.bonusAttack = 5;
  },

  BUBBLE: function () {
    for (let i = player.spells.length - 1; i > 0; i--) {
      if (!player.spells[i]) {
        player.spells[i] = player.spells[i - 1];
      }
    }
  },

  BRAVERY: function () {
    player.shield = 2;
    for (let i = 0; i < monsters.length; i++) {
      monsters[i].stunned = true;
    }
  },

  BOLT: function () {
    boltTravel(player.lastMove, 'zap', 4);
  },

  ENEMY_CROSS: function (e) {
    let directions = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0]
    ];
    for (let k = 0; k < directions.length; k++) {
      enemyBoltTravel(e, directions[k], 'zap', 2);
    }
  },
  ENEMY_EX: function (e) {
    let directions = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1]
    ];
    for (let k = 0; k < directions.length; k++) {
      enemyBoltTravel(e, directions[k], 'zap', 3);
    }
  },

  CROSS: function () {
    let directions = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0]
    ];
    for (let k = 0; k < directions.length; k++) {
      boltTravel(directions[k], 'zap', 2);
    }
  },

  EX: function () {
    let directions = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1]
    ];
    for (let k = 0; k < directions.length; k++) {
      boltTravel(directions[k], 'zap', 3);
    }
  }
};

// player bolt
function boltTravel(direction, effect, damage) {
  let newTile = player.tile;
  while (true) {
    let testTile = newTile.getNeighbor(direction[0], direction[1]);
    if (testTile.passable) {
      newTile = testTile;
      if (newTile.monster) {
        newTile.monster.hit(damage);
      }
      newTile.setEffect(effect);
    } else {
      break;
    }
  }
}

// enemy bolt
function enemyBoltTravel(enemy, direction, effect, damage) {
  let newTile = enemy.tile;
  while (true) {
    let testTile = newTile.getNeighbor(direction[0], direction[1]);
    if (testTile.passable) {
      newTile = testTile;
      if (newTile.monster){//} && newTile.monster.isPlayer) {
        newTile.monster.hit(500);//damage);
      }
      newTile.setEffect(effect);
    } else {
      break;
    }
  }
}