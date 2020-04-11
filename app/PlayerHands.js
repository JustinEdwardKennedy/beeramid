import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap'
import Hand from './Hand'

class PlayerHands extends Component {
  constructor(props) {
    super(props)
    this.state = {
      players: props.players
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      players: nextProps.players
    })
  }

  render() {

    const playerHands = this.state.players.map(player => {
      let playerName
      if (player['isHost']) {
        playerName = (
          <b>{player['name']}</b>
        )
      } else {
        playerName = player['name']
      }

      return (
        <Row className="justify-content-between align-items-center">
          <Col xs={4} className="text-break">
            {playerName}
          </Col>
          <Col xs="auto">
            <Hand cards={player['cards']} />
          </Col>
        </Row>
      )
    })

    return (
      <Container fluid>
        {playerHands}
      </Container>
    )
  }
}

export default PlayerHands