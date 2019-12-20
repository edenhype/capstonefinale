export default function initUI(scoreDisplaySelector, namePromptContainerSelector) {
  const scoreDisplay = document.querySelector(scoreDisplaySelector)
  const namePromptContainer = document.querySelector(namePromptContainerSelector)
  const nameInput = namePromptContainer.querySelector('.name-input')

  let playerScore = 0
  
  let playerID = localStorage.getItem('playerID')
  let playerName = localStorage.getItem('playerName')

  playerName && (nameInput.value = playerName) && nameInput.select()

  const onNameInputCBs = []
  nameInput.addEventListener("keyup", e =>
    e.code === 'Enter' && onNameInputCBs.forEach(cb => cb(nameInput.value)))

  return {
    scoreDisplay,
    namePromptContainer,
    nameInput,
    playerScore,
    playerID,
    playerName,
    onNameInputCBs,
    onNameInput(nameInputCB) {
      this.onNameInputCBs.push(nameInputCB)
    },
    register(data) {
      this.playerID = data[0]
      this.playerName = data[1]
      
      this.namePromptContainer.classList.add('hide')

      localStorage.setItem('playerID', this.playerID)
      localStorage.setItem('playerName', this.playerName)
    },
    updateScoreboard(hgihScoreEntities) {
      let tackOnPlayerScore = 1

      this.scoreDisplay.innerHTML = ''

      hgihScoreEntities.forEach((ent, i) => {
        if (ent.eID === this.playerID) tackOnPlayerScore = 0

        this.scoreDisplay.innerHTML +=
          `<p ${ent.eID === this.playerID && ('playerScore')}>
            ${!i && ('👑 ') + ent.name}: ${ent.score} points
          </p>`
      })

      if (tackOnPlayerScore)
        this.scoreDisplay.innerHTML +=
          `<p class='playerScore tackedOn'>
            (your score: ${this.playerScore})
          </p>`
    }
  }
}