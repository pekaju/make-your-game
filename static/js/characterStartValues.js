import { mapSize } from "./drawMap.js"
import { levels } from "./levels.js"

export const startTile = [23, 13.5]
export const startingX = startTile[1] * mapSize - 7
export const startingY = startTile[0] * mapSize - 7
export let maxSpeedStart = 3.33
export let pacStartSpeed = maxSpeedStart * 0.8
export let ghostSpeedStart = maxSpeedStart * 0.75

export const getFPS = () =>
  new Promise(resolve =>
    requestAnimationFrame(t1 =>
      requestAnimationFrame(t2 => {
        pacStartSpeed = maxSpeedStart * 0.8
        ghostSpeedStart = maxSpeedStart * 0.75
        blinkyStart.speed = ghostSpeedStart
        pinkyStart.speed = ghostSpeedStart
        inkyStart.speed = ghostSpeedStart
        clydeStart.speed = ghostSpeedStart
        resolve(maxSpeedStart)
    })
    )
)

export const pacStart = {
    name: "pacman",
    x: startingX,
    y: startingY,
    speed: pacStartSpeed,
    freeze: false,
    direction: "L",
    nextDirection: "",
    prevX: 0,
    prevY: 0,
    started: false,
    aboutToStart: true,
    lastChangeCoordinates: [],
    div: document.getElementById("pacman"),
    startImg: 'url("../static/img/pacman/pacman_up.svg'
}
export const blinkyStart = {
    name: "blinky",
    color: "red",
    x: startingX,
    y: startingY - 240,
    speed: ghostSpeedStart,
    freeze: false,
    direction: "L",
    prevX: 0,
    prevY: 0,
    nextDirection: "L",
    started: false,
    aboutToStart: true,
    reverse : false,
    frightened: false,
    returnToHouse: false,
    movingIntoHouse: false,
    lastChangeCoordinates: [],
    div: document.getElementById("blinky"),
    startImg: 'url("../static/img/blinky/blinky_up.svg'
}

export const pinkyStart = {
    name: "pinky",
    color: "pink",
    x: startingX,
    y: startingY - 180,
    speed: ghostSpeedStart,
    freeze: false,
    direction: "D",
    prevX: 0,
    prevY: 0,
    nextDirection: "",
    started: false,
    aboutToStart: false,
    reverse : false,
    frightened: false,
    returnToHouse: false,
    movingIntoHouse: false,
    lastChangeCoordinates: [],
    div: document.getElementById("pinky"),
    startImg: 'url("../static/img/pinky/pinky_up.svg'
}

export const inkyStart = {
    name: "inky",
    color: "rgb(110, 210, 235)",
    x: startingX - 40,
    y: startingY - 180,
    speed: ghostSpeedStart,
    freeze: false,
    dying: false,
    direction: "U",
    prevX: 0,
    prevY: 0,
    nextDirection: "",
    started: false,
    aboutToStart: false,
    reverse : false,
    frightened: false,
    returnToHouse: false,
    lastChangeCoordinates: [],
    div: document.getElementById("inky"),
    startImg: 'url("../static/img/inky/inky_up.svg'
}

export const clydeStart = {
    name: "clyde",
    color: "orange",
    x: startingX + 40,
    y: startingY - 180,
    speed: ghostSpeedStart,
    freeze: false,
    direction: "U",
    prevX: 0,
    prevY: 0,
    nextDirection: "",
    started: false,
    aboutToStart: false,
    reverse : false,
    frightened: false,
    returnToHouse: false,
    lastChangeCoordinates: [],
    div: document.getElementById("clyde"),
    startImg: 'url("../static/img/clyde/clyde_up.svg'
}

export function setLevelSpeed(level) {
    const levelData = (level >= 21 ? levels[20] : levels[level - 1])
    pacStartSpeed = maxSpeedStart * levelData.pacSpeed
    ghostSpeedStart = maxSpeedStart * levelData.ghostSpeed

}