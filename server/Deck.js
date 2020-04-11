const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const SUITS = ['S', 'H', 'C', 'D']

module.exports = class Deck {
  constructor() {
    this.cards = []
    this.initializeDeck()
    this.shuffle()
  }

  initializeDeck() {
    RANKS.forEach(rank => {
      SUITS.forEach(suit => {
        this.cards.push({
          rank: rank,
          suit: suit
        })
      })
    })
  }

  shuffle() {
    let j, x, i
    for (let i = this.cards.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1))
      x = this.cards[i]
      this.cards[i] = this.cards[j]
      this.cards[j] = x
    }
  }

  getCards(n) {
    if (n === 1) {
      return this.cards.pop()
    } else {
      let cards = []
      Array.from(Array(n)).map((_, i) => {
        cards.push(this.cards.pop())
      })
      return cards
    }
  }
}
