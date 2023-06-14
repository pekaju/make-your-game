import { drawMap, drawTiles, mapSize, getMap } from "./drawMap.js"
import { pacStart, blinkyStart, pinkyStart, inkyStart, clydeStart, ghostSpeedStart, startTile, startingX, maxSpeedStart, getFPS, pacStartSpeed } from "./characterStartValues.js";
import { updateCharacterImg } from "./updateCharacterImg.js";
import { playGameStart, PlayAudio, playFruitEat } from "./soundManager.js";
import { levels } from "./levels.js";
import { showScoreboard, getHighScore } from "./scoreboard.js";
import { socket } from "./ws.js";

// get screen refresh rate and modify speed according to it
await getFPS()


const paused = document.getElementById("pause-menu")
let c = document.getElementById("map");
let level = 1
let map = getMap(level)
let pauseMode = false
let blurred = false
let startTime
let timeElapsed = 0
let currentLevelScore = 0
let currentGameEatenDots = 0
let totalScore = 0
let lives = 3
let elroy = 0
let started = false
let ghostSpeed = ghostSpeedStart
let frightenedTime = 6000
let bonusCounter = 200
let startAudioPlayed = false
let currentAudio = ""
let player = new PlayAudio()
let audioBeforePause
let soundTimer
let fruitTimer
let highscore = await getHighScore()
let levelData = (level >= 21 ? levels[20] : levels[level - 1])
let showNameForm = false
const pacDotSpeedDecrease = 0.0012
let storyTextVisible = false

let pac = {...pacStart}
let blinky = {...blinkyStart}
let pinky = {...pinkyStart}
let inky = {...inkyStart}
let clyde = {...clydeStart}

let ghosts = [blinky, pinky, inky, clyde]
updateCharacterLocation(blinky)
updateCharacterLocation(pinky)
updateCharacterLocation(inky)
updateCharacterLocation(clyde)
updateCharacterLocation(pac)
drawMap(map)
drawTiles(map, "blue")


let start, powerUpFlashCount = 0, powerUpVisibility = "visible", fps, timer, flashInterval, frightened = false, flashLoop = 0, scatteredMode = true
const times = [];
const directionsPriority = ["U", "L", "D", "R"]
const directionOposites = {
    "U": "D",
    "D": "U",
    "L": "R",
    "R": "L"
}
let count = 0

// timer with pause and resule functions
function Timer(callback, delay) {
    var timerId, start, remaining = delay;

    this.pause = function() {
        window.clearTimeout(timerId);
        remaining -= new Date() - start;
    };

    this.resume = function() {
        start = new Date();
        window.clearTimeout(timerId);
        timerId = window.setTimeout(callback, remaining);
    };
    this.clear = function() {
        window.clearTimeout(timerId)
    }

    this.resume();
}

let modeTimes = [7000, 20000, 7000, 20000, 5000, 20000, 5000]

let i = 0

setLevelData(level)

function changeMode() {
    scatteredMode = !scatteredMode
    ghosts.forEach((ghost) => {
        ghost.reverse = true
    })
    i++
    if (i < modeTimes.length) {
        modeTimer = new Timer(changeMode, modeTimes[i])
    }
}

// switch between scattered and chase mode
var modeTimer = new Timer(function() {
    changeMode()
    
}, modeTimes[i]);

// pause before the game starts
modeTimer.pause()
document.getElementById("high-score").innerHTML = "HIGH&nbsp;&nbsp;SCORE: " + highscore

async function update() {
    if (!startAudioPlayed) {
        startAudioPlayed = true
        await playGameStart()
        setInterval(() => {
            if (document.getElementById("player").style.display === "none") {
                document.getElementById("player").style.display = "block"
            } else {
                document.getElementById("player").style.display = "none"
            }
        }, 400)
        playSound("dot_1", false)

        // set event listener that checks if game is in focus, if it is, then play audio, else stop audio
        window.addEventListener("focus", function() {
            if (pac.started) {
                player.unpause()
            }
            modeTimer.resume()
            if(fruitTimer !== undefined) {fruitTimer.resume()}
            blurred = false
        })

        window.addEventListener("blur", function() {
            player.pause()
            modeTimer.pause()
            if(fruitTimer !== undefined) {fruitTimer.pause()}
            blurred = true
        })

        if (pac.started === false) {
            pac.nextDirection = "L"
            pac.started = true
            modeTimer.clear()
            modeTimer = new Timer(function() {
                changeMode()
                
            }, modeTimes[i]);
        }
    }
    if (!pauseMode) {
        let isEyes = false
        ghosts.forEach(e => {
            if (e.returnToHouse) {
                isEyes = true
            }
        })
        
        if (pac.dying) {
            playSound("death", true)
        } else if (isEyes) {
            playSound("eyes")
        } else if (frightened) {
            playSound("power_up", false)
        } else {
            if (pac.started) {
                playSound("dot_1", false)
            }
        }
    }

    start = requestAnimationFrame(update)

    // block to display fps
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
        times.shift();
    }
    times.push(now);
    fps = times.length;
    document.getElementById("fps").innerHTML = "FPS: " + fps.toString()
    // end of fps block

    if (pauseMode) {
        return
    }
    if (pac.started) {
        if (startTime === undefined) {
            startTime = Date.now()
        }
        count++
    }
    // pinky joins the game if 100 frames have passed
    if(count === 100) {
        map[12][13] = "m"; map[12][14]  = "m"
        pinky.aboutToStart = true
        drawTiles(map, "blue")
    }
    // inky joins the game if 30 dots are eaten
    if (currentGameEatenDots === 30) {
        inky.aboutToStart = true
    }
    // clyde joins the game if 1/3 of the dots are eaten
    if (currentGameEatenDots === 80) {
        clyde.aboutToStart = true
    }
    if (powerUpFlashCount === 9) {
        powerUpVisibility = (powerUpVisibility === "visible" ? "hidden" : "visible")
        document.querySelectorAll(".big-dot").forEach((e) => {
            e.style.visibility = powerUpVisibility
        })
        powerUpFlashCount = 0
    }
    powerUpFlashCount++

    // timer
    if (!pauseMode && pac.started && !blurred) {
        timeElapsed += Date.now() - startTime
        startTime = Date.now()
        document.getElementById(("time")).innerHTML = millisToMinutesAndSeconds(timeElapsed)
    } else {
        startTime = Date.now()
    }

    // update pac position
    let characters = [pac, blinky, pinky, inky, clyde]
    if (pac.started) {
        for (let character of characters) {
            if (character.started) {
                updateCharater(character)
            } else if (!character.started && !character.aboutToStart) {
                updateNotStarted(character)
            } else if (!character.started && character.aboutToStart) {
                updateAboutToStart(character)
            }
        }
    }
}
function updateNotStarted(character) {
    if (character.freeze) {
        return
    }
    let currentTile = getCharacterCurrentTileCenter(character)
    let currentX = currentTile[0]
    let currentY = currentTile[1]
    if (character.direction == 'U' && (!isGhostHouseUp(map[currentY - 1][currentX]))) {
        character.y -= character.speed
        updateCharacterLocation(character)
    } else if (character.direction == 'U' && (isGhostHouseUp(map[currentY - 1][currentX]))) {
        character.direction = 'D'
    }
    if (character.direction == 'D' && !isGhostHouseBottom(map[currentY + 1][currentX])) {
        character.y += character.speed
        updateCharacterLocation(character)
    } else if (character.direction == 'D' && isGhostHouseBottom(map[currentY + 1][currentX])) {
        character.direction = 'U'
    }
    if(count % 4 === 0 && character.name !== "pacman") {
        updateCharacterImg(character, flashLoop, elroy)

    }
    updateMap()
}
function updateAboutToStart(character) {
    if (character.freeze) {
        return
    }
    character.direction = ''
    let currentTile = getCharacterCurrentTileCenter(character)
    let currentX = currentTile[0]
    let currentY = currentTile[1]
    if (isGhostHouseLeftSide(map[currentY][currentX])) {
        character.prevX = character.x
        character.x += character.speed
        updateCharacterLocation(character)
        updateMap()
    } else if (isGhostHouseRightSide(map[currentY][currentX])) {
        character.prevX = character.x
        character.x -= character.speed
        updateCharacterLocation(character)
        updateMap()
    } else if (isGhostHouseMiddle(map[currentY][currentX]) && character.nextDirection != 'U') {
        character.nextDirection = 'U'
        character.x = startingX
        updateCharacterLocation(character)
    } else if (isGhostHouseMiddle(map[currentY][currentX]) && character.nextDirection == 'U') {
        character.nextDirection = 'U2'
        character.y -= character.speed
        updateCharacterLocation(character)
        updateMap()
    } else if (character.nextDirection == 'U2') {
        // if ghost hasn't exited the ghosthouse, then move up
        if (character.y > 11 * mapSize - 7 + character.speed) {
            character.y -= character.speed
            character.div.style.left = character.x
            character.div.style.top = character.y
            updateMap()
        }else {
            character.direction = "L"
            character.started = true
        }
    }
    if(count % 4 === 0 && character.name !== "pacman") {
        updateCharacterImg(character, flashLoop, elroy)
    }
}

function updateCharater(character) {
    if (character.freeze) {
        if (character.name === "pacman" && pac.dying && count % 10 === 0) {
            updateCharacterImg(character, flashLoop, elroy)
        }
        return
    }

    let centerCharacter = false
    let [tileX, tileY] = getCharacterCurrentTileCenter(character)

    if (!started && pac.nextDirection == '') {
        return
    }
    if (character.reverse) {
        character.nextDirection = directionOposites[character.direction]
        character.reverse = false
    }

    //update character icon
    if(count % 4 === 0) {
        updateCharacterImg(character, flashLoop, elroy)

    }
    
    //set elroy level
    if (244-currentLevelScore === levelData.elroy2Dots) {
        elroy = 2
    } else if (244 - currentLevelScore === levelData.elroy1Dots) {
        elroy = 1
    }
    // set blinkys elroy speed
    if(elroy > 0 && character.name === "blinky") {
        if (!character.frightened && ! character.returnToHouse) {
            resetGhostSpeed(character)
        }
    }

    // center to the ghosthouse door, when eaten ghost gets there
    if (character.returnToHouse && characterIsNearTheCenterOftile(character, 13.5, 11) && tileY === 11 && tileX > 12 && tileX < 15) {
        character.x = 13.5 * mapSize - 7
        character.y = 11 * mapSize - 7
        updateCharacterLocation(character)
        character.movingIntoHouse = true
        character.returnToHouse = false
        character.nextDirection = ""
        character.direction = ""
    }
    if (character.movingIntoHouse) {
        if (tileY === 14) {
            character.movingIntoHouse = false
            character.frightened = false
            character.aboutToStart = true
            character.started = false
            resetGhostSpeed(character)
            character.div.style.backgroundImage = character.startImg
        } else {
            character.y = character.y + character.speed
        }
    }

    // if ghost is frightened, then change directions randomly
    if (ghosts.includes(character) && character.frightened && !character.returnToHouse) {
        let directions = getCurrentCordDirections(tileX, tileY)
        // remove current direction from array since ghost can't reverse direction
        const index = directions.indexOf(directionOposites[character.direction]);
        if (index > -1) {
            directions.splice(index, 1);
        }
        character.nextDirection = directions[Math.ceil(Math.random() * directions.length)]
    }

    // check if ghost x and y hasn't chaned after previous step, if haven't, then it's stuck and need a ned direction
    if (character.prevX === character.x && character.prevY === character.y && character.name !== "pacman" && started) {
        character.nextDirection = calculateGhostNextDirection(character, tileX, tileY)
    }

    // save previus y and y
    character.prevX = character.x
    character.prevY = character.y

    // set ghost next direction
    if (character.name !== "pacman" && (character.lastChangeCoordinates[0] !== tileX || character.lastChangeCoordinates[1] !== tileY) && started) {
        if (getCurrentCordDirections(tileX, tileY, character).length > 2 || !nextTileIsPathValue(character, tileX, tileY)) {
            character.nextDirection = calculateGhostNextDirection(character, tileX, tileY)
            if (character.direction !== character.nextDirection) {
                character.stepsInPath = 0
                character.lastChangeCoordinates = getCharacterCurrentTileCenter(character)
            }
        }
    }
    let availableDirections = getCurrentCordDirections(tileX, tileY, character)
    if (availableDirections.includes(character.nextDirection) && characterIsNearTheCenterOftile(character, tileX, tileY)) {
        if (!characterIsInTheCenter(character, tileX, tileY)) {
            centerCharacter = true
        }
        character.direction = character.nextDirection
    } else if (!started && character.nextDirection !== "") {
        character.direction = character.nextDirection
        started = true
        blinky.direction = "L"
        blinky.started = true
        modeTimer.resume()
        document.getElementById("ready-text").style.display = "none"
    }
    if ((nextTileIsPathValue(character, tileX, tileY) || !characterIsNearTheCenterOftile(character, tileX, tileY)) && !centerCharacter) {
        switch (character.direction) {
            case "R":
                character.x += character.speed;
                break;
            case "L":
                character.x -= character.speed;
                break;
            case "U":
                character.y -= character.speed;
                break;
            case "D":
                character.y += character.speed;
                break;
        }
        character.div.style.left = character.x,
        character.div.style.top = character.y
        updateMap()
    } else if (exitHoleLeft(character)) {
        // if ghost exits the tunnel, then it's speed slows down
        if (ghosts.includes(character)) {
            character.speed = character.speed * levelData.ghostTunnelSpeed
            setTimeout(() => {
                if (character.frightened) {
                    character.speed = levelData.frightGhostSpeed
                } else {
                    resetGhostSpeed(character)
                }
            }, 1500)
        }
        character.x = 27 * mapSize - 7
        character.div.style.left = character.x,
            character.div.style.top = character.y
        if (!pauseMode) {
            updateMap()
        }
    } else if (exitHoleRight(character)) {
         // if ghost exits the tunnel, then it's speed slows down
        if (ghosts.includes(character)) {
            character.speed = character.speed * 0.75
            setTimeout(() => {
                if (character.frightened) {
                    character.speed = levelData.frightGhostSpeed
                } else {
                    resetGhostSpeed(character)
                }
            }, 1500)
        }
        character.x = 0 * mapSize - 7
        character.div.style.left = character.x,
            character.div.style.top = character.y
        if (!pauseMode) {
            updateMap()
        }
    } else if (characterIsNearTheCenterOftile(character, tileX, tileY) || centerCharacter) {
        character.x = tileX * mapSize - 7
        character.y = tileY * mapSize - 7
        updateCharacterLocation(character)
        updateMap()
    }
    // check if pac and ghost are in the same tile
    if (ghosts.includes(character)) {
        checkIfGhostIsInTheSameTileAsPac(character)
    }
}

function exitHoleLeft(character) {
    let currentCharX = getCharacterCurrentTileCenter(character)[0]
    if (currentCharX === 0) {
        return true
    }
    return false
}
function exitHoleRight(character) {
    let currentCharX = getCharacterCurrentTileCenter(character)[0]
    if (currentCharX === 27) {
        return true
    }
    return false
}
function isPathValue(value) {
    return ["0", "1", "2", "fruit"].includes(value)
}
function isGhostHouseMiddle(value) {
    return ["4"].includes(value)
}
function isGhostHouseLeftSide(value) {
    return ["3"].includes(value)
}
function isGhostHouseRightSide(value) {
    return ["5"].includes(value)
}
function isGhostHouseUp(value) {
    return ['hhul', 'mmm'].includes(value)
}
function isGhostHouseBottom(value) {
    return ['b'].includes(value)
}

function getCurrentCordDirections(x, y, ghost) {
    const currentX = x
    const currentY = y
    let availableDirections = []
    if (isPathValue(map[currentY + 1][currentX])) {
        availableDirections.push("D")
    }
    if (isPathValue(map[currentY - 1][currentX])) {
        // ghost cannot turn up on certain points
        if (ghost !== undefined && (currentY === 23 && currentX === 12) || (currentY === 23 && currentX === 15) || (currentY === 11 && currentX === 12) || (currentY === 11 && currentX === 15)) {
            if (ghosts.includes(ghost)) {
            } else {
                availableDirections.push("U")
            }
        } else {
            availableDirections.push("U")
        }
    }
    if (isPathValue(map[currentY][currentX + 1])) {
        availableDirections.push("R")
    }
    if (isPathValue(map[currentY][currentX - 1])) {
        availableDirections.push("L")
    }
    return availableDirections
}

function nextTileIsPathValue(character, x, y) {
    if (character.direction === "D") {
        return isPathValue(map[y + 1][x])
    }
    if (character.direction === "U") {
        return isPathValue(map[y - 1][x])
    }
    if (character.direction === "R") {
        return isPathValue(map[y][x + 1])
    }
    if (character.direction === "L") {
        return isPathValue(map[y][x - 1])
    }
    return false
}

function characterIsNearTheCenterOftile(character, x, y) {
    if (characterIsInTheCenter(character, x, y)) {
        return true
    }
    const currentX = (character.x + 7)
    const currentY = (character.y + 7)
    if (character.direction === "D") {
        if (y * mapSize <= currentY + character.speed && y * mapSize >= currentY) {
            return true
        } else {
            return false
        }
    }
    if (character.direction === "U") {
        if (y * mapSize >= currentY - character.speed && y * mapSize <= currentY) {
            return true
        } else {
            return false
        }
    }
    if (character.direction === "R") {
        if (x * mapSize <= currentX + character.speed && x * mapSize >= currentX) {
            return true
        } else {
            return false
        }
    }
    if (character.direction === "L") {
        if (x * mapSize >= currentX - character.speed && x * mapSize <= currentX) {
            return true
        } else {
            return false
        }
    }
    return false
}

function updateCharacterLocation(character) {
    character.div.style.left = character.x
    character.div.style.top = character.y
}

function characterIsInTheCenter(character, x, y) {
    const currentX = (character.x + 7)
    const currentY = (character.y + 7)
    return currentX === x * mapSize && currentY === y * mapSize
}

function getCharacterCurrentTileCenter(character) {
    const currentX = (character.x + 14)
    const currentY = (character.y + 14)
    return [Math.floor(currentX / mapSize), Math.floor(currentY / mapSize)]
}

function calculateGhostNextDirection(character, x, y) {
    let targetTile = [0, 0]
    let currentTile = getCharacterCurrentTileCenter(character)
    if (character.returnToHouse) {
        targetTile = [11, 13]
    } else {
        if (character.name === "blinky") {
            targetTile = getCharacterCurrentTileCenter(pac)
            if (scatteredMode) { targetTile = [26, 0] }
        } else if (character.name === "pinky") {
            targetTile = getCharacterCurrentTileCenter(pac)
            if (pac.direction === "R") { targetTile[0] = targetTile[0] + 4 }
            if (pac.direction === "L") { targetTile[0] = targetTile[0] - 4 }
            if (pac.direction === "D") { targetTile[1] = targetTile[1] + 4 }
            if (pac.direction === "U") { targetTile[1] = targetTile[1] - 4; targetTile[0] = targetTile[0] - 4 } // overflow error, like in the real game
            if (scatteredMode) { targetTile = [2, 0] }
        } else if (character.name === "inky") {
            //get pacmans location and add 2 tiles to the front
            let twoTilesFromPac = getCharacterCurrentTileCenter(pac)
            if (pac.direction === "R") { twoTilesFromPac[0] = twoTilesFromPac[0] + 2 }
            if (pac.direction === "L") { twoTilesFromPac[0] = twoTilesFromPac[0] - 2 }
            if (pac.direction === "D") { twoTilesFromPac[1] = twoTilesFromPac[1] + 2 }
            if (pac.direction === "U") { twoTilesFromPac[1] = twoTilesFromPac[1] - 2; twoTilesFromPac[0] = twoTilesFromPac[0] - 2 } // overflow error, like in the real game
            if (scatteredMode) { 
                targetTile = [0, 31] 
            } else {
                let blinkysTile = getCharacterCurrentTileCenter(blinky)
                let differenceX = twoTilesFromPac[0] - blinkysTile[0]
                let differenceY = twoTilesFromPac[1] - blinkysTile[1]
                targetTile[0] = twoTilesFromPac[0] + differenceX
                targetTile[1] =  twoTilesFromPac[1] + differenceY
            }
        } else if (character.name === "clyde") {
            let pacmanTile = getCharacterCurrentTileCenter(pac)
            let cyldeTile = getCharacterCurrentTileCenter(clyde)
            let differenceX = Math.abs(pacmanTile[0] - cyldeTile[0])
            let differenceY = Math.abs(pacmanTile[1] - cyldeTile[1])
            if ( differenceX + differenceY < 9 || scatteredMode) {
                targetTile = [26, 31]
            } else {
                targetTile = pacmanTile
            }
        }
    }
    let availableDirections = getCurrentCordDirections(currentTile[0], currentTile[1], character)
    // remove current direction from array since ghost can't reverse direction
    const index = availableDirections.indexOf(directionOposites[character.direction]);
    if (index > -1) {
        availableDirections.splice(index, 1);
    }
    let shortestDirection, pathLength
    for (let i = 0; i < availableDirections.length; i++) {
        let currentX = currentTile[0], currentY = currentTile[1]
        if (availableDirections[i] === "U") { currentY -= 1 }
        if (availableDirections[i] === "D") { currentY += 1 }
        if (availableDirections[i] === "L") { currentX -= 1 }
        if (availableDirections[i] === "R") { currentX += 1 }
        let horizontalCap = (targetTile[0] === currentX ? 0 : (targetTile[0] > currentX ? targetTile[0] - currentX : currentX - targetTile[0]))
        let verticalCap = (targetTile[1] === currentY ? 0 : (targetTile[1] > currentY ? targetTile[1] - currentY : currentY - targetTile[1]))
        let distance
        if (horizontalCap === 0) {
            distance = verticalCap
        } else if (verticalCap === 0) {
            distance = horizontalCap
        } else {
            distance = Math.sqrt(Math.pow(horizontalCap, 2) + Math.pow(verticalCap, 2))
        }
        if (pathLength === distance) {
            if (directionsPriority.indexOf(availableDirections[i]) < directionsPriority.indexOf(shortestDirection)) {
                shortestDirection = availableDirections[i]
                pathLength = distance
            }
        } else if (pathLength === undefined || pathLength > distance) {
            shortestDirection = availableDirections[i]
            pathLength = distance
        }
    }
    return shortestDirection
}

function resetFrightenedMode() {
    frightened = false
    ghosts.forEach((e) => {
        if (!e.returnToHouse) {
            if (e.frightened) {
                resetGhostSpeed(e)
            }
            e.frightened = false
        }
    })
}

function resetGame() {
    cancelAnimationFrame(start)
    started = false
    count = 0
    hideFruit()
    currentGameEatenDots = 0
    map[12][13] = "mmm"; map[12][14]  = "mmm"
    pac = {...pacStart}
    pac.div.style.backgroundPosition = "0 0"
    pac.div.style.backgroundImage = pac.startImg
    updateCharacterLocation(pac)
    blinky = {...blinkyStart}
    updateCharacterLocation(blinky)
    updateCharacterImg(blinky, flashLoop, elroy)
    pinky = {...pinkyStart}
    updateCharacterLocation(pinky)
    updateCharacterImg(pinky, flashLoop, elroy)
    inky = {...inkyStart}
    updateCharacterLocation(inky)
    updateCharacterImg(inky, flashLoop, elroy)
    clyde = {...clydeStart}
    updateCharacterLocation(clyde)
    updateCharacterImg(clyde, flashLoop, elroy)
    ghosts = [blinky, pinky, inky, clyde]
    modeTimer.clear()
    if (timer !== undefined) {timer.clear()}
    scatteredMode = true
    resetFrightenedMode()
    player.stop()
    currentAudio = ""
    update()
}

function checkIfGhostIsInTheSameTileAsPac(character) {
    let pacTile = getCharacterCurrentTileCenter(pac)
    let ghostTile = getCharacterCurrentTileCenter(character)
    if (ghostTile[0] === pacTile[0] && ghostTile[1] === pacTile[1]) {
        if (!character.returnToHouse) {
            if (character.frightened) {
                playSound("eat_ghost", true)
                character.frightened = false
                character.returnToHouse = true
                character.speed = maxSpeedStart * 1.8
                cancelAnimationFrame(start)
                let bonusElem = document.getElementById("bonus")
                totalScore += bonusCounter
                bonusElem.innerHTML = (bonusCounter).toString()
                bonusCounter = bonusCounter * 2
                bonusElem.style.display = "block"
                bonusElem.style.left = pac.x
                bonusElem.style.top = pac.y + 2
                pac.div.style.display = "none"
                character.div.style.display = "none"
                if (timer !== undefined && flashLoop === 0) {timer.pause()}
                if (flashInterval !== undefined && flashLoop > 0) {flashInterval.pause()}

                setTimeout(() => {
                    bonusElem.style.display = "none"
                    pac.div.style.display = "block"
                    character.div.style.display = "block"
                    if (timer !== undefined && flashLoop === 0) {timer.resume()}
                    if (flashInterval !== undefined && flashLoop > 0) {flashInterval.resume()}
                    update()
                }, 1000);

            } else {
                //cancelAnimationFrame(start)
                lives -= 1
                ghosts.forEach(e => e.freeze = true)
                pac.freeze = true
                setTimeout(() => {
                    pac.dying = true
                    pac.div.style.backgroundSize = "450px"
                    ghosts.forEach(e => e.div.style.display = "none")
                    document.getElementById("life" + (lives + 1)).style.display = "none"
                    setTimeout(() => {
                        ghosts.forEach(e => e.div.style.display = "block")
                        ghosts.forEach(e => e.freeze = false)
                        pac.div.style.backgroundSize = "151px"
                        pac.freeze = false
                        // death animation
                        pac.dying = false
                        if (lives === 0) {
                            if (totalScore > highscore) {
                                document.getElementById("high-score").innerHTML = "HIGH&nbsp;&nbsp;SCORE: " + totalScore
                            }
                            cancelAnimationFrame(start)
                            gameOver()
                        } else {
                            resetGame()
                        }
                    },2000)
                }, 300)
            }
        }
    }

}

function updateMap() {
    const currentX = Math.round((pac.x + 7) / mapSize)
    const currentY = Math.round((pac.y + 7) / mapSize)
    if (currentY !== startTile[0] || currentX != startTile[1]) {
        if (map[currentY][currentX] === "fruit") {
            totalScore += levelData.bonusPoints
            hideFruit()
            playFruitEat()
            document.getElementById("fruit-bonus").innerHTML = levelData.bonusPoints
            document.getElementById("fruit-bonus").style.display = "block"
            setTimeout(() => {
                document.getElementById("fruit-bonus").style.display = "none"
            },600)
            document.getElementById("score").innerHTML = totalScore.toString()
        } else if (map[currentY][currentX] != 0) {
            if (map[currentY][currentX] === "2") {
                totalScore += 50
                if (timer !== undefined) {timer.clear()}
                if (flashInterval !== undefined) {flashInterval.clear()}
                bonusCounter = 200
                flashLoop = 0
                pac.speed = maxSpeedStart * levelData.frightPacSpeed - pacDotSpeedDecrease * currentGameEatenDots
                frightened = true
                ghosts.forEach((e) => {
                    e.frightened = true
                    e.speed = ghostSpeed * levelData.frightGhostSpeed
                })
                modeTimer.pause()
                timer = new Timer(() => {
                    flashInterval = new Timer(() => {
                        function flashGhost() {
                            flashLoop++
                            if (flashLoop === levelData.frightFlashes) {
                                resetFrightenedMode()
                                pac.speed = maxSpeedStart * levelData.pacSpeed - pacDotSpeedDecrease * currentGameEatenDots
                                modeTimer.resume()
                                clearInterval(flashInterval)


                            } else {
                                flashInterval = new Timer(() => {flashGhost()}, 300)
                            }
                        }
                        flashGhost()

                    }, 300)
                }, frightenedTime - 300 * levelData.frightFlashes)
            } else {
                totalScore += 10
            }
            map[currentY][currentX] = "0"
            document.getElementById(currentY + "|" + currentX).style.display = "none"
            currentGameEatenDots += 1
            currentLevelScore += 1
            if (currentLevelScore === 70 || currentLevelScore === 170) {
                showFruit()
            }
            pac.speed = pac.speed - pacDotSpeedDecrease
            document.getElementById("score").innerHTML = totalScore.toString()
            // next level
            if (dotsLeft() === 0) {
                cancelAnimationFrame(start)
                let frameFlashCount = 0
                let frameFlashInterval
                player.stop()
                // flash map
                setTimeout(() => {
                    ghosts.forEach(e => e.div.style.display = "none")
                    level++
                    document.getElementById("level").innerHTML = "Level: " + level.toString() 
                    frameFlashInterval = setInterval(() => {
                        if(frameFlashCount === 6) {
                            ghosts.forEach(e => e.div.style.display = "block")
                            resetGame()
                            setLevelData(level)
                            // set level story
                            if (level < 11) {
                                document.getElementById("story-background").style.display = "block"
                                document.getElementById("story-text").innerHTML = levelData.story
                                storyTextVisible = true
                            }
                            // remove dots, update current level score and draw new map
                            currentLevelScore = 0
                            map = getMap(level)
                            document.querySelectorAll(".small-dot").forEach((e) =>{
                                e.remove()
                            })
                            document.querySelectorAll(".big-dot").forEach((e) =>{
                                e.remove()
                            })
                            elroy = 0
                            drawMap(map)
                            drawTiles(map, "blue")
                            clearInterval(frameFlashInterval)
                        } else {
                            if (frameFlashCount % 2 === 0) {
                                drawTiles(map, "white")
                            } else {
                                drawTiles(map, "blue")
                            }
                            frameFlashCount++
                        }
                    }, 300)
                }, 1000);
            }
        }
    }
}

function dotsLeft() {
    let count = 0
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map.length; j++) {
            let tile = map[i][j]
            if (tile === "1" || tile === "2") {
                count++
            }
        }
    }
    return count
}


function pause() {
    timeElapsed += Date.now() - startTime
    modeTimer.pause()
    if (timer !== undefined && flashLoop === 0) {timer.pause()}
    if (flashInterval !== undefined && flashLoop > 0) {flashInterval.pause()}
    if (fruitTimer !== undefined) {fruitTimer.pause()}
    document.getElementById("pause").innerHTML = "⏵"
    document.getElementById("pause").title = "play"
    pauseMode = true
    paused.style.visibility = 'visible'
    c.style.filter = 'blur(5px)'
    pacman.style.filter = 'blur(5px)'
    blinky.div.style.filter = 'blur(5px)'
    pinky.div.style.filter = 'blur(5px)'
    inky.div.style.filter = 'blur(5px)'
    clyde.div.style.filter = 'blur(5px)'
    document.getElementById("ready-text").style.filter = "blur(5px)"
    document.getElementById("game-over-text").style.filter = "blur(5px)"
    document.querySelectorAll(".small-dot").forEach(e => {
        e.style.filter = 'blur(5px)'
    })
    document.querySelectorAll(".big-dot").forEach(e => {
        e.style.filter = 'blur(5px)'
    })
    audioBeforePause = currentAudio
    playSound("pause")
    soundTimer = setTimeout(() => {
        playSound("pause_beat")
    }, 200)
}
function unPause() {
    startTime = Date.now()
    document.getElementById("pause").innerHTML = "⏸"
    document.getElementById("pause").title = "pause"
    modeTimer.resume()
    if (timer !== undefined && flashLoop === 0) {timer.resume()}
    if (flashInterval !== undefined && flashLoop > 0) {flashInterval.resume()}
    if (fruitTimer !== undefined) {fruitTimer.resume()}
    paused.style.visibility = 'hidden'
    c.style.filter = ''
    pacman.style.filter = ''
    blinky.div.style.filter = ''
    pinky.div.style.filter = ''
    inky.div.style.filter = ''
    clyde.div.style.filter = ''
    document.getElementById("ready-text").style.filter = ''
    document.getElementById("game-over-text").style.filter = ''
    document.querySelectorAll(".small-dot").forEach(e => {
        e.style.filter = ''
    })
    document.querySelectorAll(".big-dot").forEach(e => {
        e.style.filter = ''
    })
    pauseMode = false
    /clearTimeout(soundTimer)
    playSound(audioBeforePause)

}

function gameOver() {
    document.getElementById("game-over-text").style.display = "block"
    pac.div.remove()
    blinky.div.remove()
    pinky.div.remove()
    inky.div.remove()
    clyde.div.remove()
    player.stop()
    handleShowNameForm()
}

export function millisToMinutesAndSeconds(ms) {
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
    return (minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }

export function restart() {
    location.reload()
}

function playSound(audioFile, playOnce) {
    if (currentAudio !== audioFile) {
        player.setAudio(audioFile, playOnce)
        currentAudio = audioFile
    }
}

function resetGhostSpeed(ghost) {
    if (ghost.name === "blinky") {
        if (elroy === 2) {
            ghost.speed = maxSpeedStart * levelData.elroy2Speed
        } else if (elroy === 1) {
            ghost.speed = maxSpeedStart * levelData.elroy1Speed
        } else {
            ghost.speed = ghostSpeed
        }
    } else {
        ghost.speed = ghostSpeed
    }
}

function setLevelData(level) {
    levelData = (level >= 21 ? levels[20] : levels[level - 1])
    ghostSpeed = maxSpeedStart *  levelData.ghostSpeed
    pac.speed = maxSpeedStart * levelData.pacSpeed
    frightenedTime = levelData.frightTime * 1000
}

function showFruit() {
    if(fruitTimer !== undefined) {fruitTimer.clear()}
    let fruitElem = document.getElementById("fruit")
    fruitElem.style.backgroundImage = 'url("../static/img/pickups/' + levelData.bonus  + '.svg")'
    fruitElem.style.display = "block"
    map[17][13] = "fruit"
    map[17][14] = "fruit"
    fruitTimer = new Timer(() => {
        hideFruit()
    },10000)
}

function hideFruit() {
    document.getElementById("fruit").style.display = "none"
    map[17][13] = "0"
    map[17][14] = "0"
}

function handleShowNameForm() {
    showNameForm = true
    document.getElementById("name-form").style.display = "block"
    c.style.filter = 'blur(5px)'
    document.getElementById("ready-text").style.filter = "blur(5px)"
    document.getElementById("game-over-text").style.filter = "blur(5px)"
    document.querySelectorAll(".small-dot").forEach(e => {
        e.style.filter = 'blur(5px)'
    })
    document.querySelectorAll(".big-dot").forEach(e => {
        e.style.filter = 'blur(5px)'
    })
    document.getElementById("save-score").addEventListener("click", () => {
        saveScore()
    })
    document.getElementById("username").focus()
    if (localStorage.getItem("username") !== null) {
        document.getElementById("username").value = localStorage.getItem("username")
    }

}

function hideLevelStory() {
    document.getElementById("story-background").style.display = "none"
    storyTextVisible = false
}

function handleHideNameForm() {
    showNameForm = false
    document.getElementById("name-form").style.display = "none"
}
function saveScore() {
    if (document.getElementById("username").value.length !== 0) {
        let username = document.getElementById("username").value
        localStorage.setItem("username", username)
        socket.send(JSON.stringify({ name: username, score: totalScore, time: timeElapsed }))
        handleHideNameForm()
        setTimeout(() => {
            showScoreboard()
        },50)
    } else {
        document.getElementById("username").style.borderColor = "red"
    }
}

document.getElementById("pause").addEventListener("click", function() {
    if(pauseMode) {
        unPause()
    } else {
        pause()
    }
})
document.getElementById("continue").addEventListener("click", unPause)
document.getElementById("restart").addEventListener("click", restart)

document.addEventListener('keydown', (e) => {
    // if (!started && (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowUp')) {
    //   started = true
    //}
    if (showNameForm) {
        if (e.key === "Enter") {
            saveScore()
        }
        return
    }
    if (storyTextVisible && e.key === "Enter") {
        hideLevelStory()
    } else if (!pauseMode && !storyTextVisible) {
        if (e.key === 'ArrowRight') {
            pac.nextDirection = "R"
            pac.started = true
        } else if (e.key === "ArrowLeft") {
            pac.nextDirection = "L"
            pac.started = true
        } else if (e.key === "ArrowUp") {
            pac.nextDirection = "U"
            pac.started = true
        } else if (e.key === "ArrowDown") {
            pac.nextDirection = "D"
            pac.started = true
        } else if (e.key.toLowerCase() === "p") {
            pause()
        } else if (e.key.toLowerCase() === "r") {
            restart()
        } else if (e.key.toLowerCase() === "s" && totalScore === 0) {
            update()
            document.getElementById("start").remove()
            document.getElementById("start-background").remove()
        }
    } else if (e.key.toLowerCase() === "p") {
        if (pauseMode) {
            unPause()
        }
    }else if (e.key.toLowerCase() === "r") {
        restart()
    }
})

document.getElementById("story-ok").addEventListener("click", () => {
    hideLevelStory()
})

document.getElementById("start").addEventListener("click", () => {
    update()
    document.getElementById("start").remove()
    document.getElementById("start-background").remove()
})