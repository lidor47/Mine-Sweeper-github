'use strict'
const MINE = '💣'
var gBoard
var gLevel
var gGame

function onInit() {
    gLevel = {
        SIZE: 4,
        MINES: 2
    }
    gGame = {
        isOn: false,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0
    }

    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')

}

function buildBoard() {
    const size = gLevel.SIZE
    const board = []

    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isRevealed: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    board[1][1].isMine = true
    board[3][2].isMine = true
    // randomMines(board, gLevel.MINES)

    setMinesNegsCount(board)


    return board
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            if (cell.isMine) continue
            cell.minesAroundCount = countMinesAround(board, i, j)
        }
    }
}

function countMinesAround(board, cellI, cellJ) {
    var minesCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === cellI && j === cellJ) continue
            const cell = board[i][j]
            if (cell.isMine) minesCount++
        }
    }
    return minesCount
}

function randomMines(board, num) {
    var minesCount = 0
    while (minesCount < num) {
        const randomI = getRandomIntInclusive(0, board.length - 1)
        const randomJ = getRandomIntInclusive(0, board.length - 1)
        const cell = board[randomI][randomJ]
        if (!cell.isMine) {
            cell.isMine = true
            minesCount++
        }
    }
}


function onCellClicked(elCell, i, j) {
    console.log('hey', i, j)
    console.log('cell: ', gBoard[i][j].minesAroundCount)
    const cell = gBoard[i][j]
    const location = { i, j }
    if (cell.isMine) {
        renderCell(location, MINE)
        cell.isRevealed = true
    }
    else if (cell.minesAroundCount > 0) {
        renderCell(location, cell.minesAroundCount)
        cell.isRevealed = true
    }
}

function onCellMarked(elCell, i, j) {
    // 1. מניעת פתיחת התפריט הקופץ של הדפדפן
    window.event.preventDefault()

    console.log('Right clicked on:', i, j)

    // כאן בהמשך תוסף הלוגיקה של הוספה/הסרה של דגל 🚩
}


function onRestart() {
    onInit()
}