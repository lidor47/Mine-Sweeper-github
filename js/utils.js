'use strict'

function renderBoard(mat, selector) {
    var strHTML = `<table border="0"><tbody>`
    for (var i = 0; i < mat.length; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < mat[0].length; j++) {
            const cell = mat[i][j]
            const className = `cell cell-${i}-${j}`
            // const cellContent = (cell.isMine || cell.minesAroundCount === 0) ? '' : cell.minesAroundCount
            strHTML += `<td class="${className}" onclick="onCellClicked(this ,${i} , ${j})" oncontextmenu="onCellMarked(this, ${i}, ${j})"></td>`
        }
        strHTML += `</tr>`
    }
    strHTML += `</tbody></table>`


    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

function renderCell(location, value) {
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}


function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}