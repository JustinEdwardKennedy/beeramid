import React, { Component } from 'react';
import { Container, Row, Col, Button, Modal, Alert } from 'react-bootstrap'
import DeckAndPickupPile from './DeckAndPickupPile'
import AustraliaHand from './AustraliaHand'
import AustraliaCards from './AustraliaCards'
import AustraliaPlayers from './AustraliaPlayers'

const RANK_ORDER = ['3', '4', '5', '6', '7', '8', '9', 'J', 'Q', 'K', 'A']
const TWO = '2'
const TEN = '10'

class Australia extends Component {
  constructor(props) {
    super(props)
    this.state = {
      socket: props.socket,
      name: props.name,
      players: [],
      isHost: false,
      hand: [],
      pickupPile: [],
      deckLeft: 52,
      topCards: [],
      bottomCards: [null, null, null],
      currentPlayer: false,
      previousPlayer: false,
      ready: false,
      selectedCards: {
        'hand': [],
        'topCards': [],
        'bottomCards': []
      },
      round: "Round 1",
      out: false,
      won: false,
      winner: null,
      clearAlert: null
    }

    this.state.socket.on('gameUpdate', (data) => this.gameUpdate(data))
  }

  gameUpdate(data) {
    this.setState({
      name: data.name,
      players: data.players,
      isHost: data.isHost,
      hand: data.hand,
      pickupPile: data.pickupPile,
      deckLeft: data.deckLeft,
      topCards: data.topCards,
      bottomCards: data.bottomCards,
      currentPlayer: data.currentPlayer,
      previousPlayer: data.previousPlayer,
      ready: data.ready,
      round: data.round,
      out: data.out,
      won: data.won,
      winner: data.winner,
      clearAlert: data.clearAlert
    })
  }

  endGame() {
    this.state.socket.emit('endGame', {})
  }

  clickDeck() {
    if (!this.state.ready) {
      return
    }
    this.state.socket.emit('clickDeck', {})
  }

  setTopCards() {
    if (this.state.selectedCards['hand'].length < 3) {
      return
    }
    this.state.socket.emit('setTopCards', {
      indices: this.state.selectedCards['hand']
    })
    this.setState({
      selectedCards: {
        'hand': [],
        'topCards': [],
        'bottomCards': []
      }
    })
  }

  pickup() {
    this.state.socket.emit('pickup', {})
  }

  play() {
    this.state.socket.emit('play', {
      'hand': this.state.selectedCards['hand'],
      'topCards': this.state.selectedCards['topCards'],
      'bottomCards': this.state.selectedCards['bottomCards']
    })
    this.setState({
      selectedCards: {
        'hand': [],
        'topCards': [],
        'bottomCards': []
      }
    })
  }

  selectCard(where, cardIndex) {

    // Replicate data structure
    const selectedCards = {}
    selectedCards['hand'] = this.state.selectedCards['hand'].slice()
    selectedCards['topCards'] = this.state.selectedCards['topCards'].slice()
    selectedCards['bottomCards'] = this.state.selectedCards['bottomCards'].slice()

    // De-select
    if (this.state.selectedCards[where].includes(cardIndex)) {
      const i = this.state.selectedCards[where].indexOf(cardIndex)
      selectedCards[where].splice(i, 1)
      this.setState({
        selectedCards: selectedCards
      })

    // Select
    } else {

      // Choose top cards
      if (!this.state.ready && (where !== 'hand' || this.state.selectedCards['hand'].length >= 3)) {
        return

      // Validate Hand Selection
      } else if (this.state.ready && where === 'hand' && !this.canHandCardBeSelected(cardIndex)) {
        return

      // Validate Top Card Selection
      } else if (this.state.ready && where === 'topCards' && !this.canTopCardBeSelected(cardIndex)) {
        return

      // Validate Bottom Card Selection
      } else if (this.state.ready && where === 'bottomCards' && !this.canBottomCardBeSelected(cardIndex)) {
        return
      }
      selectedCards[where] = selectedCards[where].concat(cardIndex)
      this.setState({
        selectedCards: selectedCards
      })
    }
  }

  isSameRankAsAlreadySelectedCards(where, rank) {
    return this.state.selectedCards[where].every(c => this.state[where][c]['rank'] == rank)
  }

  isRankHigherThanOrEqualToLastPickupCard(rank) {
    if (this.state.pickupPile.length > 0) {
      if (this.state.pickupPile[0]['rank'] == TWO || this.state.pickupPile[0]['rank'] == TEN || rank == TWO || rank == TEN) {
        return true
      } else {
        return RANK_ORDER.indexOf(rank) >= RANK_ORDER.indexOf(this.state.pickupPile[0]['rank'])
      }
    }
    return true
  }

  canHandCardBeSelected(cardIndex) {
    const rank = this.state.hand[cardIndex]['rank']
    if (this.state.selectedCards['hand'].length > 0 && !this.isSameRankAsAlreadySelectedCards('hand', rank)) {
      return false
    }
    if (this.state.selectedCards['topCards'].length > 0 && !this.isSameRankAsAlreadySelectedCards('topCards', rank)) {
      return false
    }
    if (!this.isRankHigherThanOrEqualToLastPickupCard(rank)) {
      return false
    }
    return true
  }

  canTopCardBeSelected(cardIndex) {
    if (this.state.hand.length == 0 && this.state.topCards.length == 0) {
      return true
    }

    const rank = this.state.topCards[cardIndex]['rank']

    if (!this.isRankHigherThanOrEqualToLastPickupCard(rank)) {
      return false
    }

    const allCardsInHandSelected = this.state.hand.length == this.state.selectedCards['hand'].length
    const allCardsInHandSameAsTopCard = this.state.hand.length > 0 ? this.state.hand.every(c => c['rank'] == rank) : true
    const allSelectedTopCardsSameRank = this.state.selectedCards['topCards'].every(c => this.state.topCards[c]['rank'] == rank)

    if (allCardsInHandSelected && allCardsInHandSameAsTopCard && allSelectedTopCardsSameRank) {
      return true
    }
    return false
  }

  canBottomCardBeSelected() {
    if (this.state.hand.length == 0 && this.state.topCards.every(c => c == null) && this.state.selectedCards['bottomCards'].length == 0) {
      return true
    }
    return false
  }

  render() {

    let roundOrClearAlert
    if (this.state.clearAlert) {
      roundOrClearAlert = (
        <Alert variant="primary">
          {this.state.clearAlert}
        </Alert>
      )
    } else {
      roundOrClearAlert = (
        <h3>
          {this.state.round}
        </h3>
      )
    }

    let setOrPlayButton
    if (this.state.ready) {
      if (this.state.selectedCards['hand'].length > 0 || this.state.selectedCards['topCards'].length > 0 || this.state.selectedCards['bottomCards'].length > 0) {
        let setOrPlayButtonName
        if (this.state.selectedCards['hand'].length + this.state.selectedCards['topCards'].length > 1) {
          setOrPlayButtonName = 'Play Cards'
        } else {
          setOrPlayButtonName = 'Play Card'
        }
        setOrPlayButton = (
          <Row>
            <Col className="text-center">
              <Button variant="primary" onClick={this.play.bind(this)}>
                {setOrPlayButtonName}
              </Button>
            </Col>
          </Row>

        )
      }
    } else {
      if (this.state.selectedCards['hand'].length === 3) {
        setOrPlayButton = (
          <Row>
            <Col className="text-center">
              <Button variant="primary" onClick={this.setTopCards.bind(this)}>
                Set Top Cards
              </Button>
            </Col>
          </Row>
        )
      }
    }

    let finalHr
    let endButton
    let modalFooter
    if (this.state.isHost) {
      finalHr = (<hr />)
      endButton = (
        <Button variant="primary" onClick={this.endGame.bind(this)}>
          End Game
        </Button>
      )
      modalFooter = (
        <Modal.Footer>
          <Container fluid>
            <Col className="text-center">
              {endButton}
            </Col>
          </Container>
        </Modal.Footer>
      )
    }

    let blinkingAttributes = {}
    if (this.state.currentPlayer) {
      blinkingAttributes['className'] = 'current-player'
    }

    let playerArea
    if (this.state.won) {
      playerArea = (
        <Row>
          <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }} className="text-center">
            <p>
              On to the next round...
            </p>
          </Col>
        </Row>
      )
    } else if (this.state.out) {
      playerArea = (
        <Row>
          <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }} className="text-center">
            <p>
              You suck
            </p>
          </Col>
        </Row>
      )
    } else {
      let handArea
      if (this.state.hand.length > 0) {
        handArea = (
          <div>
            <Row>
              <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }} className="text-center">
                <p {...blinkingAttributes}>Hand</p>
              </Col>
            </Row>
            <Row>
              <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }} className="text-center">
                <AustraliaHand
                  selectCard={this.selectCard.bind(this)}
                  hand={this.state.hand}
                  selectedCards={this.state.selectedCards['hand']}
                />
              </Col>
            </Row>
          </div>
        )
      } else {
        handArea = (
          <div></div>
        )
      }
      playerArea = (
        <div>
          <Row>
            <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }} className="text-center">
              <p {...blinkingAttributes}>Final Cards</p>
            </Col>
          </Row>
          <Row>
            <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }} className="text-center">
              <AustraliaCards
                selectCard={this.selectCard.bind(this)}
                topCards={this.state.topCards}
                bottomCards={this.state.bottomCards}
                selectedTopCards={this.state.selectedCards['topCards']}
                selectedBottomCards={this.state.selectedCards['bottomCards']}
              />
            </Col>
          </Row>
          {handArea}
          {setOrPlayButton}
        </div>
      )
    }

    return (
      <Container fluid>
        <Row>
          <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }} className="text-center">
            {roundOrClearAlert}
          </Col>
        </Row>
        <Row>
          <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
            <DeckAndPickupPile
              clickDeck={this.clickDeck.bind(this)}
              pickup={this.pickup.bind(this)}
              deckLeft={this.state.deckLeft}
              pickupPile={this.state.pickupPile}
            />
          </Col>
        </Row>
        <hr />
        {playerArea}
        <hr />
        <Row>
          <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }} className="text-center">
            <AustraliaPlayers
              players={this.state.players}
            />
          </Col>
        </Row>
        {finalHr}
        <Row>
          <Col className="text-center">
            {endButton}
          </Col>
        </Row>
        <Row></Row>
        <Modal show={this.state.winner != null} centered>
          <Modal.Header className="text-center">
            <Modal.Title className="black-text w-100">
              {this.state.winner + ' won a ring'}
            </Modal.Title>
          </Modal.Header>
          {modalFooter}
      </Modal>
      </Container>
    )
  }
}

export default Australia
