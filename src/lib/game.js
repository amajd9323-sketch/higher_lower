export const MODES = {
  classic: {
    easy: { min: 1, max: 50, attempts: 8 },
    normal: { min: 1, max: 100, attempts: 7 },
    hard: { min: 1, max: 1000, attempts: 10 },
  },
  code: { attempts: 10 },
}

export const TURN_SECONDS = 20
export const REACTIONS = ['😄', '😮', '🔥', '😭', '👍']

export function makeRoomState(code, players, mode = 'classic', difficulty = 'normal') {
  const ids = players.map((player) => player.id)
  return {
    version: 1,
    roomCode: code,
    leaderId: players[0]?.id,
    players,
    mode,
    difficulty,
    status: 'lobby',
    matchNo: 1,
    roundNo: 1,
    scores: Object.fromEntries(ids.map((id) => [id, 0])),
    seriesScore: Object.fromEntries(ids.map((id) => [id, 0])),
    ready: Object.fromEntries(ids.map((id) => [id, false])),
    attempts: Object.fromEntries(ids.map((id) => [id, 0])),
    misses: Object.fromEntries(ids.map((id) => [id, 0])),
    ranges: Object.fromEntries(ids.map((id) => [id, MODES.classic[difficulty].min === 1 ? [1, MODES.classic[difficulty].max] : [1, 100]])),
    guesses: [],
    turnId: null,
    turnEndsAt: null,
    pending: null,
    roundWinner: null,
    matchWinner: null,
    summary: [],
  }
}

export function resetRound(state, players = state.players, roundNo = state.roundNo + 1) {
  const ids = players.map((player) => player.id)
  const range = state.mode === 'classic'
    ? [MODES.classic[state.difficulty].min, MODES.classic[state.difficulty].max]
    : [0, 9999]
  return {
    ...state,
    players,
    status: 'lobby',
    roundNo,
    ready: Object.fromEntries(ids.map((id) => [id, false])),
    attempts: Object.fromEntries(ids.map((id) => [id, 0])),
    misses: Object.fromEntries(ids.map((id) => [id, 0])),
    ranges: Object.fromEntries(ids.map((id) => [id, [...range]])),
    guesses: [],
    turnId: null,
    turnEndsAt: null,
    pending: null,
    roundWinner: null,
    matchWinner: null,
  }
}

export function getMaxAttempts(state) {
  return state.mode === 'code' ? MODES.code.attempts : MODES.classic[state.difficulty].attempts
}

export function getFeedback(mode, secret, guess) {
  if (mode === 'code') {
    const a = String(secret).padStart(4, '0')
    const b = String(guess).padStart(4, '0')
    const masked = [...a].map((digit, index) => digit === b[index] ? digit : '*').join('')
    return { text: masked, correct: masked === a, exact: [...masked].filter((digit) => digit !== '*').length }
  }
  const target = Number(secret)
  const attempt = Number(guess)
  return { text: attempt === target ? 'correct' : attempt < target ? 'higher' : 'lower', correct: attempt === target }
}

export function makeRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const values = new Uint32Array(5)
  crypto.getRandomValues(values)
  return [...values].map((value) => alphabet[value % alphabet.length]).join('')
}
