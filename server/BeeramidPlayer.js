const GamePlayer = require('./GamePlayer')

module.exports = class BeeramidPlayer extends GamePlayer {
  constructor(player) {
    super(player)
    this.cards = []
    this.nextStage = null
    this.exposeCard = null
  }

  setCards(cards) {
    this.cards = cards
    this.cards.forEach(card => {
      card['expose'] = false
      card['new'] = false
    })
  }

  getCards() {
    return this.cards
  }

  hasAnyExposedOrNewCards() {
    let hasAny = false
    this.cards.forEach(card => {
      if (card['expose'] || card['new']) {
        hasAny = true
      }
    })
    return hasAny
  }

  expose(index) {
    this.cards[index]['expose'] = true
  }

  replace(index, card) {
    card['expose'] = false
    card['new'] = true
    this.cards[index] = card
  }

  hide(index) {
    this.cards[index]['new'] = false
  }

  setNextStage(nextStage) {
    this.nextStage = nextStage
  }

  setExposeCard(exposeCard) {
    this.exposeCard = exposeCard
  }

  initializeCustomListeners() {
    this.player.getSocket().on('nextStage', () => {
      if (this.isHost) {
        this.nextStage()
      }
    })
    this.player.getSocket().on('exposeCard', (data) => {
      this.exposeCard(this, data['index'])
    })
  }

  removeCustomListeners() {
    this.player.getSocket().removeAllListeners(['nextStage', 'exposeCard'])
  }

}
