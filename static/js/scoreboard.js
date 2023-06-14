import { restart, millisToMinutesAndSeconds } from "./script.js"

let currentPage = 1
let totalPages
let dataValue

export function showScoreboard() {
    document.querySelector(".inner").style.display = "none"
    document.querySelector(".scoreboard").style.display = "block"
    currentPage = 1
    setPage()
}

async function getData() {
    const url = window.location.protocol + "//" + window.location.host + "/scores"
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    });
    dataValue = await response.json();
    dataValue = dataValue["Scores"]
    totalPages = (dataValue === null ? 0 : Math.ceil(dataValue.length / 5))

} 

export async function getHighScore() {
    let res
    await getData().then(() => {
        res = (dataValue === null ? 0 : dataValue[0]["score"])
    })
    return res
}

async function setPage() {
    await getData()
    document.getElementById("page").innerHTML = "PAGE " + currentPage + "/" + totalPages
    let data = (dataValue === null ? [] : dataValue.slice((currentPage-1) * 5, (currentPage-1) * 5 + 5))
    for (let i = 0; i < 5; i++) {
        if (i < data.length) {
            document.getElementById("rank" + (i + 1)).innerHTML = (currentPage - 1) * 5 + i + 1
            document.getElementById("name" + (i + 1)).innerHTML = data[i].name
            document.getElementById("score" + (i + 1)).innerHTML = data[i].score
            document.getElementById("time" + (i + 1)).innerHTML = millisToMinutesAndSeconds(data[i].time)
        } else {
            document.getElementById("rank" + (i + 1)).innerHTML = ""
            document.getElementById("name" + (i + 1)).innerHTML = ""
            document.getElementById("score" + (i + 1)).innerHTML = ""
            document.getElementById("time" + (i + 1)).innerHTML = ""
        }
    }
}

document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--
        setPage()
    }
})

document.getElementById("next-page").addEventListener("click", () => {
    if (currentPage < totalPages) {
        currentPage++
        setPage()
    }
})

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
        if (currentPage > 1) {
            currentPage--
            setPage()
        }   
    } else if (e.key === "ArrowRight") {
        if (currentPage < totalPages) {
            currentPage++
            setPage()
        }
    }
})

document.getElementById("scoreboard-start").addEventListener("click", () => {
    restart()
})