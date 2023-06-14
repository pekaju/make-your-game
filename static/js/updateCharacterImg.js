let framePositions = [0, 37, 74, 111, 148, 185, 222, 259, 296, 333, 370, 407]
let pacCurrentFrameIndex = 0
let charCurrentFrameIndex = 0
let deathStarted = false

export function updateCharacterImg(character, flashLoop, elroy) {
    let char = character.name
    let blinkyMood = (character.name === "blinky" ? (elroy === 0 ? "" : (elroy === 1 ? "_annoyed" : "_angry")) : "")
    if (char === "pacman") {
        if (character.dying) {
            if (!deathStarted) {
                pacCurrentFrameIndex = 0
            }
            character.div.style.backgroundImage = 'url("../static/img/pacman/pacman_death.svg")'
            character.div.style.backgroundPosition = "-" + framePositions[pacCurrentFrameIndex] + "px 0px"
            deathStarted = true
            if (pacCurrentFrameIndex > 10) {
                pacCurrentFrameIndex = 0
            } else {
                pacCurrentFrameIndex++
            }
        } else {
            if (pacCurrentFrameIndex > 3) {
                pacCurrentFrameIndex = 0
            }
            deathStarted = false
            switch (character.direction) {
                case "L":
                    character.div.style.backgroundImage = 'url("../static/img/pacman/pacman_left.svg")'
                    break;
                case "R":
                    character.div.style.backgroundImage = 'url("../static/img/pacman/pacman_right.svg")'
                    break;
                case "U":
                    character.div.style.backgroundImage = 'url("../static/img/pacman/pacman_up.svg")'
                    break;
                case "D":
                    character.div.style.backgroundImage = 'url("../static/img/pacman/pacman_down.svg")'
                    break;
            }
            character.div.style.backgroundPosition = framePositions[pacCurrentFrameIndex].toString() + "px 0px"
            if (pacCurrentFrameIndex > 2) {
                pacCurrentFrameIndex = 0
            } else {
                pacCurrentFrameIndex++
            }
        }
    } else {
        if (character.frightened === true) {
            if (flashLoop % 2 === 0) {
                character.div.style.backgroundImage = 'url("../static/img/scared/scared_blue.svg")'
            } else {
                character.div.style.backgroundImage = 'url("../static/img/scared/scared_white.svg")'
            }
        } else {
            switch (character.direction) {
                case "L":
                    if (character.returnToHouse) {
                        character.div.style.backgroundImage = 'url("../static/img/eyes/eyes_left.svg")'
                    } else {
                        character.div.style.backgroundPosition = "0px 0px"
                        character.div.style.backgroundImage = 'url("../static/img/' + char + '/' + char + '_left' + blinkyMood + '.svg")'
                        charCurrentFrameIndex = 0
                    }
                    break;
                case "R":
                    if (character.returnToHouse) {
                        character.div.style.backgroundImage = 'url("../static/img/eyes/eyes_right.svg")'
                    } else {
                        character.div.style.backgroundPosition = "0px 0px"
                        character.div.style.backgroundImage = 'url("../static/img/' + char + '/' + char + '_right' + blinkyMood + '.svg")'
                        charCurrentFrameIndex = 0
                    }
                    break;
                case "U":
                    if (character.returnToHouse) {
                        character.div.style.backgroundImage = 'url("../static/img/eyes/eyes_up.svg")'
                    } else {
                        character.div.style.backgroundPosition = "0px 0px"
                        character.div.style.backgroundImage = 'url("../static/img/' + char + '/' + char + '_up' + blinkyMood + '.svg")'
                        charCurrentFrameIndex = 0
                    }
                    break;
                case "D":
                    if (character.returnToHouse) {
                        character.div.style.backgroundImage = 'url("../static/img/eyes/eyes_down.svg")'
                    } else {
                        character.div.style.backgroundPosition = "0px 0px"
                        character.div.style.backgroundImage = 'url("../static/img/' + char + '/' + char + '_down' + blinkyMood + '.svg")'
                        charCurrentFrameIndex = 0
                    }
                    break;
            }
        }
        if (charCurrentFrameIndex < 4) {
            character.div.style.backgroundPosition = "0px 0px"
        } else {
            character.div.style.backgroundPosition = "38px 0px"
        }
        if (charCurrentFrameIndex === 7) {
            charCurrentFrameIndex = 0
        } else {
            charCurrentFrameIndex++
        }
    }
}