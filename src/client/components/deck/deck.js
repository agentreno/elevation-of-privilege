import React from 'react';
import PropTypes from 'prop-types';
import { getValidMoves } from '../../../utils/utils';
import { isGameModeCornucopia } from '../../../utils/constants';

class Deck extends React.Component {
  static get propTypes() {
    return {
      suit: PropTypes.any.isRequired,
      cards: PropTypes.any.isRequired,
      isInThreatStage: PropTypes.bool,
      round: PropTypes.any.isRequired,
      current: PropTypes.bool.isRequired,
      active: PropTypes.bool.isRequired,
      onCardSelect: PropTypes.func.isRequired,
      startingCard: PropTypes.string.isRequired,
      gameMode: PropTypes.string.isRequired,
    };
  }

  static get defaultProps() {
    return {
      isInThreatStage: false,
    };
  }

  getRenderedDeck() {
    let left = this.props.cards;
    let suit = this.props.suit;
    let validMoves = [];

    console.log('[DEBUG deck] current:', this.props.current);
    console.log('[DEBUG deck] active:', this.props.active);
    console.log('[DEBUG deck] isInThreatStage:', this.props.isInThreatStage);
    console.log('[DEBUG deck] startingCard:', this.props.startingCard);
    console.log('[DEBUG deck] round:', this.props.round);

    if (
      this.props.current &&
      this.props.active &&
      !this.props.isInThreatStage
    ) {
      console.log('[DEBUG deck] Calculating valid moves...');
      validMoves = getValidMoves(
        left,
        suit,
        this.props.round,
        this.props.startingCard,
      );
      console.log('[DEBUG deck] validMoves:', validMoves);
    } else {
      console.log('[DEBUG deck] NOT calculating valid moves - conditions not met');
    }

    let deck = left.map((e) => (
      <li
        key={e}
        className={` playing-card ${
          isGameModeCornucopia(this.props.gameMode)
            ? `cornucopiacard ccard${e.toLowerCase()}`
            : `card${e.toLowerCase()}`
        } ${validMoves.includes(e) ? 'active' : ''} card-rounded scaled`}
        onClick={() => this.props.onCardSelect(e)}
      />
    ));

    return <ul className="hand">{deck}</ul>;
  }

  render() {
    let deck = this.getRenderedDeck();
    return <div className="playingCards">{deck}</div>;
  }
}

export default Deck;
