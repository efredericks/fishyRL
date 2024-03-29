/* 18x18 array
X	- x pattern
+	- cross pattern
*	- aoe confuse
?	- convert to ascii
"	- aoe fire
' - grass
>	- stairs down
# - wall
*/

let _dungeonPrefabs = {
  'randoms': [
    // [
    //   "##################", // template
    //   "#                #",
    //   "#                #",
    //   "#                #",
    //   "#                #",
    //   "#                #",
    //   "#                #",
    //   "#                #",
    //   "#                #",
    //   "#                #",
    //   "#                #",
    //   "#                #",
    //   "#                #",
    //   "#                #",
    //   "#                #",
    //   "#                #",
    //   "#                #",
    //   "##################",
    // ],
    [
      "##################", // 1
      "#                #",
      "# +            + #",
      "#                #",
      "#                #",
      "#                #",
      "#                #",
      "#                #",
      "#       XX       #",
      "#       XX       #",
      "#       >        #",
      "#                #",
      "#                #",
      "#                #",
      "#                #",
      "# +            + #",
      "#                #",
      "##################",
    ],
    [
      "##################", // 3
      "#? ? ? ?X? ? ? ? #",
      "# ? ? ? ?X? ? ? ?#",
      "#? ? ? ?X? ? ? ? #",
      "# ? ? ? ?X? ? ? ?#",
      "#? ? ? ?X? ? ? ? #",
      "# ? ? ? ?X? ? ? ?#",
      "#? ? ? ?X?>? ? ? #",
      "# ? ? ?>?X? ? ? ?#",
      "#? ? ? ?X? ? ? ? #",
      "# ? ? ? ?X? ? ? ?#",
      "#? ? ? ?X? ? ? ? #",
      "# ? ? ? ?X? ? ? ?#",
      "#? ? ? ?X? ? ? ? #",
      "# ? ? ? ?X? ? ? ?#",
      "#? ? ? ?X? ? ? ? #",
      "# ? ? ? ?X? ? ? ?#",
      "##################",
    ],
    [
      "##################", // 4
      "#       ++       #",
      "#                #",
      "#  *          *  #",
      "#                #",
      "#                #",
      "#                #",
      "#        >       #",
      "#+      **      +#",
      "#+      **      +#",
      "#       >        #",
      "#                #",
      "#                #",
      "#                #",
      "#  *          *  #",
      "#                #",
      "#       ++       #",
      "##################",
    ],
    [
      "##################", // template
      "#''''''''''''''''#",
      "#'############+#'#",
      "#'#''''''''''''#'#",
      "#'#''''''''''''#'#",
      "#'#X############'#",
      "#'#''''''''''''#'#",
      "#'############X#'#",
      "#'#''''''''''''#'#",
      "#'#''''''''''''#'#",
      "#'#X############'#",
      "#'#''''''''''''#'#",
      "#'############X#'#",
      "#'#''''''''''''#'#",
      "#'#''''''''''''#'#",
      "#'############+#'#",
      "#'''''''''''''''>#",
      "##################",
    ],
    [
      "##################", // explodey room
      "#''''''''''''''''#",
      "#'X            +'#",
      "#' X          + '#",
      "#'  X        +  '#",
      "#'   X      +   '#",
      "#'    X    +    '#",
      "#'     X>>+     '#",
      "#'      X+      '#",
      "#'      +X      '#",
      "#'     +>>X     '#",
      "#'    +    X    '#",
      "#'   +      X   '#",
      "#'  +        X  '#",
      "#' +          X '#",
      "#'+            X'#",
      "#''''''''''''''''#",
      "##################",
    ],
    [
      "##################",
      "#                #",
      "#                #",
      "#                #",
      "#                #",
      "#                #",
      "#                #",
      "#                #",
      "#                #",
      "#                #",
      "#      ====      #",
      "#      =>>=      #",
      "#      ====      #",
      "#                #",
      "#                #",
      "#                #",
      "#                #",
      "#                #",
      "#                #",
      "#                #",
      "#                #",
      "##################",
    ],
  ],
};

function generateLevel() {
  monsters = [];

  tryTo('generate map', function () {
    return generateTiles() == randomPassableTile().getConnectedTiles().length;
  });

  // if (level === 1)
  //   randomPassableTile().replace(ConfuseTrap);

  generateMonsters();
  generateNPCs();

  for (let i = 0; i < 2; i++) {
    randomPassableTile().potion = true;
  }

  for (let i = 0; i < 3; i++) {
    randomPassableTile().treasure = true;
  }

  if (level == numLevels)
    randomPassableTile().ring = true;
}

function generateTiles() {
  tiles = [];
  let passableTiles = 0;

  // let _d = shuffle(_dungeonPrefabs.randoms)[0];
  let _d = _dungeonPrefabs.randoms[_dungeonPrefabs.randoms.length - 1];

  for (let i = 0; i < numTiles; i++) {
    tiles[i] = [];
    for (let j = 0; j < numTiles; j++) {

      if (level == 1) {
        if (!inBounds(i, j)) {
          tiles[i][j] = new Wall(i, j);
        } else {
          switch (_d[j][i]) { // backwards for visibility in defining the obj
            case ">":
              tiles[i][j] = new Exit(i, j);
              break;
            case "=":
              tiles[i][j] = new ClosedDoor(i, j);
              break;
            case "-":
              tiles[i][j] = new OpenDoor(i, j);
              break;
            case "X":
              tiles[i][j] = new Floor(i, j);
              spawnBarrel(BarrelX, i, j);
              break;
            case "+":
              tiles[i][j] = new Floor(i, j);
              spawnBarrel(Barrel, i, j);
              break;
            case "*":
              tiles[i][j] = new ConfuseTrap(i, j);
              break;
            case "#":
              tiles[i][j] = new Wall(i, j);
              passableTiles--; // need this otherwise the values don't match
              break;
            case "'":
              tiles[i][j] = new Floor(i, j, 'grass');
              break;
            case "?":
            case "\"":
              tiles[i][j] = new AsciiTrap(i, j);
              break;
            default:
              tiles[i][j] = new Floor(i, j);
          }
          passableTiles++;
        }

        // if (!inBounds(i, j)) {
        //   tiles[i][j] = new Wall(i, j);
        // } else {
        //   tiles[i][j] = new Floor(i, j);
        //   passableTiles++;
        // }

      } else if (level == 2) { // trap demo
        if (!inBounds(i, j)) {
          tiles[i][j] = new Wall(i, j);
        } else {
          tiles[i][j] = new Floor(i, j);
          passableTiles++;
        }
      } else {
        if (Math.random() < 0.3 || !inBounds(i, j)) {
          tiles[i][j] = new Wall(i, j);
        } else {
          tiles[i][j] = new Floor(i, j);
          passableTiles++;
        }
      }
    }
  }

  randomPassableTile().replace(AsciiTrap);

  return passableTiles;
}

function inBounds(x, y) {
  return x > 0 && y > 0 && x < numTiles - 1 && y < numTiles - 1;
}

function getTile(x, y) {
  if (inBounds(x, y))
    return tiles[x][y];
  else
    return new Wall(x, y);
}

function randomPassableTile() {
  let tile;
  tryTo('get random passable tile', function () {
    let x = randomRange(0, numTiles - 1);
    let y = randomRange(0, numTiles - 1);
    tile = getTile(x, y);
    return tile.passable && !tile.monster;
  });
  return tile;
}

function generateMonsters() {
  let numMonsters = level + 1;
  for (let i = 0; i < numMonsters; i++) {
    spawnMonster();
  }

  if (level == 1) {
    ;
    // spawnBarrel(Barrel);
  } else if (level == 2) { // cross trap
    spawnBarrel(BarrelX, 2, 2);
    spawnBarrel(BarrelX, numTiles - 3, numTiles - 3);
    spawnBarrel(BarrelX, 2, numTiles - 3);
    spawnBarrel(BarrelX, numTiles - 3, 2);
  } else {
    for (let i = 0; i < numMonsters; i++)
      spawnBarrel();
  }
}

const NPCChatter = {
  'tut': [
    "Welcome to the Dungeon!",
    "It's pretty exciting seeing another person here, not much has been going on.",
    "There's a macguffin of sorts at the bottom here, but I'd avoid it if I were you.",
    "Oh heavens no, not cursed.  Just something to avoid I've heard.",
    "I've not gone to see it, no.  Too many sneks and crabs. I'm allergic, you see.",
  ],
  'random': [
    "Hey, have you seen that new weapon? It's so shiny!",
    "I heard there's a hidden treasure on at the bottom. Anyone brave enough to find it?",
    "Did you hear about the goblin invasion? They're causing chaos in the dungeon!",
    "I can't believe I've been stuck in this dungeon for days. I miss the sunlight.",
    "Be careful! I've heard there are deadly traps waiting for unsuspecting adventurers.",
    "I found a healing potion earlier. Too bad I didn't need it.",
    "I lost my lucky charm somewhere in this dungeon. If you find it, I'll give you a reward!",
    "You look strong! Maybe you'll be the one to finally break out of here.",
    "I heard a rumor that the walls in this dungeon can talk. Creepy, right?",
    "I found an enchanted sword yesterday. It made me feel invincible!",
    "I'm tired of fighting monsters. I just want to find the exit and go home.",
  ],
}

function getRandomChatter() {
  let ret = [];
  for (let _ = 0; _ < 5; _++) {
    ret.push(shuffle(NPCChatter.random)[0]);
  }
  return ret;
}

function generateNPCs() {
  npc_names = ["Yaz", "Lord Dag", "Wobb", "Anne who was a Ghost", "Big J", "The Murph"];
  npcs = [];
  if (level == 1) {
    npcs.push(new NPC(randomPassableTile(), shuffle(npc_names)[0], NPCChatter.tut, dialogueRandom=false));//["Look to my dungeon and despair!", "I'm so bored"]));
    npcs.push(new NPC(randomPassableTile(), shuffle(npc_names)[0], getRandomChatter()));//["Look to my dungeon and despair!", "I'm so bored"]));
  } if (level == 2)
    npcs.push(new NPC(randomPassableTile(), shuffle(npc_names)[0], getRandomChatter()));//["Look to my dungeon and despair!", "I'm so bored"]));
}

function spawnMonster() {
  let monsterType = shuffle([Dog, Rat, Crab, Beholder, Snake])[0];
  let monster = new monsterType(randomPassableTile());
  monsters.push(monster);
}

function spawnBarrel(t, i, j) {
  let monsterType = shuffle([Barrel, BarrelX])[0];
  if (t !== undefined)
    monsterType = t;

  if (i === undefined && j === undefined)
    monsters.push(new monsterType(randomPassableTile()));
  else
    monsters.push(new monsterType(getTile(i, j)));
}