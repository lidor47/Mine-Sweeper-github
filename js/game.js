'use strict'
const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''
var gBoard
var gLevel = {
    SIZE: 4,
    MINES: 2,
    maxLives: 3,
    liveCount: 3,
    hintCount: 3,
    safeCount: 3
}
var gGame
var gTimerInterval
var gStartTime

function onInit() {

    resetTimer()

    //UNDO feature default
    gCurrIdx = -1
    gPrevMoves = []

    //Cancel running hint timer when resetting the game
    if (gHintTimeOut) {
        clearTimeout(gHintTimeOut)
        gHintTimeOut = null
    }
    if (gSafeInterval) {
        clearTimeout(gSafeInterval)
        gSafeInterval = null
    }

    closeModal() // // Hide the game over / victory modal window

    //Reset face emoji buttons to default state
    document.querySelectorAll('.restart, .rPlay').forEach(elBtn => elBtn.innerText = '😀')

    const isDarkSaved = JSON.parse(sessionStorage.getItem('isDarkMode'))
    if (isDarkSaved) document.body.classList.add('dark-mode')


    gLevel.liveCount = gLevel.maxLives

    gGame = {
        isOn: false,
        isVictory: false,
        isHint: false,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0
    }


    gBoard = buildBoard() //Each cell in this board is represented by an object structured like this:{
    // minesAroundCount: 0,
    // isRevealed: false,
    // isMine: false,
    // isMarked: false}
    renderBoard(gBoard, '.board-container')
    renderLives()
    gLevel.hintCount = 3
    renderHint(gLevel.hintCount)
    renderBestScore()
    renderSafeCount(gLevel.safeCount)

    const elBoardContainer = document.querySelector('.board-container')
    elBoardContainer.style.setProperty('--board-size', gLevel.SIZE)
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
    return board
}

// Manager function: Loops through the entire board and updates the 'minesAroundCount' property for every non-mine cell
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            if (cell.isMine) continue
            cell.minesAroundCount = countMinesAround(board, i, j)
        }
    }
}

// Helper function: Calculates and returns the number of surrounding mines for a single target cell
function countMinesAround(board, cellI, cellJ) {
    var minesCount = 0
    scanNeighbors(board, cellI, cellJ, function (location, cell) {
        if (location.i === cellI && location.j === cellJ) return
        if (cell.isMine) minesCount++
    })
    return minesCount
}

//  Randomly places mines on the board, ensuring the first-clicked cell is never a mine
function randomMines(num, cellI, cellJ) {
    var minesCount = 0
    while (minesCount < num) {
        const randomI = getRandomIntInclusive(0, gBoard.length - 1)
        const randomJ = getRandomIntInclusive(0, gBoard.length - 1)
        const cell = gBoard[randomI][randomJ]

        // If the selected cell is not the clicked cell and does not already contain a mine
        if (!(randomI === cellI && randomJ === cellJ) && (!cell.isMine)) {
            cell.isMine = true
            minesCount++
        }
    }
}


function onCellClicked(elCell, cellI, cellJ) {
    if (!gGame.isOn && gGame.revealedCount > 0) return

    const cell = gBoard[cellI][cellJ]

    // Ignore clicks on cells that are already revealed or flagged with a mine
    if (cell.isMarked || cell.isRevealed) return

    // This is actually the player's first click.
    if (!gGame.isOn) {
        randomMines(gLevel.MINES, cellI, cellJ)
        setMinesNegsCount(gBoard)
        gGame.isOn = true
        //console.log('this game started? ', gGame.isOn)
        startTimer()
    }

    // Trigger hint feature: briefly reveal cell neighbors without permanently uncovering them or setting off mines
    if (gGame.isHint) {
        onHint(gBoard, cellI, cellJ)
        return
    }

    //// for UNDO feature
    gCurrIdx++
    // gPrevMoves.push({ cell: { ...cellClicked }, i: cellI, j: cellJ })
    gPrevMoves[gCurrIdx] = []
    console.log('location: ', cellI, cellJ)
    console.log('clicked current Cell: ', gBoard[cellI][cellJ])
    console.log('revealed Count before: ', gGame)

    const location = { i: cellI, j: cellJ }
    if (cell.isMine) {
        // Handles the 3-lives feature: loses a life per mine click and triggers game over at zero lives.
        if (gLevel.liveCount > 1) {
            handleMineClick(elCell)
            console.log('current lives: ', gLevel.liveCount)

        } else {
            //MODEL
            --gLevel.liveCount // Decrement lives to zero
            console.log('current lives: ', gLevel.liveCount)
            cell.isRevealed = true
            console.log('cell mine isRevealed', cell.isRevealed)
            //DOM
            renderLives() // Update UI to show 0 lives
            renderCell(location, MINE, true)

            return gameOver()

        }
    } else {
        expandShown(gBoard, cellI, cellJ)
        isVictory()
    }
}


function onCellMarked(ev, elCell, i, j) {
    ev.preventDefault()
    if (!gGame.isOn) return
    const cell = gBoard[i][j]
    if (cell.isRevealed) return

    gCurrIdx++
    gPrevMoves[gCurrIdx] = []
    gPrevMoves[gCurrIdx].push({ cell: { ...cell }, i, j })

    if (!cell.isMarked) {
        //MODEL
        cell.isMarked = true
        gGame.markedCount++
        console.log('current marked: ', cell.isMarked, gGame.markedCount)
        //DOM
        elCell.innerText = FLAG
    } else {
        //MODEL
        cell.isMarked = false
        gGame.markedCount--
        console.log('current marked: ', cell.isMarked, gGame.markedCount)
        //DOM
        elCell.innerText = EMPTY
    }
    isVictory()
}

function isAllMinesMarked() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            if (cell.isMine && !cell.isMarked) return false
        }
    }
    return true
}

function isVictory() {
    // Calculate total number of non-mine cells required to win
    const cellsNonMines = (gLevel.SIZE * gLevel.SIZE) - gLevel.MINES
    //console.log('all cell without mines: ', cellsNonMines)

    // Validate that revealed cell count and flag count match target numbers
    const isCountValid = (gGame.revealedCount === cellsNonMines) &&
        (gGame.markedCount === gLevel.MINES)

    // Verify all flagged cells actually contain mines before triggering victory
    if (isCountValid && isAllMinesMarked()) {
        console.log('you victory')
        gGame.isVictory = true //MODEL
        gameOver()
    }
}

function gameOver() {
    console.log('Game Over')
    // MODEL
    gGame.isOn = false
    const finalTime = stopTimer()
    if (gGame.isVictory) checkAndUpdateBestScore(finalTime)
    //DOM
    var msg = gGame.isVictory ? 'You Won!!' : 'Game Over'
    var state = gGame.isVictory ? '😎' : '😞'
    openModal(msg, state)
}

function openModal(msg, smiley) {
    const elModal = document.querySelector('.modal')
    const elMsg = document.querySelector('.msg')
    document.querySelectorAll('.restart, .rPlay').forEach(elBtn => elBtn.innerText = smiley)
    elMsg.innerText = msg
    elModal.style.display = 'flex'
}

function closeModal() {
    const elModal = document.querySelector('.modal')
    elModal.style.display = 'none'

}

function checkAndUpdateBestScore(newTimeInSec) {
    const savedBestScore = sessionStorage.getItem('bestScore')
    const currBest = savedBestScore ? +savedBestScore : Infinity

    if (newTimeInSec > 0 && newTimeInSec < currBest) {
        sessionStorage.setItem('bestScore', newTimeInSec)
        renderBestScore()
        console.log('new best score')
    }
}

function expandShown(board, cellI, cellJ) {
    const cellClicked = board[cellI][cellJ]
    if (cellClicked.isMarked || cellClicked.isRevealed || cellClicked.isMine) return

    gPrevMoves[gCurrIdx].push({ cell: { ...cellClicked }, i: cellI, j: cellJ })


    cellClicked.isRevealed = true
    gGame.revealedCount++
    const cellMineAround = cellClicked.minesAroundCount
    const cellValue = cellMineAround > 0 ? cellMineAround : EMPTY
    renderCell({ i: cellI, j: cellJ }, cellValue, true)
    if (cellMineAround > 0) return

    scanNeighbors(board, cellI, cellJ, function (location, cell) {
        expandShown(board, location.i, location.j)
    })
}

function onChangeLevel(size, mine, live) {
    console.log('hello')
    if (gGame.isOn) return
    gLevel.SIZE = size
    gLevel.MINES = mine
    gLevel.maxLives = live
    onInit()
}