import { INVALID_MOVE } from 'boardgame.io/core';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { getDealtCard, getValidMoves } from '../utils/utils';
import { getThreatDescription } from './definitions';
import { hasPlayerPassed, setupGame } from './utils';

import type { Ctx } from './context';
import type { GameState } from './gameState';
import type { Threat } from './threat';
import type { Suit } from '../utils/cardDefinitions';

export function toggleModal(
  G: GameState,
  ctx: Ctx,
): GameState | typeof INVALID_MOVE {
  // if the player has passed, they shouldn't be able to toggle the modal
  if (
    hasPlayerPassed(G, ctx) ||
    ctx.playerID === undefined ||
    G.suit === undefined
  ) {
    return INVALID_MOVE;
  }
  const card = getDealtCard(G);
  const playerThreat = G.threats[ctx.playerID];

  return {
    ...G,
    threats: {
      ...G.threats,
      [ctx.playerID]: {
        ...playerThreat,
        modal: !playerThreat.modal,
        new: true,
        owner: ctx.playerID,
        type: G.suit,
        id: uuidv4(),
        title: '',
        severity: 'Medium',
        description: getThreatDescription(card, G.gameMode),
        mitigation: '',
      },
    },
  };
}

export function toggleModalUpdate(
  G: GameState,
  ctx: Ctx,
  threat: Threat,
): GameState | typeof INVALID_MOVE {
  // if the player has passed, they shouldn't be able to toggle the modal
  if (
    hasPlayerPassed(G, ctx) ||
    threat.owner !== ctx.playerID ||
    ctx.playerID === undefined
  ) {
    return INVALID_MOVE;
  }

  const playerThreat = G.threats[ctx.playerID];

  return {
    ...G,
    threats: {
      ...G.threats,
      [ctx.playerID]: {
        ...playerThreat,
        modal: !playerThreat.modal,
        new: false,
        id: threat.id,
        owner: ctx.playerID,
        title: threat.title,
        type: threat.type,
        severity: threat.severity,
        description: threat.description,
        mitigation: threat.mitigation,
      },
    },
  };
}

export function updateThreat<Field extends keyof Threat>(
  G: GameState,
  ctx: Ctx,
  field: Field,
  value: Threat[Field],
): GameState | typeof INVALID_MOVE {
  if (ctx.playerID === undefined) {
    return INVALID_MOVE;
  }

  const playerThreat = G.threats[ctx.playerID];

  return {
    ...G,
    threats: {
      ...G.threats,
      [ctx.playerID]: {
        ...playerThreat,
        [field]: value,
      },
    },
  };
}

export function selectDiagram(
  G: GameState,
  ctx: Ctx,
  id: number,
): GameState | typeof INVALID_MOVE {
  // if the player has passed, they shouldn't be able to select diagrams
  if (hasPlayerPassed(G, ctx)) {
    return INVALID_MOVE;
  }

  return {
    ...G,
    selectedDiagram: id,
    selectedComponent: '',
    selectedThreat: '',
  };
}

export function selectComponent(
  G: GameState,
  ctx: Ctx,
  id: string,
): GameState | typeof INVALID_MOVE {
  // if the player has passed, they shouldn't be able to select components
  if (hasPlayerPassed(G, ctx)) {
    return INVALID_MOVE;
  }

  return {
    ...G,
    selectedComponent: id,
    selectedThreat: '',
  };
}

export function selectThreat(
  G: GameState,
  ctx: Ctx,
  id: string,
): GameState | typeof INVALID_MOVE {
  // if the player has passed, they shouldn't be able to select threat
  if (hasPlayerPassed(G, ctx)) {
    return INVALID_MOVE;
  }

  return {
    ...G,
    selectedThreat: id,
  };
}

export function pass(G: GameState, ctx: Ctx): GameState | typeof INVALID_MOVE {
  if (ctx.playerID === undefined) {
    return INVALID_MOVE;
  }

  const passed = [...G.passed];

  if (!hasPlayerPassed(G, ctx)) {
    passed.push(ctx.playerID);
  }

  return {
    ...G,
    passed,
  };
}

export function deleteThreat(
  G: GameState,
  ctx: Ctx,
  threat: Threat & { id: string },
): GameState | typeof INVALID_MOVE {
  // if the player has passed, they shouldn't be able to toggle the modal
  if (
    hasPlayerPassed(G, ctx) ||
    threat.owner !== ctx.playerID ||
    ctx.playerID === undefined
  ) {
    return INVALID_MOVE;
  }

  const scores = [...G.scores];
  scores[Number.parseInt(ctx.playerID)]--;

  const identifiedThreats = _.cloneDeep(G.identifiedThreats);
  delete identifiedThreats[G.selectedDiagram][G.selectedComponent][threat.id];

  return {
    ...G,
    scores,
    selectedThreat: '',
    identifiedThreats,
  };
}

export function addOrUpdateThreat(
  G: GameState,
  ctx: Ctx,
): GameState | typeof INVALID_MOVE {
  if (ctx.playerID === undefined) {
    return INVALID_MOVE;
  }

  const playerThreat = G.threats[ctx.playerID];
  const threatTitle = playerThreat.title?.trim();
  const threatDescription = playerThreat.description?.trim();
  const threatMitigation = playerThreat.mitigation?.trim();

  if (
    playerThreat.owner !== ctx.playerID ||
    _.isEmpty(threatTitle) ||
    _.isEmpty(threatDescription) ||
    playerThreat.id === undefined
  ) {
    return INVALID_MOVE;
  }

  const scores = [...G.scores];

  // only update score if it's a new threat
  if (playerThreat.new) {
    scores[Number.parseInt(ctx.playerID)]++;
  }

  // TODO: have a cleaner or readable approach to updating this object
  const identifiedThreats = _.cloneDeep(G.identifiedThreats);

  // Are these necessary
  if (!(G.selectedDiagram in identifiedThreats)) {
    Object.assign(identifiedThreats, { [G.selectedDiagram]: {} });
  }

  if (!(G.selectedComponent in identifiedThreats[G.selectedDiagram])) {
    Object.assign(identifiedThreats[G.selectedDiagram], {
      [G.selectedComponent]: {},
    });
  }

  //is object.assign required here?
  Object.assign(identifiedThreats[G.selectedDiagram][G.selectedComponent], {
    [playerThreat.id]: {
      id: playerThreat.id,
      owner: playerThreat.owner,
      title: threatTitle,
      type: playerThreat.type,
      severity: playerThreat.severity,
      description: threatDescription,
      mitigation: threatMitigation || 'No mitigation provided.',
    },
  });

  return {
    ...G,
    scores,
    threats: {
      ...G.threats,
      [ctx.playerID]: {
        ...playerThreat,
        modal: false,
      },
    },
    selectedThreat: playerThreat.id,
    identifiedThreats,
  };
}

export function resetGame(
  G: GameState,
  ctx: Ctx,
): GameState {
  // Extract the start suit from the starting card (first character)
  const startSuit = G.startingCard.slice(0, 1) as Suit;

  // Reset the game with the same settings
  return setupGame(ctx, {
    startSuit,
    gameMode: G.gameMode,
    modelType: G.modelType,
    turnDuration: G.turnDuration,
    spectatorCredential: '', // Not used during gameplay, only during creation
  });
}

export function draw(
  G: GameState,
  ctx: Ctx,
  card: string,
): typeof INVALID_MOVE | GameState {
  const deck = [...G.players[Number.parseInt(ctx.currentPlayer)]];
  let suit = G.suit;

  // check if the move is valid
  if (!getValidMoves(deck, suit, G.round, G.startingCard).includes(card)) {
    return INVALID_MOVE;
  }

  let dealtBy = G.dealtBy;
  const index = deck.indexOf(card);
  deck.splice(index, 1);

  const dealt = [...G.dealt];
  let numCardsPlayed = G.numCardsPlayed;

  dealt[parseInt(ctx.currentPlayer)] = card;
  numCardsPlayed++;

  // only update the suit if no suit exists
  if (!suit) suit = card.slice(0, 1) as Suit;

  dealtBy = ctx.currentPlayer;

  // move into threats stage
  ctx.events?.setActivePlayers?.({ all: 'threats' });

  return {
    ...G,
    dealt,
    suit,
    numCardsPlayed,
    dealtBy,
    players: {
      ...G.players,
      [ctx.currentPlayer]: deck,
    },
    turnFinishTargetTime: Date.now() + G.turnDuration * 1000,
  };
}
