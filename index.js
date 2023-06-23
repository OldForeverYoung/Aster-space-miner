// Import stylesheets
import './style.css';

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.arcTo(x, y + height, x + radius, y + height, radius);
  ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
  ctx.arcTo(x + width, y, x + width - radius, y, radius);
  ctx.arcTo(x, y, x, y + radius, radius);
  ctx.stroke();
}
const OPTIONS = {
  stopSpawn: 1,
  mathTick: 1,
  draw: 1,
  offMap: 1,
  tickRate: 200,
  console: 0,
};
const CONFIG = {
  SCALE: devicePixelRatio,
  WIDTH: 300,
  HEIGHT: 600,
  interfavePosition: 0, // 0 = vertical, 1 - horizontal
  FPS: 60,
  TICK: 1000 / OPTIONS.tickRate,
  SPAWN: 3000,
  OFFMAPTIMER: 200,
  CHECKAWAIT: 0,
};
const canvas = document.getElementById(`canvas`);
const ctx = canvas.getContext('2d');

ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
canvas.width = CONFIG.WIDTH * CONFIG.SCALE;
canvas.height = CONFIG.HEIGHT * CONFIG.SCALE;
canvas.style.width = `${CONFIG.WIDTH}px`;
canvas.style.height = `${CONFIG.HEIGHT}px`;
ctx.scale(CONFIG.SCALE, CONFIG.SCALE);
/* function windows() {
  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;
  if (WIDTH < HEIGHT) {
    CONFIG.WIDTH = WIDTH;
    CONFIG.HEIGHT = (WIDTH / 9) * 16;
    if (CONFIG.HEIGHT > HEIGHT) {
      CONFIG.HEIGHT = HEIGHT;
      CONFIG.WIDTH = (HEIGHT / 16) * 9;
    }
  }
}
*/
// смотри на миникарту! не будь как я (с)
/**
 * @type {HTMLCanvasElement}
 */

// windows();
console.log(`${CONFIG.WIDTH},${CONFIG.HEIGHT}`);
const BASE = {
  // я переписал формулы для лучшего понимания пропорций
  WIDTH: (CONFIG.WIDTH * 1) / 2,
  HEIGHT: (CONFIG.WIDTH * 1) / 6,
  baseX: CONFIG.WIDTH / 4 - CONFIG.WIDTH / 6,
  baseY: 1,
  voronkaX: 0,
  voronkaY: 0,
  voronkaLenght: 0,
  //нужно переработать дизайн
};
canvas.width = CONFIG.WIDTH; //12
canvas.height = CONFIG.HEIGHT; //24
const DATA = {
  VERSION: 0.1,
  ID: 0, //id в целом
  asteroidId: [], //массив с астероидами
  asteroidResources: {
    id: [],
  },
  asteroidsX: [],
  asteroidsY: [],
  asteroidSpeedX: [],
  asteroidSpeedY: [],
  asteroidMass: [], //масса
  asteroidColor: [], //цвета (рисунки?)
  targetId: NaN, //таргет астероид
  tick: 0, //тик движений для промежуточных расчётов, анимации и прочего (от 0-1 до 200)
  animationTick: 0,
  animationTickState: 0, // 0, -1
  frame: 0,
  point: (CONFIG.WIDTH * 1) / 9,
  store: 0,
  playerDefoultMass: 1,
};
const PLAYER = {
  id: NaN,
  X: CONFIG.WIDTH / 2,
  Y: CONFIG.HEIGHT / 8,
  WIDTH: CONFIG.WIDTH / 60,
  HEIGHT: CONFIG.WIDTH / 60,
  resources: [],
  storage: 0,
  mass: DATA.playerDefoultMass,
  speedX: 0,
  speedY: 0,
  power: 0.1,
  fuel: 100,
  maxFuel: 100,
  POLEGRAB: CONFIG.WIDTH / 20,
  COLOR: `rgb(255,0,0)`,
  GRAB: 0, // 0 - нет цели, 1 - есть цель, 2 - цель захвачена
};
const INTERFACE = {
  NAME: [
    `↖`,
    `W`,
    `↗`,
    `E`,
    `A`,
    `stop`,
    `D`,
    `F`,
    `↙`,
    `S`,
    `↘`,
    `Q`,
    `~`,
    `X`,
    `_`,
    `P`,
  ],
  BUTTONX: [
    (CONFIG.WIDTH * 1) / 12,
    (CONFIG.WIDTH * 3) / 12,
    (CONFIG.WIDTH * 5) / 12,
    (CONFIG.WIDTH * 9) / 12,
  ], //butt☺
  BUTTONY: [
    (CONFIG.HEIGHT * 16) / 24,
    (CONFIG.HEIGHT * 18) / 24,
    (CONFIG.HEIGHT * 20) / 24,
    (CONFIG.HEIGHT * 22) / 24,
  ], //line
  ButtonLenght: CONFIG.WIDTH / 6,
};
const RESOURCES = {
  id: [
    1, 2, 3, 7, 8, 10, 12, 13, 14, 16, 18, 22, 24, 26, 28, 29, 30, 47, 50, 54,
    78, 79, 80, 82, 92,
  ],
  name: [
    `H`,
    `He`,
    `Li`,
    `N`,
    `O`,
    `Ne`,
    `Mg`,
    `Al`,
    `Si`,
    `S`,
    `Ar`,
    `Ti`,
    `Cr`,
    `Fe`,
    `Ni`,
    `Cu`,
    `Zn`,
    `Ag`,
    `Sn`,
    `Xe`,
    `Pt`,
    `Au`,
    `Hg`,
    `Pb`,
    `U`,
  ],
  имя: [
    `Водород`,
    `Гелий`,
    `Литий`,
    `Азот`,
    `Кислород`,
    `Неон`,
    `Магний`,
    `Алюминий`,
    `Кремний☺`,
    `Сера`,
    `Аргон`,
    `Титан`,
    `Хром`,
    `Железо`,
    `Никель`,
    `Медь`,
    `Цинк`,
    `Серебро`,
    `Олово`,
    `Ксенон`,
    `Платина`,
    `Золото`,
    `Ртуть`,
    `Уран`,
  ],
  type: [
    0, 0, 2, 0, 0, 0, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2,
  ],
  TYPES: {
    0: `gas`,
    1: `ore`,
    2: `metal`,
    //то что тут полуметаллы - это металлы меня мало колышит) я просто рофлю над кремнием
  },
};
const MOUSE = {
  startX: 0,
  startY: 0,
  speedX: 0,
  speedY: 0,
};
// const tickFixed = CONFIG.TICK.toFixed(5) * 1;
function mathTick() {
  DATA.tick++; //отсчёт пошел
  DATA.animationTick++;
  checkGrab(); // сначала чекаем, потом всё двигаем после проверок
  let ignoreAster = NaN;
  if (DATA.targetId != NaN) {
    ignoreAster = DATA.asteroidId.indexOf(DATA.targetId);

    if (PLAYER.GRAB == 2) {
      DATA.asteroidsX[ignoreAster] = PLAYER.X;
      DATA.asteroidsY[ignoreAster] = PLAYER.Y;
    }
    for (let asteroid = 0; asteroid < DATA.asteroidId.length; asteroid++) {
      if (DATA.GRAB == 2 && asteroid == ignoreAster) {
      } else {
        // короче, ёбнутая формула вышла,
        //     DATA.asteroidSpeedY[asteroid] += (CONFIG.WIDTH * 1) / 80000;
        // ёбнутая формула выше
        DATA.asteroidsX[asteroid] =
          DATA.asteroidsX[asteroid] * 1 + DATA.asteroidSpeedX[asteroid] * 1;
        DATA.asteroidsY[asteroid] =
          DATA.asteroidsY[asteroid] * 1 + DATA.asteroidSpeedY[asteroid] * 1;
      }
    }
  }

  PLAYER.X += PLAYER.speedX;
  PLAYER.Y += PLAYER.speedY;
  if (DATA.tick >= 200) {
    //ну, вдруг
    DATA.tick = 0;
  }

  if (DATA.tick == 0 && DATA.animationTickState == -1) {
    DATA.animationTickState = 0;
  } else if (DATA.tick == 0 && DATA.animationTickState == 0) {
    DATA.animationTickState = -1;
  }
}
function checkGrab() {
  let targets = 0; // что бы понимать точно, есть ли цели в зоне вне зависимости от наличии зацепа
  if (PLAYER.GRAB == 0 || PLAYER.GRAB == 1) {
    PLAYER.mass = DATA.playerDefoultMass;
    for (let asteroid = 0; asteroid < DATA.asteroidId.length; asteroid++) {
      if (
        PLAYER.X - PLAYER.WIDTH / 2 - PLAYER.POLEGRAB <
          DATA.asteroidsX[asteroid] + DATA.asteroidMass[asteroid] &&
        PLAYER.X + PLAYER.WIDTH / 2 + PLAYER.POLEGRAB >
          DATA.asteroidsX[asteroid] - DATA.asteroidMass[asteroid]
      ) {
        if (
          PLAYER.Y - PLAYER.HEIGHT / 2 - PLAYER.POLEGRAB <
            DATA.asteroidsY[asteroid] + DATA.asteroidMass[asteroid] &&
          PLAYER.Y + PLAYER.HEIGHT / 2 + PLAYER.POLEGRAB >
            DATA.asteroidsY[asteroid] - DATA.asteroidMass[asteroid]
        ) {
          targets++;
          PLAYER.GRAB = 1;
          DATA.targetId = DATA.asteroidId[asteroid]; //забираю сам id
        }
      }
    }
  }
  if (targets > 0) {
    // если есть цели - выходим
    return;
  }
  if (targets == 0 && PLAYER.GRAB != 2) {
    // если нет целей и нет зацепа - снимаем захват
    PLAYER.GRAB = 0;
    DATA.targetId = NaN;
  }
  // последняя проверяка относительно лишняя по логике, но, давай хотя бы так для начала
}
function checkFuel(fuel) {
  if (fuel <= 0) {
    DATA.store -= PLAYER.maxFuel;
    PLAYER.fuel = PLAYER.maxFuel;
  }
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  DATA.frame++; //фреймы на будущее (ну а вдругы)
  //ctx.beginPath();
  ctx.save();
  ctx.translate(
    0 - PLAYER.X + CONFIG.WIDTH / 2,
    0 - PLAYER.Y + CONFIG.HEIGHT / 2
  );
  drawBase(BASE.baseX, BASE.baseY); //база на нижнем слое
  //границы карты на данном этапе
  ctx.strokeStyle = `rgb(10,255,10)`;
  ctx.strokeRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
  ctx.stroke();
  ctx.strokeStyle = `rgb(255,255,10)`;
  ctx.strokeRect(
    0 - CONFIG.WIDTH * 0.1,
    0 - CONFIG.WIDTH * 0.1,
    CONFIG.WIDTH + CONFIG.WIDTH * 0.2,
    CONFIG.HEIGHT + CONFIG.WIDTH * 0.2
  );
  ctx.stroke();
  ctx.strokeStyle = `rgb(255,10,10)`;
  ctx.strokeRect(
    0 - CONFIG.WIDTH * 0.2,
    0 - CONFIG.WIDTH * 0.2,
    CONFIG.WIDTH + CONFIG.WIDTH * 0.4,
    CONFIG.HEIGHT + CONFIG.WIDTH * 0.4
  );
  ctx.stroke();
  drawAsteroids();
  drawPlayer(PLAYER.X, PLAYER.Y);
  ctx.restore();
  drawDeInterface(); // интерфейс выше всех
  if (DATA.frame >= CONFIG.FPS) {
    DATA.frame = 0;
  }
}
function drawAsteroids() {
  for (let asteroids = 0; asteroids < DATA.asteroidId.length; asteroids++) {
    ctx.beginPath();
    ctx.strokeStyle = `rgb(200,200,200)`;
    ctx.stroke();
    ctx.arc(
      DATA.asteroidsX[asteroids],
      DATA.asteroidsY[asteroids],
      DATA.asteroidMass[asteroids],
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = `rgb(0, 0, 0)`;
    ctx.stroke(); //use strokeStyle?
    ctx.fillStyle = DATA.asteroidColor[asteroids];
    ctx.fill(); //use fillStyle
    ctx.beginPath();
  }
}
function drawPlayer(x, y) {
  // ctx.save();

  // короче, я мусор тут оставлю пока что, в этой функции
  // что бы я быстро вспомнил что к чему при написании
  // следующей функции для расчётов вращения
  //в целом - всё пока что упирается в два варианта:
  // 1) Ценровать всё что нужно вращать
  // 2) сделать какие сложные расчёты с радианами и смещения от начала координат, что - ну его нах
  ctx.beginPath();

  ctx.save();

  ctx.translate(x, y);
  ctx.rotate(Math.PI * (PLAYER.speedX + PLAYER.speedY));

  // ctx.globalAlpha = 0.5; //costile?
  //
  //ctx.arc(PLAYER.X, PLAYER.Y, PLAYER.POLEGRAB, 0, Math.PI * 2);
  ctx.arc(0, 0, PLAYER.POLEGRAB, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10,255,10,0.3)';
  ctx.strokeStyle = `rgb(200,200,200)`;
  ctx.stroke();
  ctx.fill(); //use fillStyle
  // ctx.globalAlpha = 1; //costile?
  ctx.beginPath();
  /*
  ctx.moveTo(x - PLAYER.WIDTH, y); //left
  ctx.lineTo(x, y + PLAYER.HEIGHT); // bot
  ctx.lineTo(x + PLAYER.WIDTH, y); //right
  */
  ctx.fillStyle = PLAYER.COLOR;
  ctx.strokeStyle = `rgb(200,200,200)`;
  ctx.moveTo(0 - (PLAYER.WIDTH * 5) / 5, 0 - (PLAYER.HEIGHT * 2) / 5); //1
  ctx.lineTo(0 - (PLAYER.WIDTH * 4) / 5, 0 - (PLAYER.HEIGHT * 4) / 5); //2
  ctx.lineTo(0 - (PLAYER.WIDTH * 2) / 5, 0 - (PLAYER.HEIGHT * 4) / 5); //3
  ctx.lineTo(0 - (PLAYER.WIDTH * 1) / 5, 0 - (PLAYER.HEIGHT * 5) / 5); //4
  ctx.lineTo(0 + (PLAYER.WIDTH * 1) / 5, 0 - (PLAYER.HEIGHT * 5) / 5); //5
  ctx.lineTo(0 + (PLAYER.WIDTH * 2) / 5, 0 - (PLAYER.HEIGHT * 4) / 5); //6
  ctx.lineTo(0 + (PLAYER.WIDTH * 4) / 5, 0 - (PLAYER.HEIGHT * 4) / 5); //7
  ctx.lineTo(0 + (PLAYER.WIDTH * 5) / 5, 0 - (PLAYER.HEIGHT * 2) / 5); //8
  ctx.lineTo(0 + (PLAYER.WIDTH * 5) / 5, 0 + (PLAYER.HEIGHT * 1) / 5); //9
  ctx.lineTo(0 + (PLAYER.WIDTH * 3) / 5, 0 + (PLAYER.HEIGHT * 5) / 5); //10
  ctx.lineTo(0 + (PLAYER.WIDTH * 3) / 5, 0 - (PLAYER.HEIGHT * 1) / 5); //11
  ctx.lineTo(0 + (PLAYER.WIDTH * 2) / 5, 0 - (PLAYER.HEIGHT * 2) / 5); //12
  ctx.lineTo(0 - (PLAYER.WIDTH * 2) / 5, 0 - (PLAYER.HEIGHT * 2) / 5); //13
  ctx.lineTo(0 - (PLAYER.WIDTH * 3) / 5, 0 - (PLAYER.HEIGHT * 1) / 5); //14
  ctx.lineTo(0 - (PLAYER.WIDTH * 3) / 5, 0 + (PLAYER.HEIGHT * 5) / 5); //15
  ctx.lineTo(0 - (PLAYER.WIDTH * 5) / 5, 0 + (PLAYER.HEIGHT * 1) / 5); //16
  ctx.lineTo(0 - (PLAYER.WIDTH * 5) / 5, 0 - (PLAYER.HEIGHT * 2) / 5); //16

  ctx.strokeStyle = `rgb(200,200,200)`;
  ctx.stroke();

  ctx.fill();
  ctx.restore();
}
function drawBase(x, y) {
  //Оно тебя сожрёт!!!))
  ctx.beginPath();
  //основа
  ctx.moveTo(x, y); //left
  ctx.lineTo(x, y + BASE.HEIGHT);
  ctx.lineTo(
    x + (BASE.HEIGHT * 1) / 10,
    y + BASE.HEIGHT + (BASE.HEIGHT * 1) / 10
  );
  ctx.lineTo(
    x + BASE.WIDTH - (BASE.HEIGHT * 1) / 10,
    y + BASE.HEIGHT + (BASE.HEIGHT * 1) / 10
  );
  ctx.lineTo(x + BASE.WIDTH, y + +BASE.HEIGHT);
  ctx.lineTo(x + BASE.WIDTH, y);
  ctx.fillStyle = `rgb(155,155,155)`;
  ctx.fill(); //use fillStyle
  //конец платформы и начало воронки приёма
  ctx.beginPath(); //"квадрат" приёма
  ctx.moveTo(x + (BASE.WIDTH * 6) / 10, y + (BASE.HEIGHT * 1) / 10);
  ctx.lineTo(x + (BASE.WIDTH * 9) / 10, y + (BASE.HEIGHT * 1) / 10);
  ctx.lineTo(x + (BASE.WIDTH * 9) / 10, y + (BASE.HEIGHT * 9) / 10);
  ctx.lineTo(x + (BASE.WIDTH * 6) / 10, y + (BASE.HEIGHT * 9) / 10);
  ctx.fillStyle = `rgb(0,0,0)`;
  ctx.fill();
  //конец "квадрата" приёма
  ctx.beginPath();
  ctx.arc(
    x + (BASE.WIDTH * 7.5) / 10,
    y + (BASE.HEIGHT * 5) / 10,
    (BASE.WIDTH * 1.1) / 10,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = `rgb(50,50,50)`;
  ctx.fill();
  //конец воронки
  //проба в анимацию))
  ctx.closePath(); // hm...

  DATA.voronkaX = x + (BASE.WIDTH * 7.5) / 10;
  DATA.voronkaY = y + (BASE.HEIGHT * 5) / 10;
  // DATA.voronkaX = (BASE.WIDTH * 1.1) / 10;
  // DATA.voronkaY = (BASE.WIDTH * 1.1) / 10;
  DATA.voronkaLenght = (BASE.WIDTH * 1.1) / 10;
  ctx.beginPath();
  ctx.save();
  ctx.translate(DATA.voronkaX, DATA.voronkaY);
  ctx.rotate(((Math.PI * DATA.tick) / 200) * DATA.animationTickState);
  ctx.arc(0, 0, DATA.voronkaLenght, 0, (Math.PI * 2 * DATA.tick) / 200);
  ctx.fillStyle = `rgb(210,210,210)`;

  ctx.fill();
  ctx.closePath();

  ctx.restore();

  ctx.beginPath();
  //заправка
}
function DeGenerateAsteroid() {
  //Demo generation asteroid on timing

  DATA.asteroidId.push(DATA.ID);

  DATA.asteroidSpeedX.push(-(CONFIG.WIDTH * 1) / 20 / OPTIONS.tickRate);
  DATA.asteroidSpeedY.push(-(CONFIG.WIDTH * 1) / 800 / OPTIONS.tickRate);
  DATA.asteroidColor.push(
    `rgb(${255 * Math.random()}, ${10 * Math.random()}, ${255 * Math.random()})`
  ); //lol ))
  DATA.ID++;
}
function generateAsteroid() {
  DATA.asteroidId.push(DATA.ID);
  let firstValue = Math.random();
  let seconValue = Math.random();
  DATA.asteroidsX.push(CONFIG.WIDTH * 1.2);
  if (firstValue * 1 < 3 / 10) {
    DATA.asteroidsY.push(
      (CONFIG.HEIGHT * 2) / 10 + ((CONFIG.HEIGHT * 3) / 10) * Math.random()
    );
  } else if (firstValue * 1 < 5 / 10) {
    DATA.asteroidsY.push(
      (CONFIG.HEIGHT * 3) / 10 + ((CONFIG.HEIGHT * 3) / 10) * Math.random()
    );
  } else if (firstValue * 1 < 7 / 10) {
    DATA.asteroidsY.push(
      (CONFIG.HEIGHT * 4) / 10 + ((CONFIG.HEIGHT * 3) / 10) * Math.random()
    );
  } else if (firstValue * 1 < 9 / 10) {
    DATA.asteroidsY.push(
      (CONFIG.HEIGHT * 9) / 10 + ((CONFIG.HEIGHT * 3) / 10) * Math.random()
    );
  }
  DATA.asteroidResources.id;
  DATA.asteroidMass.push((firstValue * 1 * CONFIG.WIDTH * 1) / 9);
  DATA.asteroidColor.push(`rgb(100,100,100)`);
  DATA.asteroidSpeedX.push(-(CONFIG.WIDTH * 1) / 20 / OPTIONS.tickRate);
  DATA.asteroidSpeedY.push(-(CONFIG.WIDTH * 1) / 800 / OPTIONS.tickRate);
  DATA.ID++;
}
function offMap() {
  for (let asteroid = 0; asteroid < DATA.asteroidId.length; asteroid++) {
    let flagOffMap = 0; // flag delete this aster;

    if (
      DATA.asteroidsX[asteroid] < -CONFIG.WIDTH * 0.2 ||
      DATA.asteroidsX[asteroid] > CONFIG.WIDTH * 1.2
    ) {
      flagOffMap = 1;
    }
    if (
      DATA.asteroidsY[asteroid] < -CONFIG.HEIGHT * 0.2 ||
      DATA.asteroidsY[asteroid] > CONFIG.HEIGHT * 1.2
    ) {
      flagOffMap = 1;
    }

    //коллизия с переработкой
    let frag = millingAsteroids(asteroid);

    if (frag == asteroid) {
      flagOffMap = 1; //можно доработать, но, фрагаем и перерабатываем астероид тут
      DATA.store =
        DATA.store + DATA.asteroidMass[asteroid] * DATA.asteroidMass[asteroid];
      console.log(DATA.store);
    }
    //переработка выше
    if (flagOffMap == 1) {
      DATA.asteroidId.splice(asteroid, 1);
      DATA.asteroidsX.splice(asteroid, 1);
      DATA.asteroidsY.splice(asteroid, 1);
      DATA.asteroidSpeedX.splice(asteroid, 1);
      DATA.asteroidSpeedY.splice(asteroid, 1);
      DATA.asteroidMass.splice(asteroid, 1);
      DATA.asteroidColor.splice(asteroid, 1);

      flagOffMap = 0;
    }
  } //fin flag asteroids
  if (
    PLAYER.X < -CONFIG.WIDTH * 0.2 ||
    PLAYER.X > CONFIG.WIDTH * 1.2 ||
    PLAYER.Y < -CONFIG.HEIGHT * 0.2 ||
    PLAYER.Y > CONFIG.HEIGHT * 1.2
  ) {
    PLAYER.X = CONFIG.WIDTH / 2;
    PLAYER.Y = CONFIG.HEIGHT / 8;
    PLAYER.speedX = 0;
    PLAYER.speedY = 0;
    PLAYER.fuel -= 10;
    PLAYER.GRAB = 0;
  }
}
function dropAsteroid() {
  DATA.asteroidSpeedX[DATA.asteroidId.indexOf(DATA.targetId)] = PLAYER.speedX;
  DATA.asteroidSpeedY[DATA.asteroidId.indexOf(DATA.targetId)] = PLAYER.speedY;
  PLAYER.mass = DATA.playerDefoultMass;
  DATA.targetId = NaN;
}
function drawDeInterface() {
  // Demo interface

  ctx.font = `${parseInt(CONFIG.WIDTH / 25)}px serif`;
  ctx.fillStyle = `rgb(255,10,10)`;
  ctx.fillText(`Fuel:${PLAYER.fuel}`, CONFIG.WIDTH * 0.6, CONFIG.HEIGHT * 0.02);
  ctx.fillStyle = `rgb(0,190,0)`;
  ctx.fillText(`Store:${DATA.store}`, CONFIG.WIDTH * 0.6, CONFIG.HEIGHT * 0.05);
  ctx.fillStyle = `rgb(255,10,10)`;
  if (OPTIONS.console == 1) {
    ctx.fillStyle = `rgb(255,10,10)`;
    ctx.fillText(`SpeedX:${PLAYER.speedX}`, 0, CONFIG.HEIGHT * 0.02);
    ctx.fillText(`SpeedY:${PLAYER.speedY}`, 0, CONFIG.HEIGHT * 0.05);
    ctx.fillText(`mouseX:${MOUSE.startX}`, 0, CONFIG.HEIGHT * 0.08);
    ctx.fillText(`mouseY:${MOUSE.startY}`, 0, CONFIG.HEIGHT * 0.11);
    ctx.fillText(`MspeedX:${MOUSE.speedX}`, 0, CONFIG.HEIGHT * 0.14);
    ctx.fillText(`MspeedY:${MOUSE.speedY}`, 0, CONFIG.HEIGHT * 0.17);
    ctx.fillText(`PlMass:${PLAYER.mass}`, 0, CONFIG.HEIGHT * 0.2);
    ctx.fillText(`PlX:${PLAYER.X}`, 0, CONFIG.HEIGHT * 0.23);
    ctx.fillText(`PlY:${PLAYER.Y}`, 0, CONFIG.HEIGHT * 0.26);
  }
  if (PLAYER.GRAB == 1) {
    ctx.fillStyle = `rgb(255,0,0)`;
    ctx.fillText(`GRAB! (Key E)`, CONFIG.WIDTH * 0.6, CONFIG.HEIGHT * 0.09);
  }
  if (PLAYER.GRAB == 2) {
    ctx.fillStyle = `rgb(0,255,0)`;
    ctx.fillText(`Capture activated`, CONFIG.WIDTH * 0.6, CONFIG.HEIGHT * 0.07);
    ctx.fillStyle = `rgb(255,0,0)`;
    ctx.fillText(
      `Return Asteroid in BASE`,
      CONFIG.WIDTH * 0.6,
      CONFIG.HEIGHT * 0.09
    );
  } else {
  }
  for (let stroka = 0; stroka < DATA.asteroidResources.id.length; stroka++) {
    ctx.fillStyle = `rgb(0,190,0)`;
    ctx.fillText(
      `Store:${DATA.asteroidResources.id[stroka]}`,
      CONFIG.WIDTH * 0.6,
      CONFIG.HEIGHT * 0.08 + stroka * 0.3
    );
  }
  ctx.stroke();
  //lefttop

  //Keys //Немного наговнокодил(((
  let goKey = 0;
  for (let ButSum = 0; ButSum < INTERFACE.BUTTONY.length; ButSum++) {
    for (let ButLine = 0; ButLine < INTERFACE.BUTTONX.length; ButLine++) {
      goKey++;
      ctx.strokeStyle = 'green';
      ctx.beginPath();

      roundedRect(
        ctx,
        INTERFACE.BUTTONX[ButLine],
        INTERFACE.BUTTONY[ButSum],
        INTERFACE.ButtonLenght,
        INTERFACE.ButtonLenght,
        INTERFACE.ButtonLenght / 5
      );
      // "NameKeys"

      ctx.font = `${parseInt(INTERFACE.ButtonLenght / 4)}px serif`;
      ctx.fillStyle = `rgb(0,255,0)`;
      ctx.fillText(
        `${INTERFACE.NAME[goKey - 1]}`,
        INTERFACE.BUTTONX[ButLine] + INTERFACE.ButtonLenght / 2,
        INTERFACE.BUTTONY[ButSum] + INTERFACE.ButtonLenght / 2
      );
      ctx.stroke();
    }
  }
}
function millingAsteroids(id) {
  if (
    DATA.voronkaX - DATA.voronkaLenght < DATA.asteroidsX[id] &&
    DATA.voronkaX + DATA.voronkaLenght > DATA.asteroidsX[id]
  ) {
    if (
      DATA.voronkaY + DATA.voronkaLenght > DATA.asteroidsY[id] &&
      DATA.voronkaY - DATA.voronkaLenght < DATA.asteroidsY[id]
    ) {
      //если есть совпадение - возвращаем id того, от кого избавляемся
      if (
        DATA.voronkaX - DATA.voronkaLenght < PLAYER.X &&
        DATA.voronkaX + DATA.voronkaLenght > PLAYER.X &&
        DATA.voronkaY + DATA.voronkaLenght > PLAYER.Y &&
        DATA.voronkaY - DATA.voronkaLenght < PLAYER.Y
      ) {
        PLAYER.GRAB = 0;
      }
      return id;
    }
  }
}
function allInterface(Key) {
  /* [
    `↖`,
    `W`,
    `↗`,
    `E`,
    `A`,
    `stop`,
    `D`,
    `F`,
    `↙`,
    `S`,
    `↘`,
    `Q`,
    `_`,
    `X`,
    `_`,
    `P`,
  ]*/
  checkFuel(PLAYER.fuel);
  switch (Key) {
    case `↖`: {
      PLAYER.fuel -= 1;
      PLAYER.speedX -= PLAYER.power / 2 / PLAYER.mass;
      PLAYER.speedY -= PLAYER.power / 2 / PLAYER.mass;
      break;
    }
    case `W`: {
      PLAYER.fuel -= 1;
      PLAYER.speedY -= PLAYER.power / PLAYER.mass;
      break;
    }
    case `↗`: {
      PLAYER.fuel -= 1;
      PLAYER.speedX += PLAYER.power / 2 / PLAYER.mass;
      PLAYER.speedY -= PLAYER.power / 2 / PLAYER.mass;
      break;
    }
    case `E`: {
      switch (PLAYER.GRAB) {
        case 0:
          //  console.log(`grab = 0`);
          break;
        case 1:
          //  console.log(`grab = 1 && 2`);
          PLAYER.GRAB = 2;
          //зацеп тут
          PLAYER.speedX =
            (PLAYER.speedX * PLAYER.mass) /
              DATA.asteroidMass[DATA.asteroidId.indexOf(DATA.targetId)] +
            DATA.asteroidSpeedX[DATA.asteroidId.indexOf(DATA.targetId)];
          PLAYER.speedY =
            (PLAYER.speedY * PLAYER.mass) /
              DATA.asteroidMass[DATA.asteroidId.indexOf(DATA.targetId)] +
            DATA.asteroidSpeedY[DATA.asteroidId.indexOf(DATA.targetId)];
          PLAYER.X = DATA.asteroidsX[DATA.asteroidId.indexOf(DATA.targetId)];
          PLAYER.Y = DATA.asteroidsY[DATA.asteroidId.indexOf(DATA.targetId)];

          PLAYER.mass =
            DATA.asteroidMass[DATA.asteroidId.indexOf(DATA.targetId)] +
            DATA.playerDefoultMass +
            DATA.asteroidMass[DATA.asteroidId.indexOf(DATA.targetId)];

          break;
        case 2:
          //  console.log(`grab =2 > 1`);
          PLAYER.GRAB = 1;
          dropAsteroid();
          break;
      }
      break;
    }
    case `A`: {
      PLAYER.fuel -= 1;
      PLAYER.speedX -= PLAYER.power / PLAYER.mass;
      break;
    }
    case `stop`: {
      PLAYER.fuel -= 10;
      PLAYER.speedX = 0;
      PLAYER.speedY = 0;
      break;
    }
    case `D`: {
      PLAYER.fuel -= 1;
      PLAYER.speedX += PLAYER.power / PLAYER.mass;
      break;
    }
    case `F`: {
      break;
    }
    case `↙`: {
      PLAYER.fuel -= 1;
      PLAYER.speedX -= PLAYER.power / 2 / PLAYER.mass;
      PLAYER.speedY += PLAYER.power / 2 / PLAYER.mass;
      break;
    }
    case `S`: {
      PLAYER.fuel -= 1;
      PLAYER.speedY += PLAYER.power / PLAYER.mass;
      break;
    }
    case `↘`: {
      PLAYER.fuel -= 1;
      PLAYER.speedX += PLAYER.power / 2 / PLAYER.mass;
      PLAYER.speedY += PLAYER.power / 2 / PLAYER.mass;
      break;
    }
    case `Q`: {
      PLAYER.X = CONFIG.WIDTH / 2;
      PLAYER.Y = CONFIG.HEIGHT / 8;
      PLAYER.speedX = 0;
      PLAYER.speedY = 0;
      PLAYER.fuel -= 10;

      if (PLAYER.GRAB == 2) {
        PLAYER.GRAB = 0;
      }
      break;
    }
    case `_`: {
      break;
    }
    case `X`: {
      PLAYER.fuel -= 10;
      PLAYER.speedX = 0;
      PLAYER.speedY = 0;
      break;
    }
    case `P`: {
      //pause
      if (OPTIONS.mathTick == 1) {
        OPTIONS.mathTick = 0;
        clearInterval(GAMETICKS.mathTick);
        clearInterval(GAMETICKS.generateTimer);
      } else {
        OPTIONS.mathTick = 1;
        GAMETICKS.mathTick = setInterval(mathTick, CONFIG.TICK);
        GAMETICKS.generateTimer = setInterval(generateAsteroid, CONFIG.SPAWN);
      }
      break;
    }
    case `~`: {
      if (OPTIONS.console == 1) {
        OPTIONS.console = 0;
      } else {
        OPTIONS.console = 1;
      }

      break;
    }

    default:
      console.log(`WTF?`);
  }
}
function clickOnInterface(x, y) {
  if (
    x >= INTERFACE.BUTTONX[0] &&
    x <=
      INTERFACE.BUTTONX[INTERFACE.BUTTONX.length - 1] + INTERFACE.ButtonLenght
  ) {
    if (
      y >= INTERFACE.BUTTONY[0] &&
      y <=
        INTERFACE.BUTTONY[INTERFACE.BUTTONY.length - 1] + INTERFACE.ButtonLenght
    ) {
      //left-top
      let goKey = 0;
      for (let Ytap = 0; Ytap < INTERFACE.BUTTONY.length; Ytap++) {
        for (let Xtap = 0; Xtap < INTERFACE.BUTTONX.length; Xtap++) {
          goKey++;
          if (
            x > INTERFACE.BUTTONX[Xtap] &&
            x < INTERFACE.BUTTONX[Xtap] + INTERFACE.ButtonLenght &&
            y > INTERFACE.BUTTONY[Ytap] &&
            y < INTERFACE.BUTTONY[Ytap] + INTERFACE.ButtonLenght
          ) {
            //gпиздец, оно работает)) //Немного наговнокодил(((
            allInterface(INTERFACE.NAME[goKey - 1]);
            console.log(
              `xKey:${Xtap},yKey:${Ytap}, Key${INTERFACE.NAME[goKey - 1]}`
            );
          }
        }
      }
    }
  }
}

document.addEventListener('keydown', (Key) => {
  console.log(Key.code);

  if (Key.code == `KeyW`) {
    allInterface(`W`);
  }
  if (Key.code == `KeyS`) {
    allInterface(`S`);
  }
  if (Key.code == `KeyD`) {
    allInterface(`D`);
  }
  if (Key.code == `KeyA`) {
    allInterface(`A`);
  }
  if (Key.code == `Space`) {
    allInterface(`stop`);
  }
  if (Key.code == `KeyX`) {
    allInterface(`stop`);
  }
  if (Key.code == `KeyQ`) {
    allInterface(`Q`);
  }
  if (Key.code == `KeyE`) {
    allInterface(`E`);
  }
  if (Key.code == `Backquote`) {
    allInterface(`~`);
  }
  if (Key.code == `KeyP`) {
    allInterface(`P`);
  }
});

const GAMETICKS = {
  generateTimer: setInterval(generateAsteroid, CONFIG.SPAWN), //generate asters
  mathTick: setInterval(mathTick, CONFIG.TICK), // расчёт
  draw: setInterval(draw, 1000 / CONFIG.FPS), //draw
  offMap: setInterval(offMap, CONFIG.OFFMAPTIMER), //out of map
  // setInterval(checkGrab, 500); - ушло в mathTick()
};
console.log(
  `${GAMETICKS.generateTimer},${GAMETICKS.mathTick},${GAMETICKS.draw},${GAMETICKS.offMap}`
);
//

canvas.addEventListener(
  'mousedown',
  (e) => {
    let rect = canvas.getBoundingClientRect();
    let x = (e.clientX || e.pageX) - rect.left;
    let y = (e.clientY || e.pageY) - rect.top;
    clickOnInterface(x, y);
    console.log(x, y);
    MOUSE.startX = x;
    MOUSE.startY = y;
    DATA.store -= MOUSE.speedX + MOUSE.speedY * 2;
  },
  false
);
/*
canvas.addEventListener(
  'mousemove',
  (e) => {
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    if (MOUSE.startX != 0 && MOUSE.startY != 0) {
      MOUSE.speedX = x - MOUSE.startX;
      MOUSE.speedY = y - MOUSE.startY;
      PLAYER.speedX += MOUSE.speedX / 1000;
      PLAYER.speedY += MOUSE.speedY / 1000;
    }
    if (MOUSE.speedX < 0) {
      MOUSE.speedX *= -1;
    }
    if (MOUSE.speedY < 0) {
      MOUSE.speedY *= -1;
    }
    PLAYER.fuel -= MOUSE.speedX + MOUSE.speedY;
    if (PLAYER.fuel <= 0) {
      DATA.store -= PLAYER.maxFuel;
      PLAYER.fuel = PLAYER.maxFuel;
      return false;
    }
  },
  false
);
*/
canvas.addEventListener(
  'mouseup',
  () => {
    MOUSE.speedX = 0;
    MOUSE.speedY = 0;
    MOUSE.startX = 0;
    MOUSE.startY = 0;
  },
  false
);
