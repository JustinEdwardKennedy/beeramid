import React, { Component } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import Cookies from 'universal-cookie'

class PreLobby extends Component {
  constructor(props) {
    super(props)
    this.state = {
      socket: props.socket,
      name: null
    }
  }

  nameChange(event) {
    this.setState({
      name: event.target.value
    })
  }

  enterName(event) {
    event.preventDefault()
    if (this.state.name) {
      this.state.socket.emit('name', {
        name: this.state.name
      }, ack => {
        const cookies = new Cookies()
        cookies.set('name', this.state.name, { path: '/' })
      })
    }
  }

  render() {
    return (
      <Container fluid>
        <Row>
          <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }} className="text-center">
          <Form onSubmit={this.enterName.bind(this)}>
            <Form.Group>
              <Form.Label><h1>Name</h1></Form.Label>
              <Form.Control type="text" placeholder="ex: big time" onChange={this.nameChange.bind(this)} />
            </Form.Group>
            <Button variant="primary" type="submit">
              Enter Lobby
            </Button>
          </Form>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default PreLobby
