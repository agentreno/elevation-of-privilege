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

    console.log('[DEBUG deck] Total cards to render:', left.length);

    if (
      this.props.current &&
      this.props.active &&
      !this.props.isInThreatStage
    ) {
      validMoves = getValidMoves(
        left,
        suit,
        this.props.round,
        this.props.startingCard,
      );
      console.log('[DEBUG deck] validMoves count:', validMoves.length);
    }

    let deck = left.map((e, index) => {
      const cardClass = isGameModeCornucopia(this.props.gameMode)
        ? `cornucopiacard ccard${e.toLowerCase()}`
        : `card${e.toLowerCase()}`;
      const isValid = validMoves.includes(e);

      // Log first few and last few cards being rendered
      if (index < 5 || index >= left.length - 5) {
        console.log(`[DEBUG deck] Rendering card ${index + 1}/${left.length}: ${e} -> class="${cardClass}" valid=${isValid}`);
      }

      return (
        <li
          key={e}
          className={` playing-card ${cardClass} ${isValid ? 'active' : ''} card-rounded scaled`}
          onClick={() => this.props.onCardSelect(e)}
        />
      );
    });

    console.log('[DEBUG deck] Created', deck.length, 'card elements');
    return <ul className="hand">{deck}</ul>;
  }

  render() {
    let deck = this.getRenderedDeck();
    return <div className="playingCards">{deck}</div>;
  }
}

export default Deck;
