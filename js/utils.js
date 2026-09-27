'use strict'

function renderBoard(mat, selector) {
    var strHTML = `<table border="0"><tbody>`
    for (var i = 0; i < mat.length; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < mat[0].length; j++) {
            const cell = mat[i][j]
            const className = `cell cell-${i}-${j}`
            // const cellContent = (cell.isMine || cell.minesAroundCount === 0) ? '' : cell.minesAroundCount
            strHTML += `<td class="${className}" onclick="onCellClicked(this, ${i} , ${j})" oncontextmenu="onCellMarked(event,this, ${i}, ${j})"></td>`
        }
        strHTML += `</tr>`
    }
    strHTML += `</tbody></table>`


    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

// Updates cell content in the DOM and marks it visually as revealed
function renderCell(location, value, isRevealed = true) {
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
    elCell.classList.toggle('revealed', isRevealed)
}

function scanNeighbors(board, cellI, cellJ, onCell) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            // if (i === cellI && j === cellJ) continue
            const cell = board[i][j]

            // Execute the callback action on the valid neighbor cell 
            onCell({ i, j }, cell)
        }
    }
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function startTimer() {
    gStartTime = Date.now()
    if (gTimerInterval) clearInterval(gTimerInterval)
    gTimerInterval = setInterval(updateTimerDom, 31)
}

function updateTimerDom() {
    if (!gStartTime) return
    const elapasedTime = Date.now() - gStartTime
    const seconds = (elapasedTime / 1000).toFixed(2)
    const elTimer = document.querySelector('.timer')
    if (elTimer) elTimer.innerHTML = seconds
}

function stopTimer() {
    if (gTimerInterval) {
        clearInterval(gTimerInterval)
        gTimerInterval = null
    }
    if (!gStartTime) return 0

    const finalTimeInSeconds = ((Date.now() - gStartTime) / 1000).toFixed(2)
    const elTimer = document.querySelector('.timer')
    if (elTimer) elTimer.innerHTML = finalTimeInSeconds
    return +finalTimeInSeconds
}

function resetTimer() {
    stopTimer()
    gStartTime = null
    const elTimer = document.querySelector('.timer')
    if (elTimer) elTimer.innerText = '0.00'
}

function renderBestScore() {
    const bestScore = sessionStorage.getItem('bestScore')
    const elBestScore = document.getElementById('best-score')
    if (!elBestScore) return
    elBestScore.innerText = bestScore ? bestScore : '-'
}

function renderSafeCount(num) {
    const elSafeCount = document.querySelector('.safe-count')
    elSafeCount.innerText = num
}

function onDark() {
    console.log('is very dark')
    document.body.classList.toggle('dark-mode')

    const isDark = document.body.classList.contains('dark-mode')

    sessionStorage.setItem('isDarkMode', JSON.stringify(isDark))
}