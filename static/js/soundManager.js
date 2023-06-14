let audio = new Audio()

export function playGameStart() {
    return new Promise(res=>{
        let startAudio = new Audio("../static/audio/game_start.mp3");
        startAudio.play()
        startAudio.onended = res
      })
}

export function playFruitEat() {
        let fruitAudio = new Audio("../static/audio/fruit.mp3");
        fruitAudio.play()
}

export function PlayAudio() {
    let loop, lastFile
    let playOnceValue
    this.setAudio = function (audioFile, playOnce) {
        playOnceValue = playOnce
        clearInterval(loop)
        lastFile = audioFile
        audio.src = "../static/audio/" + audioFile + ".mp3"
        if (playOnce) {
            audio.play()
        } else {
            loop = setInterval(() => {
                audio.volume = 0.5
                audio.play()
            }, (audio.duration-0.2) * 1000)
        }
    }
    this.stop = function () {
        clearInterval(loop)
    }

    this.resume = function () {
        this.setAudio(lastFile, false)
    }

    this.unpause = function () {
        if (playOnceValue) {
            if (!audio.paused) {
                audio.play()
            }
        } else {
            this.resume()
        }
    }

    this.pause = function () {
        audio.pause()
        clearInterval(loop)
    }
}