'use strict'

const HINT = '💡'
var gHintTimeOut = null

function handleHintClick(elBtn, hintIdx) {
    console.log('the hint that click is: ', hintIdx)
    if (gGame.isVictory) return
    // Consumes a hint button, toggles hint mode, and applies visual indicator to board cells.
    if (elBtn) {
        // MODEL
        gGame.isHint = true
        gLevel.hintCount--
        // DOM
        elBtn.remove()
        document.querySelectorAll('.cell').forEach(elCell => elCell.classList.add('cell-hint'))
    }
}



function onHint(board, cellI, cellJ) {
    // MODEL
    gGame.isHint = false
    //DOM
    revealNeighbors(board, cellI, cellJ)
    document.querySelectorAll('.cell').forEach(elCell => elCell.classList.remove('cell-hint'))
}

function revealNeighbors(board, cellI, cellJ) {
    //// Cancel any pending hint timer to prevent overlapping callbacks if a new hint is triggered rapidly
    if (gHintTimeOut) {
        clearTimeout(gHintTimeOut)
        gHintTimeOut = null
    }
    scanNeighbors(board, cellI, cellJ, function (location, cell) {
        if (cell.isMarked || cell.isRevealed) return
        if (cell.isMine) renderCell(location, MINE, true)
        else if (cell.minesAroundCount > 0) renderCell(location, cell.minesAroundCount, true)
        else if (cell.minesAroundCount === 0) renderCell(location, EMPTY, true)
    })

    gHintTimeOut = setTimeout(() => {
        scanNeighbors(board, cellI, cellJ, function (location, cell) {

            //Ignore cells that were already revealed or flagged before the hint
            if (!cell.isRevealed && !cell.isMarked) {
                renderCell(location, EMPTY, false)

                // Remove 'revealed' class added by renderCell, as hint exposure is temporary
                // const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
                // elCell.classList.remove('revealed')
            }
        })
    }, 1500)
}

function renderHint(num) {
    var strHTML = ''
    for (var i = 0; i < num; i++) {
        strHTML += `<div class="all-hint hint-num-${i + 1}" onclick="handleHintClick(this , ${i + 1})">${HINT}</div>`
    }
    // console.log('strHTML: ', strHTML)
    const elHint = document.querySelector('.hint')
    elHint.innerHTML = strHTML
}