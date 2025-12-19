import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { getSuitDisplayName, getSuits } from '../../../utils/cardDefinitions';

class ThreatModal extends React.Component {
  static get propTypes() {
    return {
      playerID: PropTypes.any,
      G: PropTypes.any.isRequired,
      ctx: PropTypes.any.isRequired,
      moves: PropTypes.any.isRequired,
      names: PropTypes.any.isRequired,
      isOpen: PropTypes.bool.isRequired,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      description: '',
      mitigation: '',
      showMitigation: false,
    };
  }

  componentDidUpdate(prevProps) {
    const playerThreat = this.props.playerID
      ? this.props.G.threats[this.props.playerID]
      : null;
    const prevPlayerThreat = prevProps.playerID
      ? prevProps.G.threats[prevProps.playerID]
      : null;

    if (
      playerThreat &&
      prevPlayerThreat &&
      (prevPlayerThreat.title !== playerThreat.title ||
        prevPlayerThreat.description !== playerThreat.description ||
        prevPlayerThreat.mitigation !== playerThreat.mitigation)
    ) {
      this.setState({
        title: playerThreat.title,
        description: playerThreat.description,
        mitigation: playerThreat.mitigation,
      });
    }
  }

  saveThreat() {
    const playerThreat = this.props.playerID
      ? this.props.G.threats[this.props.playerID]
      : null;

    if (!playerThreat) return;

    for (let field in ['title', 'description', 'mitigation']) {
      if (playerThreat[field] !== this.state[field]) {
        this.props.moves.updateThreat(field, this.state[field]);
      }
    }

    if (!playerThreat.mitigation) {
      this.props.moves.updateThreat('mitigation', 'No mitigation provided.');
    }
  }

  addOrUpdate() {
    // update the values from the state
    this.saveThreat();
    this.props.moves.addOrUpdateThreat();
    this.toggleMitigationField(false);
  }

  toggleMitigationField(isShown) {
    this.setState({
      showMitigation: isShown,
    });
  }

  get isInvalid() {
    return _.isEmpty(this.state.description) || _.isEmpty(this.state.title);
  }

  get isOwner() {
    const playerThreat = this.props.playerID
      ? this.props.G.threats[this.props.playerID]
      : null;
    return playerThreat && playerThreat.owner === this.props.playerID;
  }

  render() {
    const playerThreat = this.props.playerID
      ? this.props.G.threats[this.props.playerID]
      : null;

    if (!playerThreat) return null;

    return (
      <Modal isOpen={this.props.isOpen}>
        <Form>
          <ModalHeader
            toggle={
              this.isOwner ? () => this.props.moves.toggleModal() : undefined
            }
            style={{ width: '100%' }}
          >
            {playerThreat.new ? 'Add' : 'Update'} Threat &mdash;{' '}
            <small className="text-muted">
              being {playerThreat.new ? 'added' : 'updated'} by{' '}
              {this.props.names[playerThreat.owner]}
            </small>
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label for="title">Title</Label>
              <Input
                type="text"
                name="title"
                id="title"
                disabled={!this.isOwner}
                autoComplete="off"
                value={this.state.title}
                onBlur={(e) =>
                  this.props.moves.updateThreat('title', e.target.value)
                }
                onChange={(e) => this.setState({ title: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label for="type">Threat type</Label>
              <Input
                type="select"
                name="type"
                id="type"
                disabled={!this.isOwner}
                value={playerThreat.type}
                onChange={(e) =>
                  this.props.moves.updateThreat('type', e.target.value)
                }
              >
                {getSuits(this.props.G.gameMode).map((suit) => (
                  <option value={suit} key={`threat-category-${suit}`}>
                    {getSuitDisplayName(this.props.G.gameMode, suit)}
                  </option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="severity">Severity</Label>
              <Input
                type="select"
                name="severity"
                id="severity"
                disabled={!this.isOwner}
                value={playerThreat.severity}
                onChange={(e) =>
                  this.props.moves.updateThreat('severity', e.target.value)
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="description">Description</Label>
              <Input
                type="textarea"
                name="description"
                id="description"
                disabled={!this.isOwner}
                style={{ height: 150 }}
                value={this.state.description}
                onBlur={(e) =>
                  this.props.moves.updateThreat('description', e.target.value)
                }
                onChange={(e) => this.setState({ description: e.target.value })}
              />
            </FormGroup>
            <FormGroup hidden={!this.isOwner}>
              <div className="checkbox-item">
                <Input
                  className="pointer"
                  type="checkbox"
                  id="showMitigation"
                  onChange={(e) => this.toggleMitigationField(e.target.checked)}
                />
                <Label for="showMitigation">
                  Add a mitigation <em>(optional)</em>
                </Label>
              </div>
            </FormGroup>
            <FormGroup hidden={this.isOwner && !this.state.showMitigation}>
              <Label for="mitigation">Mitigation</Label>
              <Input
                type="textarea"
                name="mitigation"
                id="mitigation"
                disabled={!this.isOwner}
                style={{ height: 150 }}
                value={this.state.mitigation}
                onBlur={(e) =>
                  this.props.moves.updateThreat('mitigation', e.target.value)
                }
                onChange={(e) => this.setState({ mitigation: e.target.value })}
              />
            </FormGroup>
          </ModalBody>
          {this.isOwner && (
            <ModalFooter>
              <Button
                color="primary"
                className="mr-auto"
                disabled={this.isInvalid}
                onClick={() => this.addOrUpdate()}
              >
                Save
              </Button>
              <Button
                color="secondary"
                onClick={() => this.props.moves.toggleModal()}
              >
                Cancel
              </Button>
            </ModalFooter>
          )}
        </Form>
      </Modal>
    );
  }
}

export default ThreatModal;
