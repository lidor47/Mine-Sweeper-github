'use strict'

var gSafeInterval = null

function onSafe(elBtn) {
    if (gGame.isVictory) return
    const elSpan = elBtn.querySelector('span')
    if (elSpan.innerText <= 0) return
    elSpan.innerText--
    console.log('safe')

    const cell = randomCell()
    onCell(cell)
}

function randomCell() {
    var cell
    while (!cell || cell.isMine || cell.isRevealed) {
        var randomI = getRandomIntInclusive(0, gBoard.length - 1)
        var randomJ = getRandomIntInclusive(0, gBoard[0].length - 1)
        cell = gBoard[randomI][randomJ]
    }
    return { location: { i: randomI, j: randomJ }, cell }
}

function onCell(cellData) {
    const location = cellData.location
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.classList.add('safe-mark')
    gSafeInterval = setTimeout(() => {
        elCell.classList.remove('safe-mark')
    }, 1500)
}