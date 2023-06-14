import { levels } from "./levels.js"
import { map1, map2, map3 } from "./maps.js"

// double border
// q = arc down-right, w = arc down-left, e = arc up-right, r = arc up-left, t = horizontal, y = vertical, u = horizontal and down-left, 
// i = horizontal and down-right, o = vertical and down-right, p = vertical and up-right, a = vertical and down-left, s = vertical and up-left
let doubleBorders = ["q", "w", "lc", "r", "lch", "lov", "u", "i", "o", "p", "a", "s", "lch2", "liv", "uh", "t", "y", "qr", "rbr", "blc", "lcc", "lr", "e"]
// inner border
// d = vertical, f = horizontal, g = down-right, h = down-left, j = up-right, k = up-left
let innerBorder = ["d", "f", "g", "h", "j", "k"]
//ghost-house
// z = down-right, x = down-left, c = up-right, v = up-left, b = horizontal, n = vertical, m = ghost door
let ghostHouse = ["z", "x", "c", "v", "b", "n", "m", "hhur", "hhul", "hvr"]
// empty = 0, dot = 1, powerup = 2, blocked = 3
let other = ["0", "1", "2", "3"]

export let startMap = []

const lineThickness = 3
const mapBorderColor = "blue"
export const mapSize = 20

export function getMap(level) {
    const levelData = (level >= 21 ? levels[20] : levels[level - 1])
    startMap = levelData.map
    if (levelData.frightTime === "") {
        return JSON.parse(JSON.stringify(startMap).replaceAll("2", "1"))
    } else {
        return JSON.parse(JSON.stringify(startMap))
    }
}

export function drawTiles(map, color) {
    let parent = document.getElementById("map")
    parent.innerHTML = ""
    let mapDiv = document.createElement("div")
    mapDiv.classList.add("tile-map")
    for (let i = 0; i < map.length; i++) {
        let row = document.createElement("div")
        row.classList.add("tile-row")
        for (let j = 0; j < map[i].length; j++) {
            let elem = map[i][j]
            let img = document.createElement("img")
            img.src = "../static/img/tiles/" + (color === "white" ? "white/" : "") + elem + ".png"
            row.appendChild(img)
        }
        mapDiv.appendChild(row)
    }
    parent.appendChild(mapDiv)
}

export function drawMap(map) {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            let leftMargin
            let topMargin
            switch (map[i][j]) {
                case '1':
                    leftMargin = j * mapSize + 7
                    topMargin = i * mapSize + 7
                    let smallDot = document.createElement('div')
                    smallDot.className = 'small-dot'
                    smallDot.style.left = (leftMargin.toString() + "px")
                    smallDot.style.top = (topMargin.toString() + "px")
                    smallDot.setAttribute("id", i + "|" + j)
                    document.getElementById("dots").append(smallDot)
                    break
                case '2':
                    let bigDot = document.createElement('div')
                    bigDot.className = 'big-dot'
                    leftMargin = j * mapSize + 2
                    topMargin = i * mapSize + 2
                    bigDot.style.left = leftMargin.toString() + "px"
                    bigDot.style.top = topMargin.toString() + "px"
                    bigDot.setAttribute("id", i + "|" + j)
                    document.getElementById("dots").append(bigDot)
                    break
            }
        }
    }
}