'use strict'

function handleMineClick(elCell) {
    --gLevel.liveCount // MODEL
    renderLives() // DOM
    revealMineDOM(elCell)

}

function revealMineDOM(elCell) {
    if (elCell.mineTimeout) clearTimeout(elCell.mineTimeout) // MODEL

    //DOM
    elCell.classList.add('mine-hit')
    elCell.mineTimeout = setTimeout(() => {
        elCell.classList.remove('mine-hit')
    }, 1500)
}

function renderLives() {
    const elLives = document.querySelector('.lives span')
    if (elLives) elLives.innerText = gLevel.liveCount
}

