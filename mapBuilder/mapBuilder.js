
const originalMap = [
    ["q", "uh", "uh", "uh", "uh", "uh", "uh", "uh", "uh", "uh", "uh", "uh", "uh", "u", "i", "uh", "uh", "uh", "uh", "uh", "uh", "uh", "uh", "uh", "uh", "uh", "uh", "w"],
    ["lov", "1", "1", "1", "1" ,"1", "1", "1", "1", "1", "1", "1", "1", "d", "d", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "y"],
    ["lov", "1", "g", "f", "f", "h", "1", "g", "f", "f", "f", "h", "1", "d", "d", "1", "g", "f", "f", "f", "h", "1", "g", "f", "f", "h", "1", "y"],
    ["lov", "2", "d", "0", "0", "d", "1", "d", "0", "0", "0", "d", "1", "d", "d", "1", "d", "0", "0", "0", "d", "1", "d", "0", "0", "d", "2", "y"],
    ["lov", "1", "j", "f", "f", "k", "1", "j", "f", "f", "f", "k", "1", "j", "k", "1", "j", "f", "f", "f", "k", "1", "j", "f", "f", "k", "1", "y"],
    ["lov", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "y"],
    ["lov", "1", "g", "f", "f", "h", "1", "g", "h", "1", "g", "f", "f", "f", "f", "f", "f", "h", "1", "g", "h", "1", "g", "f", "f", "h", "1", "y"],
    ["lov", "1", "j", "f", "f", "k", "1", "d", "d", "1", "j", "f", "f", "h", "g", "f", "f", "k", "1", "d", "d", "1", "j", "f", "f", "k", "1", "y"],
    ["lov", "1", "1", "1", "1", "1", "1", "d", "d", "1", "1", "1", "1", "d", "d", "1", "1", "1", "1", "d", "d", "1", "1", "1", "1", "1", "1", "y"],
    ["lc", "lch", "lch", "lch", "lch", "lcc", "1", "d", "j", "f", "f", "h", "0", "d", "d", "0", "g", "f", "f", "k", "d", "1", "qr", "lch", "lch", "lch", "lch", "r"],
    ["0", "0", "0", "0", "0", "liv", "1", "d", "g", "f", "f", "k", "0", "j", "k", "0", "j", "f", "f", "h", "d", "1", "y", "0", "0", "0", "0", "0"],
    ["0", "0", "0", "0", "0", "liv", "1", "d", "d", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "d", "d", "1", "y", "0", "0", "0", "0", "0"],
    ["0", "0", "0", "0", "0", "liv", "1", "d", "d", "0", "z", "hhul", "hhul", "m", "m", "hhul", "hhul", "x", "0", "d", "d", "1", "y", "0", "0", "0", "0", "0"],
    ["lch2", "lch2", "lch2", "lch2", "lch2", "lr", "1", "j", "k", "0", "n", "3", "3", "4", "4", "5", "5", "hvr", "0", "j", "k", "1", "e", "lch2", "lch2", "lch2", "lch2", "lch2"],
    ["0", "0", "0", "0", "0", "0", "1", "0", "0", "0", "n", "3", "3", "4", "4", "5", "5", "hvr", "0", "0", "0", "1", "0", "0", "0", "0", "0", "0"],
    ["lch", "lch", "lch", "lch", "lch", "lcc", "1", "g", "h", "0", "n", "3", "3", "4", "4", "5", "5", "hvr", "0", "g", "h", "1", "qr", "lch", "lch", "lch", "lch", "lch"],
    ["0", "0", "0", "0", "0", "liv", "1", "d", "d", "0", "c", "b", "b", "b", "b", "b", "b", "v", "0", "d", "d", "1", "y", "0", "0", "0", "0", "0"],
    ["0", "0", "0", "0", "0", "liv", "1", "d", "d", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "d", "d", "1", "y", "0", "0", "0", "0", "0"],
    ["0", "0", "0", "0", "0", "liv", "1", "d", "d", "0", "g", "f", "f", "f", "f", "f", "f", "h", "0", "d", "d", "1", "y", "0", "0", "0", "0", "0"],
    ["q", "lch2", "lch2", "lch2", "lch2", "lr", "1", "j", "k", "0", "j", "f", "f", "h", "g", "f", "f", "k", "0", "j", "k", "1", "e", "lch2", "lch2", "lch2", "lch2", "w"],
    ["lov", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "d", "d", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "y"],
    ["lov", "1", "g", "f", "f", "h", "1", "g", "f", "f", "f", "h", "1", "d", "d", "1", "g", "f", "f", "f", "h", "1", "g", "f", "f", "h", "1", "y"],
    ["lov", "1", "j", "f", "h", "d", "1", "j", "f", "f", "f", "k", "1", "j", "k", "1", "j", "f", "f", "f", "k", "1", "d", "g", "f", "k", "1", "y"],
    ["lov", "2", "1", "1", "d", "d", "1", "1", "1", "1", "1", "1", "1", "0", "0", "1", "1", "1", "1", "1", "1", "1", "d", "d", "1", "1", "2", "y"],
    ["p", "f", "h", "1", "d", "d", "1", "g", "h", "1", "g", "f", "f", "f", "f", "f", "f", "h", "1", "g", "h", "1", "d", "d", "1", "g", "f", "s"],
    ["o", "f", "k", "1", "j", "k", "1", "d", "d", "1", "j", "f", "f", "h", "g", "f", "f", "k", "1", "d", "d", "1", "j", "k", "1", "j", "f", "a"],
    ["lov", "1", "1", "1", "1", "1", "1", "d", "d", "1", "1", "1", "1", "d", "d", "1", "1", "1", "1", "d", "d", "1", "1", "1", "1", "1", "1", "y"],
    ["lov", "1", "g", "f", "f", "f", "f", "k", "j", "f", "f", "h", "1", "d", "d", "1", "g", "f", "f", "k", "j", "f", "f", "f", "f", "h", "1", "y"],
    ["lov", "1", "j", "f", "f", "f", "f", "f", "f", "f", "f", "k", "1", "j", "k", "1", "j", "f", "f", "f", "f", "f", "f", "f", "f", "k", "1", "y"],
    ["lov", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "y"],
    ["blc", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "rbr"]
]

let newMapValues=[]

let newMap = []
let currentRowTiles = []
let currentRow = 0
let currentColumn = 0


function drawEmptyMap() {
    if (newMapValues.length > 0) {
        newMap = newMapValues
    } else {
        for (let r = 0; r < 31; r++) {
            let row = []
            for (let c = 0; c < 28; c++) {
                if (r >= 11 && r <= 17 && c >= 9 && c <= 18) {
                    row.push(originalMap[r][c])
                } else {
                    row.push("empty")
                }
            }
            newMap.push(row)
        }
    }
}

function drawTiles(color, mapId, map) {
    let parent = document.getElementById(mapId)
    parent.innerHTML = ""
    let mapDiv = document.createElement("div")
    mapDiv.classList.add("tile-map")
    for (let i = 0; i < map.length; i++) {
        let row = document.createElement("div")
        row.classList.add("tile-row")
        for (let j = 0; j < map[i].length; j++) {
            let elem = map[i][j]
            let img = document.createElement("img")
            img.style.border = "0.5px solid " + (mapId === "map" ? "red" : "#ffff0063")
            img.style.cursor = "pointer"
            img.classList.add("tile")
            let id = i + "|" + j
            img.setAttribute("id", mapId + "|" + id)
            if (mapId === "map") {
                img.onclick = function () {setTile(elem)}
            } else {
                img.onclick = function () {setNewTileLocation(id)}
            }
            if (elem !== "empty") {img.src = "tiles/" + (color === "white" ? "white/" : "") + elem + ".png"}
            row.appendChild(img)
        }
        mapDiv.appendChild(row)
    }
    parent.appendChild(mapDiv)
}

function setTile(name) {
    newMap[currentColumn][currentRow] = name
    drawTiles("blue", "newMap", newMap)
    if (currentRow === 27) {
        currentRow = 0
        currentColumn++
    } else {
        currentRow++
    }
    document.getElementById("newMap|" + currentColumn + "|" + currentRow).style.border = "0.5px solid red"
}

function setNewTileLocation(location) {
    document.getElementById("newMap|" + currentColumn + "|" + currentRow).style.border = "0.5px solid #ffff0063"
    const l = location.split("|")
    currentColumn = l[0]
    currentRow = l[1]
    document.getElementById("newMap|" + location).style.border = "0.5px solid red"
}

drawEmptyMap()
drawTiles("blue", "map", originalMap)
drawTiles("blue", "newMap", newMap)

document.getElementById("copy").addEventListener("click", () => {
    copy()
})

function copy() {
    var formBlob = new Blob([JSON.stringify(newMap, null)], { type: 'text/plain' });
    console.log(newMap)
    open(window.URL.createObjectURL(formBlob), "_blank")
}