'use strict'

var gPrevMoves = []
var gCurrIdx = null

function onUndo() {
    if (gCurrIdx < 0) return

    const moves = gPrevMoves[gCurrIdx]
    console.log('moves :', moves)

    moves.forEach(currMove => {
        const location = { i: currMove.i, j: currMove.j }
        console.log('location: ', location.i, location.j)

        if (gBoard[location.i][location.j].isRevealed) gGame.revealedCount--
        if (gBoard[location.i][location.j].isMarked) gGame.markedCount--

        gBoard[location.i][location.j] = currMove.cell
        console.log('after in undo:', gBoard[location.i][location.j]) // for Debug
        console.log('revealed Count after: ', gGame) // for Debug
        renderCell(location, EMPTY, false)
    })
    const removeMove = gPrevMoves.splice(gCurrIdx, 1) // for Debug
    console.log('removeMove: ', removeMove) // for Debug
    gCurrIdx--
}