import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Award, Check, ChevronDown, ChevronUp, CircleHelp,
  Copy, Crown, Eye, Gamepad2, Globe2, Hash, Link2, LoaderCircle, LockKeyhole, Moon, Music2,
  Plus, RefreshCw, Send, Settings2, Share2, ShieldCheck, Sparkles, Sun, Trophy, Volume2,
  VolumeX, Wifi, WifiOff, X, Zap,
} from 'lucide-react'
import { getMaxAttempts, getFeedback, makeRoomCode, makeRoomState, MODES, REACTIONS, resetRound, TURN_SECONDS } from './lib/game.js'
import { createRealtimeClient, getSupabaseConfig, saveSupabaseConfig } from './lib/supabase.js'

const COPY = {
  ar: {
    tagline: 'مبارزة أرقام. أعصاب فولاذية.', subtitle: 'اختر رقمًا سرّيًا، ثم اكتشف رقم خصمك قبل أن يسبقك.', online: 'مبارزة أونلاين', solo: 'تحدَّ الكمبيوتر', practice: 'تدريب سريع، بلا انتظار ولا اتصال.', onlineHint: 'غرفة خاصة، لاعبَان، ونتيجة مباشرة.',
    yourName: 'اسمك في اللعبة', namePlaceholder: 'اكتب اسمًا مستعارًا', roomCode: 'رمز الغرفة', codePlaceholder: 'مثال: A7K2Q', create: 'أنشئ غرفة', join: 'انضم إلى الغرفة', createHint: 'أنشئ غرفة وشارك الرمز مع صديقك', joinHint: 'لديك رمز؟ أدخله هنا', connecting: 'جارٍ الاتصال…', connected: 'متصل', reconnecting: 'إعادة الاتصال…', offline: 'انقطع الاتصال', waiting: 'بانتظار لاعب آخر', waitingHelp: 'أرسل هذا الرمز إلى صديقك ليبدأ التحدي.',
    classic: 'أعلى أم أدنى', classicSub: 'اكتشف الرقم السرّي بالتلميحات', code: 'مبارزة الأكواد', codeSub: 'أربع خانات. تطابق دقيق. عشر محاولات.', easy: 'سهل', normal: 'عادي', hard: 'صعب', difficulty: 'الصعوبة', chooseMode: 'اختر نمط اللعب', range: 'النطاق', guesses: 'محاولات', bestOf: 'الأفضل من ٣', rounds: 'الجولات',
    lobby: 'غرفة المبارزة', player: 'لاعب', opponent: 'الخصم', you: 'أنت', spectator: 'مشاهد', spectators: 'مشاهدون', joined: 'انضم إلى الغرفة', opponentLeft: 'غادر خصمك الغرفة. سنحتفظ بالمباراة حتى يعود.', waitingForOpponent: 'بانتظار خصمك…', chooseSecret: 'اختر رقمك السرّي', chooseSecretCode: 'اختر كودك السرّي', secretHint: 'لن يظهر رقمك للخصم؛ ستبقى الإجابة على جهازك.', secretCodeHint: 'اختر أي ٤ أرقام، ويمكن تكرارها. سيبقى الكود على جهازك فقط.', secretPlaceholder: 'رقمك السرّي', codeSecretPlaceholder: '٤ أرقام', ready: 'جاهز — ابدأ الجولة', readyWaiting: 'أنت جاهز، بانتظار خصمك', bothReady: 'اختار اللاعبان أسرارهما',
    yourTurn: 'دورك الآن', opponentTurn: 'دور الخصم', turnIn: 'الوقت المتبقي', enterGuess: 'اكتب تخمينك', makeGuess: 'تخمين', attemptsLeft: 'المحاولات المتبقية', turnMissed: 'انتهى الوقت — احتُسبت محاولة فائتة.', hintHigher: 'أعلى ▲', hintLower: 'أدنى ▼', correct: 'إجابة صحيحة!', codeHint: 'الأرقام الصحيحة في مواقعها فقط تظهر؛ النجوم تخفي البقية.', rangeBar: 'نطاقك المتبقي', history: 'سجل التخمينات', noGuesses: 'لا توجد تخمينات بعد. ابدأ أنت!', timeout: 'انتهى الوقت',
    score: 'نتيجة المباراة', series: 'السلسلة', round: 'الجولة', roundWon: 'فزت بالجولة!', roundLost: 'فاز خصمك بالجولة', matchWon: 'بطل المواجهة!', matchLost: 'خصمك حسم المواجهة', nextRound: 'الجولة التالية', rematch: 'مواجهة جديدة', waitingRematch: 'اختار اللاعبان المواجهة الجديدة', shareResult: 'شارك النتيجة', copyLink: 'انسخ رابط الدعوة', copied: 'تم النسخ', backHome: 'العودة للرئيسية', totalWins: 'انتصارات السلسلة',
    reactions: 'تفاعلات مباشرة', reactionSent: 'أرسل تفاعلًا', sound: 'الأصوات', mute: 'كتم الصوت', unmute: 'تشغيل الصوت', light: 'الوضع الفاتح', dark: 'الوضع الداكن', arabic: 'العربية', english: 'English', settings: 'إعداد الاتصال', settingsTitle: 'اتصال Supabase Realtime', settingsBody: 'يلزم مشروع Supabase مجاني لتشغيل الغرف أونلاين. استخدم رابط المشروع ومفتاح Publishable العام (أو anon القديم)؛ لا حاجة لجداول أو حسابات.', supabaseUrl: 'رابط مشروع Supabase', supabaseKey: 'مفتاح Publishable العام (أو anon)', save: 'حفظ الإعدادات', cancel: 'إلغاء', setupNeeded: 'أضف إعدادات Supabase للاتصال بغرف الأونلاين.',
    configSaved: 'تم حفظ إعداد الاتصال على هذا الجهاز.', errorCode: 'أدخل رمزًا من ٥ أحرف أو أرقام.', errorName: 'اكتب اسمًا مستعارًا أولًا.', errorSecret: 'تحقق من الرقم أو الكود ثم حاول مجددًا.', roomFull: 'الغرفة مكتملة؛ دخلت كمشاهد.', shareText: 'انضم إليّ في مبارزة Higher / Lower & Code Duel!', shareSuccess: 'رابط الغرفة جاهز للمشاركة.', soloLabel: 'تحدي الكمبيوتر', bot: 'الكمبيوتر', botThinking: 'الكمبيوتر يفكر…', botGuess: 'تخمين الكمبيوتر', startSolo: 'ابدأ التدريب', restart: 'ابدأ من جديد', soloWin: 'أحسنت! اكتشفت الرقم.', botWin: 'الكمبيوتر عرف رقمك!', soloDraw: 'انتهت المحاولات', soundOn: 'الصوت مفعّل', powered: 'لا تسجيل. لا جداول. أسرار خاصة.', connectionTip: 'تحتاج إعداد Supabase مرة واحدة لتعمل الغرف من أي جهاز.', codeMade: 'تم إنشاء رمز جديد', invite: 'أرسل لصديقك هذا الرمز', joinAnother: 'دخول مشاهد', copiedCode: 'نُسخ الرمز',
  },
  en: {
    tagline: 'Number duels. Nerves of steel.', subtitle: 'Pick a secret, then crack your opponent’s before they crack yours.', online: 'Play online', solo: 'Challenge the bot', practice: 'Quick practice, no wait and no connection.', onlineHint: 'Private room, two players, live score.', yourName: 'Your player name', namePlaceholder: 'Enter a nickname', roomCode: 'Room code', codePlaceholder: 'Example: A7K2Q', create: 'Create a room', join: 'Join room', createHint: 'Make a room and share the code', joinHint: 'Have a code? Enter it here', connecting: 'Connecting…', connected: 'Connected', reconnecting: 'Reconnecting…', offline: 'Connection lost', waiting: 'Waiting for a player', waitingHelp: 'Send this code to a friend to start the duel.',
    classic: 'Higher / Lower', classicSub: 'Find the secret number from the clues', code: 'Code Duel', codeSub: 'Four digits. Exact matches. Ten tries.', easy: 'Easy', normal: 'Normal', hard: 'Hard', difficulty: 'Difficulty', chooseMode: 'Choose a game mode', range: 'Range', guesses: 'guesses', bestOf: 'Best of 3', rounds: 'Rounds',
    lobby: 'Duel room', player: 'Player', opponent: 'Opponent', you: 'You', spectator: 'Spectator', spectators: 'Spectators', joined: 'joined the room', chooseSecret: 'Choose your secret number', chooseSecretCode: 'Choose your secret code', secretHint: 'Your number stays on your device; your opponent never sees it.', secretCodeHint: 'Choose any 4 digits, repeats allowed. The code stays on your device.', secretPlaceholder: 'Your secret number', codeSecretPlaceholder: '4 digits', ready: 'Ready — start round', readyWaiting: 'You are ready; waiting for your opponent', bothReady: 'Both players picked secrets',
    yourTurn: 'Your turn', opponentTurn: 'Opponent’s turn', turnIn: 'Time left', enterGuess: 'Enter your guess', makeGuess: 'Guess', attemptsLeft: 'Attempts left', turnMissed: 'Time ran out — a missed attempt was counted.', hintHigher: 'Higher ▲', hintLower: 'Lower ▼', correct: 'Correct!', codeHint: 'Only digits in the correct positions are shown; stars mask the rest.', rangeBar: 'Your remaining range', history: 'Guess history', noGuesses: 'No guesses yet. Make the first one!', timeout: 'Time up',
    score: 'Match score', series: 'Series', round: 'Round', roundWon: 'Round won!', roundLost: 'Your opponent won the round', matchWon: 'Duel champion!', matchLost: 'Your opponent took the match', nextRound: 'Next round', rematch: 'New match', waitingRematch: 'Both players chose a rematch', shareResult: 'Share result', copyLink: 'Copy invite link', copied: 'Copied', backHome: 'Back home', totalWins: 'Series wins',
    reactions: 'Live reactions', reactionSent: 'Sent a reaction', sound: 'Sound effects', mute: 'Mute sound', unmute: 'Enable sound', light: 'Light mode', dark: 'Dark mode', arabic: 'العربية', english: 'English', settings: 'Connection settings', settingsTitle: 'Supabase Realtime connection', settingsBody: 'A free Supabase project is needed for online rooms. Use the project URL and public publishable key (or legacy anon key); no tables or accounts are needed.', supabaseUrl: 'Supabase project URL', supabaseKey: 'Public publishable key (or anon)', save: 'Save settings', cancel: 'Cancel', setupNeeded: 'Add your Supabase settings to connect to online rooms.',
    configSaved: 'Connection settings saved on this device.', errorCode: 'Enter a 5-character room code.', errorName: 'Enter a nickname first.', errorSecret: 'Check your number or code and try again.', roomFull: 'The room is full; you joined as a spectator.', shareText: 'Join my Higher / Lower & Code Duel!', shareSuccess: 'Your room link is ready to share.', soloLabel: 'Bot challenge', bot: 'Computer', botThinking: 'The computer is thinking…', botGuess: 'Computer guess', startSolo: 'Start practice', restart: 'Start over', soloWin: 'Nice! You found the number.', botWin: 'The computer found your number!', soloDraw: 'No attempts left', soundOn: 'Sound is on', powered: 'No sign-up. No tables. Private secrets.', connectionTip: 'Set up Supabase once to enable rooms on any device.', codeMade: 'New room code created', invite: 'Send this code to your friend', joinAnother: 'Join as spectator', copiedCode: 'Code copied',
  },
}

const EMOJI_REACTION = { '😄': 'smile', '😮': 'wow', '🔥': 'fire', '😭': 'cry', '👍': 'like' }
const randomId = () => {
  let id = sessionStorage.getItem('hld-player-id')
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem('hld-player-id', id) }
  return id
}
const createSeries = (state, winnerId, summaryLine) => {
  const scores = { ...state.scores, [winnerId]: (state.scores[winnerId] || 0) + 1 }
  const matchWinner = scores[winnerId] >= 2 ? winnerId : null
  const seriesScore = matchWinner ? { ...state.seriesScore, [winnerId]: (state.seriesScore[winnerId] || 0) + 1 } : state.seriesScore
  return { ...state, scores, seriesScore, roundWinner: winnerId, matchWinner, status: matchWinner ? 'match-result' : 'round-result', turnId: null, turnEndsAt: null, pending: null, summary: [...state.summary, summaryLine] }
}

function advanceSoloBot(current) {
  let low = current.botLow, high = current.botHigh
  const candidate = current.mode === 'code'
    ? current.botCandidates[Math.floor(Math.random() * Math.max(1, current.botCandidates.length))] || String(Math.floor(Math.random() * 10000)).padStart(4, '0')
    : String(Math.floor((low + high) / 2))
  let botGuess = Number(candidate)
  const width = high - low
  if (current.mode === 'classic') {
    const noise = current.difficulty === 'easy' ? Math.max(1, Math.ceil(width * .25)) : current.difficulty === 'normal' ? Math.max(0, Math.floor(width * .1)) : Math.max(0, Math.floor(width * .025))
    if (noise && Math.random() < (current.difficulty === 'easy' ? .75 : current.difficulty === 'normal' ? .4 : .12)) botGuess = Math.max(low, Math.min(high, botGuess + Math.floor((Math.random() * 2 - 1) * noise)))
  }
  const normalized = String(botGuess).padStart(current.mode === 'code' ? 4 : 1, '0')
  const feedback = getFeedback(current.mode, current.playerSecret, normalized)
  if (current.mode === 'classic' && !feedback.correct) feedback.text === 'higher' ? low = Math.max(low, botGuess + 1) : high = Math.min(high, botGuess - 1)
  const botCandidates = current.mode === 'code' && !feedback.correct
    ? current.botCandidates.filter((value) => [...normalized].every((digit, index) => feedback.text[index] === '*' ? value[index] !== digit : value[index] === feedback.text[index]))
    : current.botCandidates
  const botAttempts = current.botAttempts + 1
  const entry = { id: Date.now() + 1, guess: normalized, feedback: feedback.text, playerId: 'bot', correct: feedback.correct }
  const finished = feedback.correct || botAttempts >= current.maxAttempts
  return {
    next: { ...current, botLow: low, botHigh: high, botAttempts, botCandidates, botTried: [...current.botTried, normalized], guesses: [...current.guesses, entry], finished, winner: feedback.correct ? 'bot' : finished ? 'you' : null, botFeedback: feedback.text },
    sound: feedback.correct ? 'loss' : finished ? 'win' : null,
  }
}

function App() {
  const selfId = useMemo(randomId, [])
  const [lang, setLang] = useState(() => localStorage.getItem('hld-lang') || 'ar')
  const [theme, setTheme] = useState(() => localStorage.getItem('hld-theme') || 'dark')
  const [sound, setSound] = useState(() => localStorage.getItem('hld-sound') !== 'off')
  const [name, setName] = useState(() => localStorage.getItem('hld-name') || '')
  const [joinInput, setJoinInput] = useState(() => new URLSearchParams(location.search).get('room') || '')
  const [activeRoom, setActiveRoom] = useState('')
  const [soloOpen, setSoloOpen] = useState(false)
  const [soloMode, setSoloMode] = useState('classic')
  const [difficulty, setDifficulty] = useState('normal')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [configDraft, setConfigDraft] = useState(getSupabaseConfig)
  const [configMessage, setConfigMessage] = useState('')
  const [toast, setToast] = useState('')
  const [roomStatus, setRoomStatus] = useState('idle')
  const [roomError, setRoomError] = useState('')
  const [peers, setPeers] = useState([])
  const [roomState, setRoomState] = useState(null)
  const [secretDraft, setSecretDraft] = useState('')
  const [guessDraft, setGuessDraft] = useState('')
  const [now, setNow] = useState(Date.now())
  const [reactions, setReactions] = useState([])
  const [solo, setSolo] = useState(null)
  const [soloTurn, setSoloTurn] = useState('you')
  const [botDraft, setBotDraft] = useState('')
  const [confetti, setConfetti] = useState(false)
  const channelRef = useRef(null)
  const supabaseRef = useRef(null)
  const sharedRef = useRef(null)
  const peersRef = useRef([])
  const isLeaderRef = useRef(false)
  const handlersRef = useRef({})
  const audioRef = useRef(null)
  const timerCueRef = useRef('')
  const guessCueRef = useRef('')

  const rtl = lang === 'ar'
  const t = useCallback((key) => COPY[lang][key] ?? COPY.en[key] ?? key, [lang])
  const displayName = name.trim() || t('player')

  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = rtl ? 'rtl' : 'ltr'; localStorage.setItem('hld-lang', lang) }, [lang, rtl])
  useEffect(() => { localStorage.setItem('hld-theme', theme) }, [theme])
  useEffect(() => { localStorage.setItem('hld-sound', sound ? 'on' : 'off') }, [sound])
  useEffect(() => { if (name.trim()) localStorage.setItem('hld-name', name.trim()) }, [name])
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(timer) }, [])
  useEffect(() => { sharedRef.current = roomState }, [roomState])
  useEffect(() => { peersRef.current = peers }, [peers])
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const playSound = useCallback((kind = 'click') => {
    if (!sound) return
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      const context = audioRef.current || new AudioContextClass()
      audioRef.current = context
      if (context.state === 'suspended') context.resume()
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const frequencies = { click: 540, timer: 740, higher: 610, lower: 380, win: 880, loss: 210 }
      oscillator.frequency.value = frequencies[kind] || 540
      oscillator.type = kind === 'win' ? 'triangle' : 'sine'
      gain.gain.setValueAtTime(.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(kind === 'win' ? .11 : .045, context.currentTime + .012)
      gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + (kind === 'win' ? .55 : .16))
      oscillator.connect(gain); gain.connect(context.destination)
      oscillator.start(); oscillator.stop(context.currentTime + (kind === 'win' ? .56 : .18))
      if (kind === 'win') { const second = context.createOscillator(); const secondGain = context.createGain(); second.frequency.value = 1175; secondGain.gain.setValueAtTime(.07, context.currentTime + .12); secondGain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .62); second.connect(secondGain); secondGain.connect(context.destination); second.start(context.currentTime + .12); second.stop(context.currentTime + .63) }
    } catch { /* audio is optional */ }
  }, [sound])

  const emit = useCallback((message) => {
    const channel = channelRef.current
    if (!channel) return
    channel.send({ type: 'broadcast', event: 'duel', payload: { ...message, senderId: selfId, sentAt: Date.now() } })
  }, [selfId])

  const installRoomState = useCallback((next, broadcast = true) => {
    sharedRef.current = next
    setRoomState(next)
    if (activeRoom) {
      try { sessionStorage.setItem(`hld-public-state-${activeRoom}`, JSON.stringify(next)) } catch { /* ignore storage pressure */ }
    }
    if (broadcast) emit({ type: 'state', state: next })
  }, [activeRoom, emit])

  const processHostAction = useCallback((action) => {
    const state = sharedRef.current
    if (!state || !isLeaderRef.current) return
    if (action.type === 'reaction') {
      if (!REACTIONS.includes(action.emoji)) return
      emit({ type: 'reaction', emoji: action.emoji, name: state.players.find((p) => p.id === action.senderId)?.name || t('spectator') })
      return
    }
    const participantIds = state.players.map((p) => p.id)
    if (!participantIds.includes(action.senderId)) return

    if (action.type === 'settings') {
      if (state.status !== 'lobby') return
      const mode = action.mode === 'code' ? 'code' : 'classic'
      const diff = ['easy', 'normal', 'hard'].includes(action.difficulty) ? action.difficulty : state.difficulty
      const ids = participantIds
      const [lo, hi] = mode === 'classic' ? [MODES.classic[diff].min, MODES.classic[diff].max] : [0, 9999]
      installRoomState({ ...state, mode, difficulty: diff, ready: Object.fromEntries(ids.map((id) => [id, false])), ranges: Object.fromEntries(ids.map((id) => [id, [lo, hi]])) })
      return
    }
    if (action.type === 'ready') {
      if (state.status !== 'lobby' || state.players.length < 2) return
      const ready = { ...state.ready, [action.senderId]: true }
      const bothReady = state.players.every((player) => ready[player.id])
      const firstPlayer = state.players[(state.roundNo - 1) % 2]
      installRoomState({ ...state, ready, status: bothReady ? 'playing' : 'lobby', turnId: bothReady ? firstPlayer.id : null, turnEndsAt: bothReady ? Date.now() + TURN_SECONDS * 1000 : null })
      return
    }
    if (action.type === 'guess') {
      if (state.status !== 'playing' || state.pending || state.turnId !== action.senderId) return
      const max = state.mode === 'classic' ? MODES.classic[state.difficulty].max : 9999
      const guess = String(action.guess)
      if (state.mode === 'code' ? !/^\d{4}$/.test(guess) : !/^\d+$/.test(guess) || Number(guess) < 1 || Number(guess) > max) return
      const target = state.players.find((player) => player.id !== action.senderId)
      if (!target) return
      const pending = { guess, guesserId: action.senderId, targetId: target.id, at: Date.now() }
      installRoomState({ ...state, pending, turnEndsAt: null })
      if (target.id === selfId) {
        const secret = sessionStorage.getItem(`hld-secret-${activeRoom}-${state.matchNo}-${state.roundNo}-${state.mode}-${selfId}`)
        if (secret != null) handlersRef.current.answerGuess?.(pending, secret)
      }
      emit({ type: 'guess', pending })
      return
    }
    if (action.type === 'answer') {
      if (!state.pending || state.pending.guesserId !== action.guesserId || state.pending.targetId !== action.senderId) return
      handlersRef.current.finishGuess?.(state, action.feedback)
      return
    }
    if (action.type === 'pending-expired') {
      if (!state.pending || state.pending.at !== action.pendingAt || Date.now() < state.pending.at + 5000) return
      installRoomState({ ...state, pending: null, turnEndsAt: Date.now() + TURN_SECONDS * 1000 })
      return
    }
    if (action.type === 'timeout') {
      if (state.status !== 'playing' || state.pending || state.turnId !== action.turnId || Date.now() < state.turnEndsAt) return
      const playerId = state.turnId
      const target = state.players.find((player) => player.id !== playerId)
      const used = (state.attempts[playerId] || 0) + 1
      const misses = (state.misses[playerId] || 0) + 1
      const max = getMaxAttempts(state)
      const timedGuess = { id: `${Date.now()}-${playerId}`, playerId, guess: null, feedback: 'timeout', at: Date.now() }
      const next = { ...state, attempts: { ...state.attempts, [playerId]: used }, misses: { ...state.misses, [playerId]: misses }, guesses: [...state.guesses, timedGuess] }
      if (used >= max || misses >= 2) {
        installRoomState(createSeries(next, target.id, `time\u0000${target.id}\u0000${playerId}`))
      } else {
        installRoomState({ ...next, turnId: target.id, turnEndsAt: Date.now() + TURN_SECONDS * 1000 })
      }
      return
    }
    if (action.type === 'next-round' && state.status === 'round-result') {
      installRoomState(resetRound(state, state.players, state.roundNo + 1))
      return
    }
    if (action.type === 'rematch' && state.status === 'match-result') {
      const reset = resetRound({ ...state, scores: Object.fromEntries(participantIds.map((id) => [id, 0])), matchNo: state.matchNo + 1, summary: [] }, state.players, 1)
      installRoomState(reset)
      return
    }
  }, [activeRoom, emit, installRoomState, selfId, t])

  const answerGuess = useCallback((pending, secret) => {
    const feedback = getFeedback(sharedRef.current?.mode, secret, pending.guess)
    if (isLeaderRef.current) processHostAction({ type: 'answer', senderId: selfId, guesserId: pending.guesserId, feedback })
    else emit({ type: 'action', action: { type: 'answer', senderId: selfId, guesserId: pending.guesserId, feedback } })
  }, [emit, processHostAction, selfId])

  const finishGuess = useCallback((state, feedback) => {
    if (!state?.pending) return
    const pending = state.pending
    const attemptCount = (state.attempts[pending.guesserId] || 0) + 1
    const log = { id: `${Date.now()}-${pending.guesserId}`, playerId: pending.guesserId, guess: pending.guess, feedback: feedback.text, exact: feedback.exact, correct: feedback.correct, at: Date.now() }
    const attempts = { ...state.attempts, [pending.guesserId]: attemptCount }
    const ranges = { ...state.ranges }
    if (state.mode === 'classic' && !feedback.correct) {
      const [low, high] = ranges[pending.guesserId] || [1, MODES.classic[state.difficulty].max]
      ranges[pending.guesserId] = feedback.text === 'higher' ? [Math.max(low, Number(pending.guess) + 1), high] : [low, Math.min(high, Number(pending.guess) - 1)]
    }
    const next = { ...state, pending: null, turnEndsAt: null, attempts, ranges, guesses: [...state.guesses, log] }
    if (feedback.correct) {
      installRoomState(createSeries(next, pending.guesserId, `${pending.guesserId}\u0000${pending.guess}\u0000correct`))
    } else if (attemptCount >= getMaxAttempts(state)) {
      installRoomState(createSeries(next, pending.targetId, `${pending.targetId}\u0000${pending.guesserId}\u0000out`))
    } else {
      installRoomState({ ...next, turnId: pending.targetId, turnEndsAt: Date.now() + TURN_SECONDS * 1000 })
    }
  }, [installRoomState])

  const onRoomMessage = useCallback((message) => {
    if (!message || message.senderId === selfId) return
    const state = sharedRef.current
    const currentPeers = peersRef.current
    const leaderId = currentPeers.find((p) => p.role === 'player')?.id
    if (message.type === 'state') {
      if (message.senderId !== leaderId || !message.state) return
      sharedRef.current = message.state
      setRoomState(message.state)
      try { sessionStorage.setItem(`hld-public-state-${message.state.roomCode}`, JSON.stringify(message.state)) } catch { /* ignore */ }
      return
    }
    if (message.type === 'hello') {
      if (isLeaderRef.current && sharedRef.current) emit({ type: 'state', state: sharedRef.current })
      return
    }
    if (message.type === 'action') {
      if (isLeaderRef.current) processHostAction({ ...message.action, senderId: message.action?.senderId || message.senderId })
      return
    }
    if (message.type === 'guess') {
      const pending = message.pending
      if (!pending || pending.targetId !== selfId) return
      const secret = sessionStorage.getItem(`hld-secret-${activeRoom}-${state?.matchNo}-${state?.roundNo}-${state?.mode}-${selfId}`)
      if (secret != null) answerGuess(pending, secret)
      return
    }
    if (message.type === 'reaction') {
      const id = `${Date.now()}-${Math.random()}`
      setReactions((current) => [...current.slice(-5), { id, emoji: message.emoji, name: message.name }])
      setTimeout(() => setReactions((current) => current.filter((reaction) => reaction.id !== id)), 2600)
    }
  }, [activeRoom, answerGuess, emit, processHostAction, selfId])
  handlersRef.current.answerGuess = answerGuess
  handlersRef.current.finishGuess = finishGuess
  handlersRef.current.onMessage = onRoomMessage

  useEffect(() => {
    if (!activeRoom) return undefined
    setRoomError(''); setRoomStatus('connecting'); setPeers([]); setRoomState(null)
    peersRef.current = []; isLeaderRef.current = false
    try { sharedRef.current = JSON.parse(sessionStorage.getItem(`hld-public-state-${activeRoom}`) || 'null') } catch { sharedRef.current = null }
    const config = getSupabaseConfig()
    const client = createRealtimeClient(config)
    if (!client) { setRoomStatus('error'); setRoomError(t('setupNeeded')); return undefined }
    supabaseRef.current = client
    const channel = client.channel(`room-${activeRoom}`, {
      config: { presence: { key: selfId }, broadcast: { self: false, ack: true } },
    })
    channelRef.current = channel
    channel.on('broadcast', { event: 'duel' }, ({ payload }) => handlersRef.current.onMessage?.(payload))
    let disposed = false
    const reconcile = () => {
      if (disposed) return
      const presence = channel.presenceState()
      const all = Object.entries(presence).flatMap(([key, metas]) => (metas || []).map((meta) => ({
        id: meta.id || key, name: meta.name || t('player'), joinedAt: Number(meta.joinedAt || 0),
      })))
      const deduped = [...new Map(all.map((peer) => [peer.id, peer])).values()].sort((a, b) => a.joinedAt - b.joinedAt)
      const oldState = sharedRef.current || (() => { try { return JSON.parse(sessionStorage.getItem(`hld-public-state-${activeRoom}`) || 'null') } catch { return null } })()
      let playerIds = oldState?.players?.map((player) => player.id) || []
      if (!playerIds.length) playerIds = deduped.slice(0, 2).map((peer) => peer.id)
      else if (playerIds.length < 2) {
        for (const peer of deduped) if (!playerIds.includes(peer.id) && playerIds.length < 2) playerIds.push(peer.id)
      }
      const players = playerIds.map((id) => oldState?.players?.find((player) => player.id === id) || deduped.find((peer) => peer.id === id) || { id, name: t('player') })
      const rolePeers = deduped.map((peer) => ({ ...peer, role: playerIds.includes(peer.id) ? 'player' : 'spectator' }))
      peersRef.current = rolePeers; setPeers(rolePeers)
      const onlineLeader = rolePeers.find((peer) => peer.role === 'player')
      isLeaderRef.current = onlineLeader?.id === selfId
      if (isLeaderRef.current) {
        const ids = players.map((player) => player.id)
        const base = oldState || makeRoomState(activeRoom, players, 'classic', difficulty)
        const mergedPlayers = players.map((player) => ({ ...player, name: deduped.find((peer) => peer.id === player.id)?.name || player.name }))
        const scores = { ...Object.fromEntries(ids.map((id) => [id, 0])), ...(base.scores || {}) }
        const seriesScore = { ...Object.fromEntries(ids.map((id) => [id, 0])), ...(base.seriesScore || {}) }
        const ready = { ...Object.fromEntries(ids.map((id) => [id, false])), ...(base.ready || {}) }
        const attempts = { ...Object.fromEntries(ids.map((id) => [id, 0])), ...(base.attempts || {}) }
        const misses = { ...Object.fromEntries(ids.map((id) => [id, 0])), ...(base.misses || {}) }
        const fallbackRange = base.mode === 'classic' ? [MODES.classic[base.difficulty].min, MODES.classic[base.difficulty].max] : [0, 9999]
        const ranges = { ...Object.fromEntries(ids.map((id) => [id, [...fallbackRange]])), ...(base.ranges || {}) }
        const next = { ...base, roomCode: activeRoom, players: mergedPlayers, leaderId: selfId, scores, seriesScore, ready, attempts, misses, ranges }
        sharedRef.current = next; setRoomState(next)
        try { sessionStorage.setItem(`hld-public-state-${activeRoom}`, JSON.stringify(next)) } catch { /* ignore */ }
        channel.send({ type: 'broadcast', event: 'duel', payload: { type: 'state', senderId: selfId, state: next, sentAt: Date.now() } })
      } else {
        channel.send({ type: 'broadcast', event: 'duel', payload: { type: 'hello', senderId: selfId, sentAt: Date.now() } })
      }
    }
    channel.on('presence', { event: 'sync' }, reconcile)
    channel.on('presence', { event: 'join' }, reconcile)
    channel.on('presence', { event: 'leave' }, reconcile)
    channel.subscribe(async (status) => {
      if (disposed) return
      if (status === 'SUBSCRIBED') {
        setRoomStatus('connected')
        await channel.track({ id: selfId, name: displayName, joinedAt: Date.now() })
        setTimeout(reconcile, 150)
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        setRoomStatus('error')
        setRoomError(t('offline'))
      }
    })
    return () => {
      disposed = true
      if (channelRef.current === channel) channelRef.current = null
      isLeaderRef.current = false
      client.removeChannel(channel)
    }
  }, [activeRoom, selfId, displayName, difficulty, t])

  useEffect(() => {
    if (!roomState || roomStatus !== 'connected' || !isLeaderRef.current || roomState.status !== 'playing' || roomState.pending || !roomState.turnEndsAt) return undefined
    if (now >= roomState.turnEndsAt) processHostAction({ type: 'timeout', senderId: roomState.turnId, turnId: roomState.turnId })
    return undefined
  }, [now, processHostAction, roomState, roomStatus])

  useEffect(() => {
    if (!roomState?.pending || roomStatus !== 'connected' || !isLeaderRef.current || now < roomState.pending.at + 5000) return undefined
    processHostAction({ type: 'pending-expired', senderId: selfId, pendingAt: roomState.pending.at })
    return undefined
  }, [now, processHostAction, roomState?.pending, roomStatus, selfId])

  useEffect(() => {
    if (!roomState || !activeRoom || roomState.status !== 'lobby') { setSecretDraft(''); return }
    const value = sessionStorage.getItem(`hld-secret-${activeRoom}-${roomState.matchNo}-${roomState.roundNo}-${roomState.mode}-${selfId}`)
    setSecretDraft(value || '')
  }, [activeRoom, roomState?.matchNo, roomState?.roundNo, roomState?.status, roomState?.mode, selfId])

  useEffect(() => {
    if (roomState?.status === 'match-result' && roomState.roundWinner === selfId) {
      setConfetti(true); playSound('win')
      const timer = setTimeout(() => setConfetti(false), 3500)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [roomState?.status, roomState?.roundWinner, selfId, playSound])

  const remaining = roomState?.turnEndsAt ? Math.max(0, Math.ceil((roomState.turnEndsAt - now) / 1000)) : TURN_SECONDS

  useEffect(() => {
    if (roomState?.status !== 'playing' || !roomState.turnEndsAt || roomState.turnId !== selfId || remaining > 5 || remaining <= 0) return
    const cue = `${roomState.turnEndsAt}-${remaining}`
    if (timerCueRef.current !== cue) { timerCueRef.current = cue; playSound('timer') }
  }, [roomState?.status, roomState?.turnEndsAt, roomState?.turnId, remaining, selfId, playSound])

  useEffect(() => {
    const latest = roomState?.guesses?.at(-1)
    if (!latest || latest.id === guessCueRef.current) return
    guessCueRef.current = latest.id
    if (latest.feedback === 'higher') playSound('higher')
    else if (latest.feedback === 'lower') playSound('lower')
    else if (latest.correct) playSound('win')
    else if (latest.feedback === 'timeout') playSound('timer')
  }, [roomState?.guesses, playSound])

  const myPeer = peers.find((peer) => peer.id === selfId)
  const isSpectator = myPeer?.role === 'spectator'
  const opponent = roomState?.players?.find((player) => player.id !== selfId)
  const opponentOnline = peers.some((peer) => peer.id === opponent?.id)
  const myTurn = roomState?.turnId === selfId
  const maxAttempts = roomState ? getMaxAttempts(roomState) : 0
  const myAttempts = roomState?.attempts?.[selfId] || 0
  const ownRange = roomState?.ranges?.[selfId] || [1, 100]
  const classicSettings = roomState?.mode === 'classic' ? MODES.classic[roomState.difficulty] : null
  const rangePercentage = (n) => classicSettings ? Math.max(0, Math.min(100, ((n - classicSettings.min) / (classicSettings.max - classicSettings.min)) * 100)) : 0

  function startRoom(code) {
    const clean = String(code).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5)
    if (clean.length !== 5) { setRoomError(t('errorCode')); return }
    if (!name.trim()) { setRoomError(t('errorName')); return }
    const config = getSupabaseConfig()
    if (!createRealtimeClient(config)) { setConfigDraft(config); setSettingsOpen(true); setConfigMessage(t('setupNeeded')); return }
    localStorage.setItem('hld-name', name.trim())
    setRoomError(''); setJoinInput(clean); setActiveRoom(clean); setSoloOpen(false); setSolo(null)
    const url = new URL(location.href); url.searchParams.set('room', clean); history.replaceState({}, '', url)
  }

  function leaveRoom() {
    setActiveRoom(''); setRoomState(null); setPeers([]); setRoomStatus('idle'); setRoomError(''); setGuessDraft(''); setSecretDraft('')
    const url = new URL(location.href); url.searchParams.delete('room'); history.replaceState({}, '', url)
  }

  function sendAction(action) {
    playSound('click')
    if (isSpectator) return
    if (isLeaderRef.current) processHostAction({ ...action, senderId: selfId })
    else emit({ type: 'action', action: { ...action, senderId: selfId } })
  }

  function updateSettings(mode, nextDifficulty = roomState?.difficulty || difficulty) {
    sendAction({ type: 'settings', mode, difficulty: nextDifficulty })
  }

  function submitSecret(event) {
    event?.preventDefault()
    const valid = roomState?.mode === 'code' ? /^\d{4}$/.test(secretDraft) : /^\d+$/.test(secretDraft) && Number(secretDraft) >= classicSettings.min && Number(secretDraft) <= classicSettings.max
    if (!valid) { setToast(t('errorSecret')); return }
    sessionStorage.setItem(`hld-secret-${activeRoom}-${roomState.matchNo}-${roomState.roundNo}-${roomState.mode}-${selfId}`, String(secretDraft))
    playSound('click'); sendAction({ type: 'ready' })
  }

  function submitGuess(event) {
    event?.preventDefault()
    if (!roomState || roomState.status !== 'playing' || !myTurn || isSpectator) return
    const valid = roomState.mode === 'code' ? /^\d{4}$/.test(guessDraft) : /^\d+$/.test(guessDraft) && Number(guessDraft) >= classicSettings.min && Number(guessDraft) <= classicSettings.max
    if (!valid) { setToast(t('errorSecret')); return }
    sendAction({ type: 'guess', guess: String(guessDraft) }); setGuessDraft('')
  }

  function pressDigit(digit) {
    if (isSpectator) return
    setGuessDraft((value) => `${value}${digit}`.slice(0, roomState?.mode === 'code' ? 4 : String(classicSettings?.max || 1000).length))
    playSound('click')
  }

  function chooseReaction(emoji) {
    const id = `${Date.now()}-${Math.random()}`
    setReactions((current) => [...current.slice(-5), { id, emoji, name: t('you') }])
    setTimeout(() => setReactions((current) => current.filter((reaction) => reaction.id !== id)), 2400)
    if (isSpectator) emit({ type: 'action', action: { type: 'reaction', emoji, senderId: selfId } })
    else sendAction({ type: 'reaction', emoji })
  }

  async function copyRoomLink() {
    const link = `${location.origin}${location.pathname}?room=${activeRoom}`
    try { await navigator.clipboard.writeText(link); setToast(t('copied')) }
    catch { setToast(link) }
  }

  async function shareResult() {
    const winnerName = roomState.players.find((player) => player.id === roomState.roundWinner)?.name || t('player')
    const scoreLine = roomState.players.map((player) => `${player.name} ${roomState.scores[player.id] || 0}`).join(' · ')
    const text = `${t('shareText')}\n${winnerName} 🏆\n${scoreLine}\n${location.href}`
    try {
      const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 630
      const context = canvas.getContext('2d')
      const background = context.createLinearGradient(0, 0, 1200, 630); background.addColorStop(0, '#171321'); background.addColorStop(.56, '#252039'); background.addColorStop(1, '#111812')
      context.fillStyle = background; context.fillRect(0, 0, 1200, 630)
      context.fillStyle = '#c9f27a'; context.globalAlpha = .1; context.beginPath(); context.arc(1040, 110, 230, 0, Math.PI * 2); context.fill(); context.globalAlpha = 1
      context.strokeStyle = 'rgba(255,255,255,.16)'; context.lineWidth = 2; context.strokeRect(42, 42, 1116, 546)
      context.direction = rtl ? 'rtl' : 'ltr'; context.textAlign = rtl ? 'right' : 'left'
      const alignX = rtl ? 1080 : 120
      context.fillStyle = '#c9f27a'; context.font = '700 24px Inter, "Segoe UI", sans-serif'; context.fillText('HIGHER / LOWER  ·  CODE DUEL', alignX, 112)
      context.fillStyle = '#aaa4b8'; context.font = '600 23px Inter, "Segoe UI", sans-serif'; context.fillText(t('shareResult'), alignX, 190)
      context.fillStyle = '#f7f4ff'; context.font = `800 66px ${rtl ? '"Noto Sans Arabic", "Segoe UI"' : 'Inter, "Segoe UI"'}, sans-serif`; context.fillText(winnerName, alignX, 282, 950)
      context.fillStyle = '#c9f27a'; context.font = '800 32px Inter, "Segoe UI", sans-serif'; context.fillText('🏆', rtl ? 118 : 1082, 276)
      context.fillStyle = '#f7f4ff'; context.font = '700 46px Inter, "Segoe UI", sans-serif'; context.fillText(scoreLine, alignX, 390, 960)
      context.fillStyle = '#aaa4b8'; context.font = '600 22px Inter, "Segoe UI", sans-serif'; context.fillText(`${t(roomState.mode)}  ·  ${t('round')} ${roomState.roundNo}  ·  ${activeRoom}`, alignX, 472)
      context.fillStyle = '#a8a2b3'; context.font = '500 17px Inter, "Segoe UI", sans-serif'; context.direction = 'ltr'; context.textAlign = 'left'; context.fillText(location.href, 120, 545, 950)
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('Could not render result card')
      const file = new File([blob], 'higher-lower-result.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'Higher / Lower & Code Duel', text, url: location.href })
      else {
        const objectUrl = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = objectUrl; link.download = 'higher-lower-result.png'; link.click(); URL.revokeObjectURL(objectUrl)
        if (navigator.share) await navigator.share({ title: 'Higher / Lower & Code Duel', text, url: location.href })
        else { await navigator.clipboard?.writeText(text); setToast(t('copied')) }
      }
    } catch { /* user dismissed sharing or device lacks native share support */ }
  }

  function saveSettings() {
    const url = configDraft.url.trim()
    const key = configDraft.key.trim()
    if (url && key && !/^https:\/\//.test(url)) { setConfigMessage(t('settingsBody')); return }
    saveSupabaseConfig({ url, key }); setConfigMessage(t('configSaved')); setToast(t('configSaved')); setSettingsOpen(false)
    if (activeRoom) { leaveRoom(); setTimeout(() => startRoom(joinInput || activeRoom), 0) }
  }

  function startSolo() {
    const selectedMode = soloMode
    const cfg = selectedMode === 'classic' ? MODES.classic[difficulty] : { min: 0, max: 9999, attempts: 10 }
    const botSecret = String(Math.floor(Math.random() * (cfg.max - cfg.min + 1)) + cfg.min).padStart(selectedMode === 'code' ? 4 : 1, '0')
    setSolo({ runId: crypto.randomUUID(), mode: selectedMode, difficulty, low: cfg.min, high: cfg.max, botSecret, playerSecret: '', attempts: 0, maxAttempts: selectedMode === 'code' ? 10 : cfg.attempts, guesses: [], botLow: cfg.min, botHigh: cfg.max, botAttempts: 0, botCandidates: Array.from({ length: 10000 }, (_, index) => String(index).padStart(4, '0')), botTried: [], finished: false, winner: null, playerFeedback: null, botFeedback: null })
    setSoloTurn('you'); setBotDraft(''); setSecretDraft(''); setSoloOpen(false); playSound('click')
  }

  function soloSubmitSecret(event) {
    event.preventDefault()
    const valid = solo.mode === 'code' ? /^\d{4}$/.test(secretDraft) : /^\d+$/.test(secretDraft) && Number(secretDraft) >= solo.low && Number(secretDraft) <= solo.high
    if (!valid) { setToast(t('errorSecret')); return }
    setSolo((current) => ({ ...current, playerSecret: String(secretDraft) })); setSecretDraft(''); setSoloTurn('you')
  }

  function soloGuess(event) {
    event.preventDefault()
    if (!solo || solo.finished || soloTurn !== 'you') return
    const guess = solo.mode === 'code' ? String(guessDraft).padStart(4, '0') : String(guessDraft)
    if (solo.mode === 'code' ? !/^\d{4}$/.test(guess) : !/^\d+$/.test(guess) || Number(guess) < solo.low || Number(guess) > solo.high) { setToast(t('errorSecret')); return }
    const feedback = getFeedback(solo.mode, solo.botSecret, guess)
    const attempt = solo.attempts + 1
    const entry = { id: Date.now(), guess, feedback: feedback.text, playerId: 'you', correct: feedback.correct }
    const range = [...(solo.range || [solo.low, solo.high])]
    if (solo.mode === 'classic' && !feedback.correct) feedback.text === 'higher' ? range[0] = Math.max(range[0], Number(guess) + 1) : range[1] = Math.min(range[1], Number(guess) - 1)
    const finished = feedback.correct || attempt >= solo.maxAttempts
    const afterPlayer = { ...solo, attempts: attempt, guesses: [...solo.guesses, entry], range, finished, winner: feedback.correct ? 'you' : finished ? 'bot' : null, playerFeedback: feedback.text }
    setSolo(afterPlayer)
    setGuessDraft(''); playSound(feedback.correct ? 'win' : feedback.text === 'higher' ? 'higher' : feedback.text === 'lower' ? 'lower' : 'click')
    if (finished) return
    setSoloTurn('bot')
    window.setTimeout(() => {
      const result = advanceSoloBot(afterPlayer)
      setSolo((current) => current?.runId === solo.runId ? result.next : current)
      setSoloTurn('you')
      if (result.sound) playSound(result.sound)
    }, 650)
  }

  const iconButton = (title, Icon, onClick, extra = '') => <button type="button" title={title} aria-label={title} onClick={() => { playSound(); onClick() }} className={`control grid h-10 w-10 place-items-center rounded-xl ${extra}`}><Icon size={17} /></button>

  return (
    <main className={`app-shell ${theme === 'light' ? 'light' : ''} min-h-screen`}>
      <div className="grid-glow pointer-events-none fixed inset-x-0 top-0 h-[520px] opacity-75" />
      {confetti && Array.from({ length: 44 }, (_, index) => <i key={index} className="confetti-piece" style={{ left: `${(index * 41 + 6) % 100}%`, background: ['#c9f27a', '#8c6dff', '#ffbd70', '#f88bad'][index % 4], animationDelay: `${(index % 9) * .14}s`, animationDuration: `${2.2 + (index % 7) * .23}s` }} />)}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-7 sm:py-6">
        <button type="button" onClick={leaveRoom} className="flex items-center gap-3 text-start" aria-label={t('backHome')}>
          <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-lime text-ink shadow-[0_6px_20px_rgba(201,242,122,.18)]"><Zap size={21} fill="currentColor" /></span>
          <span><span className="block text-[14px] font-extrabold tracking-tight">HIGHER <b className="text-violet">/</b> LOWER</span><span className="block text-[10px] font-bold tracking-[.23em] text-lime">CODE DUEL</span></span>
        </button>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-medium text-zinc-400 sm:block">{t('powered')}</span>
          {iconButton(lang === 'ar' ? 'English' : 'العربية', Globe2, () => setLang((current) => current === 'ar' ? 'en' : 'ar'))}
          {iconButton(theme === 'dark' ? t('light') : t('dark'), theme === 'dark' ? Sun : Moon, () => setTheme((current) => current === 'dark' ? 'light' : 'dark'))}
          {iconButton(sound ? t('mute') : t('unmute'), sound ? Volume2 : VolumeX, () => setSound((current) => !current))}
          {iconButton(t('settings'), Settings2, () => { setConfigDraft(getSupabaseConfig()); setSettingsOpen(true) })}
        </div>
      </header>

      {!activeRoom && !solo && <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-7 sm:px-7 sm:pt-14">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[.08] px-3.5 py-2 text-[11px] font-semibold text-violet-200"><Sparkles size={13} className="text-lime" /> {t('tagline')}</div>
          <h1 className="text-balance text-[clamp(2.3rem,8vw,5.5rem)] font-black leading-[.99] tracking-[-.055em]">{lang === 'ar' ? <>خمن. تحدَّ.<br /><span className="gradient-word">احسم المواجهة.</span></> : <>Guess. Challenge.<br /><span className="gradient-word">Claim the win.</span></>}</h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">{t('subtitle')}</p>
          <div className="mt-5 inline-flex items-center gap-2 text-[11px] font-medium text-zinc-500"><ShieldCheck size={14} className="text-lime" />{t('powered')}</div>
        </div>

        <div className="mx-auto mt-11 grid max-w-4xl gap-4 md:grid-cols-[1fr_1fr]">
          <article className="surface relative overflow-hidden rounded-[26px] p-5 sm:p-7">
            <div className="absolute -end-12 -top-12 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="relative flex items-start justify-between gap-3"><div><span className="mb-3 grid h-11 w-11 place-items-center rounded-2xl violet"><Wifi size={20} /></span><h2 className="text-xl font-bold">{t('online')}</h2><p className="mt-1 text-xs muted">{t('onlineHint')}</p></div><span className="rounded-full border border-lime/15 bg-lime/[.07] px-2.5 py-1 text-[10px] font-semibold text-lime">{t('bestOf')}</span></div>
            <div className="relative mt-6 space-y-3">
              <label className="block text-[11px] font-semibold muted">{t('yourName')}</label>
              <input value={name} maxLength={20} onChange={(event) => setName(event.target.value)} placeholder={t('namePlaceholder')} className="control h-12 w-full rounded-xl px-4 text-sm outline-none placeholder:text-zinc-600" />
              <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                <button type="button" onClick={() => startRoom(makeRoomCode())} className="primary flex h-[50px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold"><Plus size={17} />{t('create')}</button>
                <div className="flex h-[50px] gap-2">
                  <input value={joinInput} onChange={(event) => setJoinInput(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))} maxLength={5} placeholder={t('codePlaceholder')} className="control min-w-0 flex-1 rounded-xl px-3 text-center font-mono text-sm font-bold tracking-[.18em] outline-none placeholder:font-sans placeholder:tracking-normal" />
                  <button type="button" onClick={() => startRoom(joinInput)} className="control rounded-xl px-4 text-sm font-bold"><Link2 size={17} /></button>
                </div>
              </div>
              <div className="flex justify-between text-[10px] muted"><span>{t('createHint')}</span><span>{t('joinHint')}</span></div>
              {roomError && !activeRoom && <p className="rounded-xl border border-rose-400/20 bg-rose-400/[.07] px-3 py-2 text-xs text-rose-300">{roomError}</p>}
            </div>
            <div className="relative mt-5 flex items-start gap-2 border-t pt-4 text-[10px] leading-5 soft-border muted"><LockKeyhole size={13} className="mt-0.5 shrink-0 text-lime" />{t('connectionTip')}</div>
          </article>

          <article className="surface flex flex-col rounded-[26px] p-5 sm:p-7">
            <div className="flex items-start justify-between"><div><span className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-lime/[.09] text-lime"><Gamepad2 size={20} /></span><h2 className="text-xl font-bold">{t('solo')}</h2><p className="mt-1 text-xs muted">{t('practice')}</p></div><span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold muted">OFFLINE</span></div>
            <div className="mt-7 grid grid-cols-2 gap-2">
              {['classic', 'code'].map((mode) => <button key={mode} type="button" onClick={() => setSoloMode(mode)} className={`rounded-xl border p-3 text-start transition ${soloMode === mode ? 'border-lime/40 bg-lime/[.08]' : 'control'}`}><span className={`text-sm font-bold ${soloMode === mode ? 'text-lime' : ''}`}>{t(mode)}</span><span className="mt-1 block text-[10px] leading-4 muted">{t(mode === 'classic' ? 'classicSub' : 'codeSub')}</span></button>)}
            </div>
            {soloMode === 'classic' && <div className="mt-4"><div className="mb-2 text-[10px] font-semibold muted">{t('difficulty')}</div><div className="grid grid-cols-3 gap-2">{['easy', 'normal', 'hard'].map((level) => <button key={level} type="button" onClick={() => setDifficulty(level)} className={`rounded-lg border py-2 text-xs font-semibold ${difficulty === level ? 'border-violet/60 bg-violet/20 text-violet-100' : 'control muted'}`}>{t(level)}</button>)}</div></div>}
            <button type="button" onClick={() => { setSoloOpen(true); setSoloMode(soloMode) }} className="primary mt-auto flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold"><Zap size={16} />{t('startSolo')}</button>
          </article>
        </div>

        <div className="mx-auto mt-6 grid max-w-4xl grid-cols-3 gap-3 text-center">
          {[[LockKeyhole, t('powered')], [Trophy, t('bestOf')], [Music2, t('soundOn')]].map(([Icon, label], index) => <div key={index} className="rounded-2xl border px-3 py-3 soft-border bg-white/[.018]"><Icon size={15} className="mx-auto mb-1.5 text-lime" /><span className="text-[10px] font-medium muted">{label}</span></div>)}
        </div>
      </section>}

      {activeRoom && <RoomView {...{ t, lang, rtl, activeRoom, roomStatus, roomError, roomState, peers, selfId, displayName, opponent, opponentOnline, myTurn, isSpectator, remaining, now, maxAttempts, myAttempts, ownRange, rangePercentage, classicSettings, guessDraft, setGuessDraft, secretDraft, setSecretDraft, reactions, sendAction, updateSettings, submitSecret, submitGuess, pressDigit, chooseReaction, copyRoomLink, shareResult, leaveRoom, playSound, toast, setToast }} />}

      {solo && <SoloView {...{ t, lang, rtl, solo, soloTurn, setSoloTurn, botDraft, setBotDraft, guessDraft, setGuessDraft, secretDraft, setSecretDraft, soloSubmitSecret, soloGuess, pressDigit, playSound, setSolo, startSolo, difficulty, reactions, setReactions }} />}

      {soloOpen && <SoloSetupModal {...{ t, soloMode, setSoloMode, difficulty, setDifficulty, setSoloOpen, startSolo }} />}

      {settingsOpen && <SettingsModal t={t} configDraft={configDraft} setConfigDraft={setConfigDraft} onClose={() => setSettingsOpen(false)} onSave={saveSettings} message={configMessage} />}

      {toast && <div role="status" className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#211e2b] px-4 py-3 text-xs font-semibold shadow-2xl float-in">{toast}</div>}
      <footer className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 pb-6 pt-2 text-[10px] muted sm:px-7"><span>© {new Date().getFullYear()} · HIGHER / LOWER</span><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-lime pulse-dot" />Realtime duel</span></footer>
    </main>
  )
}

function RoomView({ t, lang, rtl, activeRoom, roomStatus, roomError, roomState, peers, selfId, displayName, opponent, opponentOnline, myTurn, isSpectator, remaining, now, maxAttempts, myAttempts, ownRange, rangePercentage, classicSettings, guessDraft, setGuessDraft, secretDraft, setSecretDraft, reactions, sendAction, updateSettings, submitSecret, submitGuess, pressDigit, chooseReaction, copyRoomLink, shareResult, leaveRoom, playSound, toast, setToast }) {
  const countdownPercent = Math.max(0, Math.min(100, (remaining / TURN_SECONDS) * 100))
  const onlinePlayers = peers.filter((peer) => peer.role === 'player')
  const names = roomState?.players || []
  const myProfile = names.find((player) => player.id === selfId)
  const opponentProfile = names.find((player) => player.id !== selfId)
  const readyToPlay = roomState?.status === 'lobby' && names.length === 2 && names.every((player) => roomState.ready?.[player.id])
  const waitingForOpponent = names.length < 2 || (opponentProfile && !opponentOnline)
  const isResult = roomState?.status === 'round-result' || roomState?.status === 'match-result'
  const won = roomState?.roundWinner === selfId
  const matchDone = roomState?.status === 'match-result'
  const fmtGuess = (guess) => roomState?.mode === 'code' ? String(guess ?? '----').padStart(4, '0') : String(guess ?? '—')

  return <section className="relative z-10 mx-auto max-w-6xl px-4 pb-10 pt-3 sm:px-7 sm:pt-5">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button type="button" onClick={leaveRoom} className="control grid h-10 w-10 place-items-center rounded-xl" title={t('backHome')}><ArrowLeft size={17} className={rtl ? 'rotate-180' : ''} /></button>
        <div><div className="flex items-center gap-2"><h1 className="text-lg font-black">{t('lobby')}</h1><span className="rounded-full border border-white/10 bg-white/[.035] px-2 py-1 font-mono text-[10px] font-bold tracking-[.16em] text-lime">{activeRoom}</span></div><div className="mt-1 flex items-center gap-1.5 text-[10px] muted"><span className={`h-1.5 w-1.5 rounded-full ${roomStatus === 'connected' ? 'bg-lime' : roomStatus === 'connecting' ? 'animate-pulse bg-amber-300' : 'bg-rose-400'}`} />{roomStatus === 'connected' ? t('connected') : roomStatus === 'connecting' ? t('connecting') : t('offline')}</div></div>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={copyRoomLink} className="control flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold"><Copy size={15} />{t('copyLink')}</button>
        <span className="hidden rounded-xl border px-3 py-2 text-[10px] font-semibold muted soft-border sm:flex sm:items-center sm:gap-2"><Eye size={14} />{t('spectators')}: {Math.max(0, peers.filter((peer) => peer.role === 'spectator').length)}</span>
      </div>
    </div>

    {(roomError || (waitingForOpponent && roomState?.status === 'playing')) && <div role="status" className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-300/15 bg-amber-300/[.06] px-4 py-3 text-xs text-amber-100/90"><WifiOff size={15} />{roomError || t('opponentLeft')}</div>}

    {!roomState && <div className="surface mx-auto mt-20 max-w-md rounded-3xl p-8 text-center"><LoaderCircle className="mx-auto animate-spin text-lime" size={25} /><p className="mt-4 text-sm font-semibold">{roomStatus === 'error' ? t('setupNeeded') : t('connecting')}</p>{roomStatus === 'error' && <p className="mt-2 text-xs muted">{roomError}</p>}</div>}

    {roomState && <>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <div className="surface rounded-[24px] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-2"><div><div className="text-[10px] font-bold uppercase tracking-[.2em] text-violet-200">{t('score')}</div><div className="mt-1 text-xl font-black">{t('bestOf')} <span className="mx-1 text-zinc-600">·</span> {t('round')} {roomState.roundNo}</div></div><span className="rounded-xl border border-lime/15 bg-lime/[.06] px-3 py-2 text-[10px] font-bold text-lime">{t('series')} #{roomState.matchNo}</span></div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
              <PlayerScore player={myProfile} score={roomState.scores[selfId] || 0} isMe online={peers.some((peer) => peer.id === selfId)} t={t} />
              <div className="flex flex-col items-center gap-1"><span className="text-[9px] font-bold tracking-[.2em] text-zinc-600">VS</span><div className="flex gap-1">{[0,1].map((point) => <span key={point} className={`h-1.5 w-5 rounded-full ${point < (roomState.scores[selfId] || 0) ? 'bg-lime' : 'bg-white/10'}`} />)}</div></div>
              <PlayerScore player={opponentProfile} score={opponentProfile ? roomState.scores[opponentProfile.id] || 0 : 0} online={opponentOnline} t={t} />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border px-3 py-2 soft-border bg-white/[.018]"><span className="text-[9px] font-semibold muted">{t('totalWins')}</span><div className="flex gap-3 font-mono text-[10px] font-bold"><span>{roomState.seriesScore?.[selfId] || 0}</span><span className="text-zinc-600">·</span><span>{opponentProfile ? roomState.seriesScore?.[opponentProfile.id] || 0 : 0}</span></div></div>
          </div>

          {roomState.status === 'lobby' && <div className="surface rounded-[24px] p-4 sm:p-6">
            <div className="mb-4 flex items-end justify-between gap-2"><div><div className="text-[10px] font-bold uppercase tracking-[.18em] text-violet-200">{t('chooseMode')}</div><h2 className="mt-1 text-lg font-bold">{t('round')} {roomState.roundNo}</h2></div>{roomState.players.length === 2 && <span className="text-[10px] muted">{roomState.players.filter((player) => roomState.ready?.[player.id]).length}/2 {t('ready')}</span>}</div>
            {roomState.roundNo === 1 && roomState.scores?.[selfId] === 0 && <div className="mb-4 grid grid-cols-2 gap-2">
              {['classic','code'].map((mode) => <button key={mode} disabled={isSpectator || roomState.ready?.[selfId] || roomState.ready?.[opponentProfile?.id]} type="button" onClick={() => updateSettings(mode)} className={`rounded-2xl border p-3 text-start transition ${roomState.mode === mode ? 'border-violet/60 bg-violet/[.12]' : 'control'}`}><div className="flex items-center justify-between"><span className={`text-sm font-bold ${roomState.mode === mode ? 'text-violet-100' : ''}`}>{t(mode)}</span>{roomState.mode === mode && <Check size={15} className="text-lime" />}</div><p className="mt-1 text-[10px] leading-4 muted">{t(mode === 'classic' ? 'classicSub' : 'codeSub')}</p></button>)}
            </div>}
            {roomState.mode === 'classic' && <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 soft-border bg-white/[.02]"><span className="text-xs font-semibold">{t('difficulty')}</span><div className="flex gap-1.5">{['easy','normal','hard'].map((level) => <button key={level} type="button" disabled={isSpectator || roomState.ready?.[selfId] || roomState.ready?.[opponentProfile?.id]} onClick={() => updateSettings('classic', level)} className={`rounded-lg px-3 py-1.5 text-[10px] font-bold transition ${roomState.difficulty === level ? 'bg-violet/25 text-violet-100' : 'control muted'}`}>{t(level)}</button>)}</div><span className="w-full text-[10px] muted">{t('range')}: {classicSettings?.min}–{classicSettings?.max} · {maxAttempts || MODES.classic[roomState.difficulty].attempts} {t('guesses')}</span></div>}
            {roomState.mode === 'code' && <div className="mb-4 rounded-xl border border-violet/15 bg-violet/[.06] px-3 py-2 text-[10px] leading-5 muted">{t('codeHint')}</div>}
            {isSpectator && <div className="mb-4 rounded-xl border border-amber-300/15 bg-amber-300/[.06] p-3 text-xs text-amber-100"><Eye className="me-2 inline" size={14} />{t('roomFull')}</div>}
            {names.length < 2 && <div className="my-5 rounded-2xl border border-dashed px-4 py-6 text-center soft-border"><div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-white/[.04] text-violet-200"><LoaderCircle className="animate-spin" size={20} /></div><p className="mt-3 text-sm font-bold">{t('waiting')}</p><p className="mt-1 text-xs muted">{t('waitingHelp')}</p></div>}
            {names.length === 2 && !isSpectator && <div className="grid gap-3 md:grid-cols-2">
              {names.map((player) => {
                const isSelf = player.id === selfId
                const secretKey = `hld-secret-${roomState.roomCode}-${roomState.matchNo}-${roomState.roundNo}-${roomState.mode}-${selfId}`
                const mySecret = isSelf ? sessionStorage.getItem(secretKey) : null
                const ready = roomState.ready?.[player.id]
                return <div key={player.id} className={`rounded-2xl border p-4 ${isSelf ? 'border-lime/20 bg-lime/[.035]' : 'soft-border bg-white/[.02]'}`}>
                  <div className="flex items-center justify-between"><div><div className="text-[10px] font-bold muted">{isSelf ? t('you') : t('opponent')}</div><div className="mt-1 text-sm font-bold">{isSelf ? displayName : player.name}</div></div><span className={`h-2 w-2 rounded-full ${ready ? 'bg-lime' : 'bg-white/15'}`} /></div>
                  {isSelf && !ready && <form onSubmit={submitSecret} className="mt-4">
                    <label className="mb-2 block text-xs font-bold">{t(roomState.mode === 'code' ? 'chooseSecretCode' : 'chooseSecret')}</label>
                    <p className="mb-3 text-[10px] leading-4 muted">{t(roomState.mode === 'code' ? 'secretCodeHint' : 'secretHint')}</p>
                    <div className="flex gap-2"><input inputMode="numeric" autoComplete="off" value={secretDraft} onChange={(event) => setSecretDraft(event.target.value.replace(/\D/g, '').slice(0, roomState.mode === 'code' ? 4 : 4))} maxLength={roomState.mode === 'code' ? 4 : 4} placeholder={t(roomState.mode === 'code' ? 'codeSecretPlaceholder' : 'secretPlaceholder')} className="control h-11 min-w-0 flex-1 rounded-xl px-3 text-center font-mono text-lg font-bold tracking-[.2em] outline-none" /><button type="submit" className="primary rounded-xl px-4 text-xs font-bold">{t('ready')}</button></div>
                  </form>}
                  {isSelf && ready && <div className="mt-4 flex items-center gap-2 rounded-xl border border-lime/15 bg-lime/[.05] px-3 py-2 text-xs font-semibold text-lime"><Check size={15} />{t('readyWaiting')}{mySecret && <span className="ms-auto tracking-[.2em]">{roomState.mode === 'code' ? '••••' : '•••'}</span>}</div>}
                  {!isSelf && <div className="mt-4 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs soft-border"><span className={`h-1.5 w-1.5 rounded-full ${roomState.ready?.[player.id] ? 'bg-lime' : 'bg-zinc-600'}`} />{roomState.ready?.[player.id] ? t('ready') : opponentOnline ? t('waitingForOpponent') : t('opponentLeft')}</div>}
                </div>
              })}
            </div>}
            {readyToPlay && <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-lime/[.08] py-3 text-xs font-bold text-lime"><Sparkles size={14} />{t('bothReady')}</div>}
          </div>}

          {roomState.status === 'playing' && <div className="surface rounded-[24px] p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3"><div className={`relative grid h-14 w-14 place-items-center rounded-full ${remaining <= 5 && myTurn ? 'bg-rose-400/[.12] text-rose-300' : 'bg-lime/[.09] text-lime'}`}><svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="43" fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="5"/><circle className="timer-ring" cx="50" cy="50" r="43" fill="none" stroke={remaining <= 5 ? '#fb7185' : '#c9f27a'} strokeWidth="5" pathLength="100" strokeDashoffset={100 - countdownPercent}/></svg><span className="text-lg font-black tabular-nums">{remaining}</span></div><div><div className={`text-sm font-bold ${myTurn ? 'text-lime' : ''}`}>{myTurn ? t('yourTurn') : t('opponentTurn')}</div><div className="mt-1 text-[10px] muted">{myTurn ? t('enterGuess') : t('turnIn')}</div></div></div>
              <span className="rounded-xl border px-3 py-2 text-[10px] font-bold muted soft-border">{t('attemptsLeft')}: {Math.max(0, maxAttempts - (roomState.attempts?.[roomState.turnId] || 0))}</span>
            </div>
            {!opponentOnline && <div className="mb-4 rounded-xl border border-amber-300/15 bg-amber-300/[.06] px-3 py-2 text-[11px] text-amber-100">{t('opponentLeft')}</div>}
            {roomState.mode === 'classic' && <RangeBar t={t} range={ownRange} settings={classicSettings} rangePercentage={rangePercentage} />}
            {roomState.pending && <div className="mb-4 rounded-xl border border-violet/20 bg-violet/[.08] py-4 text-center"><div className="text-xs font-semibold muted">{roomState.pending.guesserId === selfId ? t('opponentTurn') : t('botThinking')}</div><div className="mt-1 font-mono text-2xl font-black tracking-[.2em] text-violet-100">{fmtGuess(roomState.pending.guess)}</div></div>}
            {myTurn && !roomState.pending && !isSpectator && <form onSubmit={submitGuess} className="mt-5">
              <label className="mb-2 block text-xs font-bold">{t('enterGuess')}</label>
              <div className="flex gap-2"><input inputMode="numeric" autoComplete="off" value={guessDraft} onChange={(event) => setGuessDraft(event.target.value.replace(/\D/g, '').slice(0, roomState.mode === 'code' ? 4 : String(classicSettings.max).length))} maxLength={roomState.mode === 'code' ? 4 : String(classicSettings.max).length} placeholder={roomState.mode === 'code' ? '0000' : `${classicSettings.min} – ${classicSettings.max}`} className="control h-12 min-w-0 flex-1 rounded-xl px-4 text-center font-mono text-xl font-bold tracking-[.2em] outline-none" /><button type="submit" disabled={!guessDraft || (roomState.mode === 'code' && guessDraft.length !== 4)} className="primary flex h-12 items-center gap-2 rounded-xl px-5 text-sm font-bold"><Send size={15} />{t('makeGuess')}</button></div>
              <NumericKeypad guessDraft={guessDraft} setGuessDraft={setGuessDraft} maxLength={roomState.mode === 'code' ? 4 : String(classicSettings.max).length} pressDigit={pressDigit} />
            </form>}
            {isSpectator && <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border p-3 text-xs muted soft-border"><Eye size={14} />{t('spectator')}</div>}
            <ReactionBar t={t} chooseReaction={chooseReaction} />
            {reactions.length > 0 && <FloatingReactions reactions={reactions} />}
          </div>}

          {isResult && <div className="surface relative overflow-hidden rounded-[24px] p-5 text-center sm:p-8">
            <div className={`mx-auto grid h-16 w-16 place-items-center rounded-[22px] ${won ? 'bg-lime/[.1] text-lime' : 'bg-violet/[.14] text-violet-200'}`}>{matchDone ? <Trophy size={29} /> : won ? <Award size={29} /> : <Crown size={29} />}</div>
            <div className="mt-4 text-[10px] font-bold uppercase tracking-[.24em] text-violet-200">{t(matchDone ? (won ? 'matchWon' : 'matchLost') : (won ? 'roundWon' : 'roundLost'))}</div>
            <div className="mx-auto mt-3 flex max-w-sm items-center justify-center gap-4"><span className="text-center"><span className="block text-3xl font-black text-lime">{roomState.scores[selfId] || 0}</span><span className="text-[10px] muted">{displayName}</span></span><span className="text-xl font-light text-zinc-600">:</span><span className="text-center"><span className="block text-3xl font-black">{opponentProfile ? roomState.scores[opponentProfile.id] || 0 : 0}</span><span className="text-[10px] muted">{opponentProfile?.name || t('opponent')}</span></span></div>
            <div className="mt-4 max-h-24 overflow-auto space-y-1">{roomState.summary.slice(-5).map((line, index) => <div key={`${line}-${index}`} className="text-[10px] muted">{summaryLabel(line, roomState.players, t)}</div>)}</div>
            <div className="mt-5 flex flex-wrap justify-center gap-2"><button type="button" onClick={() => sendAction({ type: matchDone ? 'rematch' : 'next-round' })} disabled={isSpectator} className="primary flex h-11 items-center gap-2 rounded-xl px-5 text-xs font-bold"><RefreshCw size={15} />{t(matchDone ? 'rematch' : 'nextRound')}</button><button type="button" onClick={shareResult} className="control flex h-11 items-center gap-2 rounded-xl px-4 text-xs font-semibold"><Share2 size={15} />{t('shareResult')}</button></div>
            {roomState.status === 'round-result' && roomState.players.every((player) => roomState.ready?.[player.id]) && <div className="mt-3 text-[10px] muted">{t('waitingRematch')}</div>}
          </div>}
        </div>

        <aside className="space-y-4">
          <div className="surface rounded-[24px] p-4">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-xs font-bold">{t('history')}</h2><span className="rounded-md bg-white/[.04] px-2 py-1 text-[9px] font-mono muted">{roomState.guesses?.length || 0}</span></div>
            {!roomState.guesses?.length && <div className="rounded-xl border border-dashed px-3 py-6 text-center text-[10px] muted soft-border">{t('noGuesses')}</div>}
            <div className="max-h-[370px] space-y-2 overflow-auto pe-1">
              {[...(roomState.guesses || [])].reverse().map((guess) => <div key={guess.id} className="flex items-center justify-between rounded-xl border px-3 py-2.5 soft-border bg-white/[.02]"><div><span className="block text-[9px] muted">{roomState.players.find((player) => player.id === guess.playerId)?.name || t('player')}</span><span className="font-mono text-base font-bold tracking-[.14em]">{fmtGuess(guess.guess)}</span></div><FeedbackBadge t={t} feedback={guess.feedback} correct={guess.correct} /></div>)}
            </div>
          </div>
          <div className="surface rounded-[24px] p-4"><div className="mb-3 flex items-center gap-2 text-xs font-bold"><UsersIcon />{t('opponent')}</div>{roomState.players.map((player) => <div key={player.id} className="flex items-center gap-3 border-t py-3 soft-border"><Avatar name={player.name} /><div className="min-w-0 flex-1"><div className="truncate text-xs font-bold">{player.id === selfId ? displayName : player.name}</div><div className="mt-0.5 text-[9px] muted">{player.id === selfId ? t('you') : peers.some((peer) => peer.id === player.id) ? t('connected') : t('offline')}</div></div><span className={`h-2 w-2 rounded-full ${player.id === selfId || peers.some((peer) => peer.id === player.id) ? 'bg-lime' : 'bg-rose-400'}`} /></div>)}</div>
          <div className="rounded-[22px] border border-violet/15 bg-violet/[.055] p-4"><div className="flex items-center gap-2 text-xs font-bold text-violet-100"><ShieldCheck size={15} className="text-lime" />{t('powered')}</div><p className="mt-2 text-[10px] leading-5 muted">{t('secretHint')}</p><button type="button" onClick={copyRoomLink} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-[10px] font-semibold"><Copy size={13} />{t('copyLink')}</button></div>
          <div className="flex flex-wrap justify-center gap-2 rounded-[22px] border p-3 soft-border">{[...peers.filter((peer) => peer.role === 'spectator')].slice(0,3).map((peer) => <span key={peer.id} className="flex items-center gap-1.5 rounded-full bg-white/[.04] px-2.5 py-1 text-[9px] muted"><Eye size={11} />{peer.name}</span>)}<span className="flex items-center gap-1.5 rounded-full bg-white/[.04] px-2.5 py-1 text-[9px] muted"><Eye size={11} />{t('spectators')}: {peers.filter((peer) => peer.role === 'spectator').length}</span></div>
        </aside>
      </div>
    </>}
  </section>
}

function PlayerScore({ player, score, isMe = false, online, t }) {
  return <div className={`flex min-w-0 items-center gap-2 rounded-2xl border p-2.5 sm:gap-3 sm:p-3 ${isMe ? 'border-lime/20 bg-lime/[.035]' : 'soft-border bg-white/[.02]'}`}>
    <Avatar name={isMe ? t('you') : player?.name || '?'} highlighted={isMe} /><div className="min-w-0 flex-1"><div className="truncate text-[10px] font-semibold muted">{isMe ? t('you') : t('opponent')}</div><div className="truncate text-xs font-bold">{isMe ? t('you') : player?.name || t('waiting')}</div></div><span className={`text-2xl font-black tabular-nums ${isMe ? 'text-lime' : ''}`}>{score}</span>
  </div>
}

function Avatar({ name, highlighted }) {
  return <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-black ${highlighted ? 'bg-lime/[.12] text-lime' : 'bg-violet/[.13] text-violet-100'}`}>{String(name || '?').slice(0, 1).toUpperCase()}</span>
}

function RangeBar({ t, range, settings, rangePercentage }) {
  const [low, high] = range
  const left = rangePercentage(low)
  const right = rangePercentage(high)
  return <div className="rounded-2xl border p-3 soft-border bg-white/[.02]"><div className="mb-2 flex items-center justify-between text-[10px] font-semibold muted"><span>{t('rangeBar')}</span><span className="font-mono font-bold text-lime">{low} – {high}</span></div><div className="range-track"><span className="range-fill" style={{ left: `${left}%`, width: `${Math.max(1, right - left)}%` }} /></div><div className="mt-2 flex justify-between font-mono text-[9px] muted"><span>{settings.min}</span><span>{settings.max}</span></div></div>
}

function NumericKeypad({ guessDraft, setGuessDraft, maxLength, pressDigit }) {
  return <div className="mt-3 grid grid-cols-5 gap-1.5 sm:gap-2" aria-label="Numeric keypad">{[1,2,3,4,5,6,7,8,9,'clear',0,'back'].map((key, index) => <button key={`${key}-${index}`} type="button" onClick={() => key === 'clear' ? setGuessDraft('') : key === 'back' ? setGuessDraft((value) => value.slice(0,-1)) : pressDigit(String(key))} className={`key control ${key === 'clear' || key === 'back' ? 'text-[10px] muted' : ''}`}>{key === 'clear' ? 'CLR' : key === 'back' ? '⌫' : key}</button>)}</div>
}

function FeedbackBadge({ t, feedback, correct }) {
  if (feedback === 'timeout') return <span className="rounded-lg bg-rose-400/[.1] px-2 py-1 text-[9px] font-bold text-rose-300">{t('timeout')}</span>
  if (feedback === 'higher') return <span className="flex items-center gap-1 rounded-lg bg-sky-400/[.09] px-2 py-1 text-[9px] font-bold text-sky-200"><ChevronUp size={12} />{t('hintHigher')}</span>
  if (feedback === 'lower') return <span className="flex items-center gap-1 rounded-lg bg-orange-400/[.09] px-2 py-1 text-[9px] font-bold text-orange-200"><ChevronDown size={12} />{t('hintLower')}</span>
  if (correct) return <span className="rounded-lg bg-lime/[.1] px-2 py-1 text-[9px] font-bold text-lime">{t('correct')}</span>
  return <span className="rounded-lg border px-2 py-1 font-mono text-[10px] font-bold tracking-[.08em] text-violet-100 soft-border">{feedback}</span>
}

function ReactionBar({ t, chooseReaction }) {
  return <div className="mt-5 flex items-center justify-between border-t pt-3 soft-border"><span className="flex items-center gap-1.5 text-[9px] muted"><Sparkles size={12} />{t('reactions')}</span><div className="flex gap-1">{REACTIONS.map((emoji) => <button key={emoji} type="button" onClick={() => chooseReaction(emoji)} className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-white/[.08] hover:scale-110 active:scale-95" aria-label={`${t('reactionSent')} ${emoji}`}>{emoji}</button>)}</div></div>
}

function FloatingReactions({ reactions }) {
  return <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">{reactions.map((reaction, index) => <div key={reaction.id} className="absolute bottom-20 animate-[floatIn_.3s_ease-out] text-center" style={{ [index % 2 ? 'left' : 'right']: `${10 + index * 8}%`, transform: `translateY(-${index * 12}px)` }}><span className="block text-4xl drop-shadow-xl">{reaction.emoji}</span><span className="mt-1 block rounded-full bg-black/40 px-2 py-1 text-[9px] text-white">{reaction.name}</span></div>)}</div>
}

function UsersIcon() { return <span className="inline-flex -space-x-1"><i className="h-3 w-3 rounded-full border border-[#17151f] bg-violet-400" /><i className="h-3 w-3 rounded-full border border-[#17151f] bg-lime" /></span> }

function summaryLabel(line, players, t) {
  const [first, second, result] = line.split('\u0000')
  const winner = players.find((player) => player.id === first)?.name || t('player')
  if (first === 'time') return `${players.find((player) => player.id === second)?.name || t('player')} · ${t('timeout')}`
  if (result === 'out') return `${winner} · ${t('attemptsLeft')}`
  return `${winner} · ${first === 'time' ? t('timeout') : result === 'correct' ? t('correct') : ''}`
}

function SoloView({ t, lang, rtl, solo, soloTurn, setSoloTurn, botDraft, setBotDraft, guessDraft, setGuessDraft, secretDraft, setSecretDraft, soloSubmitSecret, soloGuess, pressDigit, playSound, setSolo, startSolo }) {
  const maxLength = solo.mode === 'code' ? 4 : String(solo.high).length
  const playerRange = solo.range || [solo.low, solo.high]
  const fmt = (guess) => solo.mode === 'code' ? String(guess || '----').padStart(4, '0') : String(guess || '—')
  return <section className="relative z-10 mx-auto max-w-5xl px-4 pb-10 pt-3 sm:px-7 sm:pt-5">
    <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-3"><button type="button" onClick={() => { setSolo(null); setSoloTurn('you'); setSecretDraft('') }} className="control grid h-10 w-10 place-items-center rounded-xl"><ArrowLeft size={17} className={rtl ? 'rotate-180' : ''} /></button><div><h1 className="text-lg font-black">{t('soloLabel')}</h1><p className="mt-1 text-[10px] muted">{t(solo.mode)} · {t(solo.difficulty)}</p></div></div><span className="rounded-xl border border-lime/15 bg-lime/[.06] px-3 py-2 text-[10px] font-bold text-lime">{solo.mode === 'classic' ? `${solo.low}–${solo.high}` : '0000–9999'}</span></div>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        {!solo.playerSecret && <div className="surface mx-auto max-w-xl rounded-[24px] p-5 sm:p-7"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-lime/[.1] text-lime"><LockKeyhole size={23} /></div><h2 className="mt-4 text-center text-xl font-bold">{t(solo.mode === 'code' ? 'chooseSecretCode' : 'chooseSecret')}</h2><p className="mt-2 text-center text-xs leading-5 muted">{t(solo.mode === 'code' ? 'secretCodeHint' : 'secretHint')}</p><form onSubmit={soloSubmitSecret} className="mx-auto mt-5 max-w-sm"><input inputMode="numeric" value={secretDraft} onChange={(event) => setSecretDraft(event.target.value.replace(/\D/g, '').slice(0, maxLength))} maxLength={maxLength} placeholder={t(solo.mode === 'code' ? 'codeSecretPlaceholder' : 'secretPlaceholder')} className="control h-14 w-full rounded-xl text-center font-mono text-2xl font-bold tracking-[.22em] outline-none" /><button className="primary mt-3 h-12 w-full rounded-xl text-sm font-bold">{t('ready')}</button></form></div>}

        {solo.playerSecret && !solo.finished && <div className="surface rounded-[24px] p-4 sm:p-6">
          <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2"><div className={`flex items-center gap-2 rounded-2xl border p-3 ${soloTurn === 'you' ? 'border-lime/25 bg-lime/[.04]' : 'soft-border'}`}><Avatar name={t('you')} highlighted={soloTurn === 'you'} /><span className="text-xs font-bold">{t('you')}</span></div><span className="text-[9px] font-bold tracking-[.18em] text-zinc-600">VS</span><div className={`flex items-center justify-end gap-2 rounded-2xl border p-3 ${soloTurn === 'bot' ? 'border-violet/30 bg-violet/[.06]' : 'soft-border'}`}><span className="text-xs font-bold">{t('bot')}</span><Avatar name={t('bot')} /></div></div>
          <div className="mb-4 flex items-center justify-between rounded-2xl border p-3 soft-border"><div><div className="text-[9px] font-semibold muted">{soloTurn === 'you' ? t('yourTurn') : t('botThinking')}</div><div className="mt-1 text-xs font-bold">{soloTurn === 'you' ? t('attemptsLeft') : t('botGuess')}</div></div><span className="font-mono text-lg font-black text-lime">{soloTurn === 'you' ? Math.max(0, solo.maxAttempts - solo.attempts) : Math.max(0, solo.maxAttempts - solo.botAttempts)}</span></div>
          {solo.mode === 'classic' && <RangeBar t={t} range={playerRange} settings={{ min: solo.low, max: solo.high }} rangePercentage={(value) => Math.max(0, Math.min(100, ((value - solo.low) / (solo.high - solo.low)) * 100))} />}
          {soloTurn === 'you' && <form onSubmit={soloGuess} className="mt-5"><label className="mb-2 block text-xs font-bold">{t('enterGuess')}</label><div className="flex gap-2"><input inputMode="numeric" value={guessDraft} onChange={(event) => setGuessDraft(event.target.value.replace(/\D/g, '').slice(0, maxLength))} maxLength={maxLength} placeholder={solo.mode === 'code' ? '0000' : `${solo.low} – ${solo.high}`} className="control h-12 min-w-0 flex-1 rounded-xl px-4 text-center font-mono text-xl font-bold tracking-[.2em] outline-none" /><button disabled={!guessDraft || (solo.mode === 'code' && guessDraft.length !== 4)} className="primary flex h-12 items-center gap-2 rounded-xl px-5 text-sm font-bold"><Send size={15} />{t('makeGuess')}</button></div><NumericKeypad guessDraft={guessDraft} setGuessDraft={setGuessDraft} maxLength={maxLength} pressDigit={pressDigit} /></form>}
          {soloTurn === 'bot' && <div className="mt-5 rounded-2xl border border-violet/20 bg-violet/[.055] px-4 py-5 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-violet/15 text-violet-100"><LoaderCircle className="animate-spin" size={19} /></span><p className="mt-3 text-xs font-bold">{t('botThinking')}</p></div>}
          {solo.playerFeedback && <div className="mt-3 flex justify-center"><FeedbackBadge t={t} feedback={solo.playerFeedback} correct={solo.playerFeedback === 'correct'} /></div>}
        </div>}

        {solo.finished && <div className="surface rounded-[24px] p-6 text-center sm:p-9"><div className={`mx-auto grid h-16 w-16 place-items-center rounded-[22px] ${solo.winner === 'you' ? 'bg-lime/[.1] text-lime' : 'bg-violet/[.14] text-violet-200'}`}>{solo.winner === 'you' ? <Trophy size={28} /> : <Crown size={28} />}</div><h2 className="mt-4 text-xl font-black">{solo.winner === 'you' ? t('soloWin') : t('botWin')}</h2><p className="mt-2 text-xs muted">{t('attemptsLeft')}: {solo.attempts} · {t('bot')}: {solo.botAttempts}</p><div className="mt-5 flex flex-wrap justify-center gap-2"><button type="button" onClick={startSolo} className="primary flex h-11 items-center gap-2 rounded-xl px-5 text-xs font-bold"><RefreshCw size={15} />{t('restart')}</button><button type="button" onClick={() => { setSolo(null); setSoloTurn('you') }} className="control h-11 rounded-xl px-5 text-xs font-semibold">{t('backHome')}</button></div></div>}

        <div className="surface rounded-[24px] p-4"><div className="mb-3 text-xs font-bold">{t('history')}</div>{!solo.guesses.length && <div className="rounded-xl border border-dashed px-3 py-6 text-center text-[10px] muted soft-border">{t('noGuesses')}</div>}<div className="grid gap-2 sm:grid-cols-2">{[...solo.guesses].reverse().map((entry) => <div key={entry.id} className="flex items-center justify-between rounded-xl border px-3 py-2 soft-border bg-white/[.02]"><div><span className="block text-[9px] muted">{entry.playerId === 'you' ? t('you') : t('bot')}</span><span className="font-mono text-base font-bold tracking-[.14em]">{fmt(entry.guess)}</span></div><FeedbackBadge t={t} feedback={entry.feedback} correct={entry.correct} /></div>)}</div></div>
      </div>
      <aside className="space-y-4"><div className="surface rounded-[24px] p-4"><div className="flex items-center gap-2 text-xs font-bold"><Sparkles size={14} className="text-lime" />{t('difficulty')}</div><div className="mt-3 grid grid-cols-3 gap-2">{['easy','normal','hard'].map((level) => <div key={level} className={`rounded-xl border px-2 py-3 text-center text-[10px] font-bold ${level === solo.difficulty ? 'border-lime/30 bg-lime/[.06] text-lime' : 'soft-border muted'}`}>{t(level)}</div>)}</div><p className="mt-3 text-[10px] leading-5 muted">{solo.mode === 'classic' ? (lang === 'ar' ? 'الكمبيوتر يضيّق نطاق بحثه بعد كل تلميح؛ الضجيج يقل كلما زادت الصعوبة.' : 'The computer narrows its search after each clue; noise drops as difficulty rises.') : t('codeHint')}</p></div><div className="rounded-[22px] border border-violet/15 bg-violet/[.055] p-4"><div className="flex items-center gap-2 text-xs font-bold text-violet-100"><ShieldCheck size={15} className="text-lime" />{t('powered')}</div><p className="mt-2 text-[10px] leading-5 muted">{t('secretHint')}</p></div></aside>
    </div>
  </section>
}

function SoloSetupModal({ t, soloMode, setSoloMode, difficulty, setDifficulty, setSoloOpen, startSolo }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-labelledby="solo-dialog-title" className="surface w-full max-w-md rounded-[26px] p-5 sm:p-6 float-in"><div className="flex items-start justify-between"><div><h2 id="solo-dialog-title" className="text-lg font-black">{t('solo')}</h2><p className="mt-1 text-xs muted">{t('practice')}</p></div><button type="button" onClick={() => setSoloOpen(false)} className="control grid h-9 w-9 place-items-center rounded-xl"><X size={16} /></button></div><div className="mt-5 grid grid-cols-2 gap-2">{['classic','code'].map((mode) => <button key={mode} type="button" onClick={() => setSoloMode(mode)} className={`rounded-xl border p-3 text-start ${soloMode === mode ? 'border-lime/35 bg-lime/[.07]' : 'control'}`}><div className="text-sm font-bold">{t(mode)}</div><div className="mt-1 text-[10px] muted">{t(mode === 'classic' ? 'classicSub' : 'codeSub')}</div></button>)}</div>{soloMode === 'classic' && <div className="mt-4"><div className="mb-2 text-[10px] font-bold muted">{t('difficulty')}</div><div className="grid grid-cols-3 gap-2">{['easy','normal','hard'].map((level) => <button key={level} type="button" onClick={() => setDifficulty(level)} className={`rounded-xl border py-2.5 text-xs font-semibold ${difficulty === level ? 'border-violet/60 bg-violet/20 text-violet-100' : 'control muted'}`}>{t(level)}</button>)}</div></div>}<button type="button" onClick={startSolo} className="primary mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold"><Zap size={16} />{t('startSolo')}</button></div></div>
}

function SettingsModal({ t, configDraft, setConfigDraft, onClose, onSave, message }) {
  const [showKey, setShowKey] = useState(false)
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-labelledby="settings-dialog-title" className="surface w-full max-w-lg rounded-[26px] p-5 sm:p-6 float-in"><div className="flex items-start justify-between"><div><div className="mb-2 grid h-10 w-10 place-items-center rounded-xl violet"><Settings2 size={18} /></div><h2 id="settings-dialog-title" className="text-lg font-black">{t('settingsTitle')}</h2><p className="mt-2 text-xs leading-5 muted">{t('settingsBody')}</p></div><button type="button" onClick={onClose} className="control grid h-9 w-9 shrink-0 place-items-center rounded-xl"><X size={16} /></button></div><div className="mt-5 space-y-3"><label className="block text-[10px] font-bold muted">{t('supabaseUrl')}<input autoComplete="off" value={configDraft.url} onChange={(event) => setConfigDraft((current) => ({ ...current, url: event.target.value }))} placeholder="https://xxxx.supabase.co" className="control mt-1.5 h-11 w-full rounded-xl px-3 text-sm font-normal text-current outline-none placeholder:text-zinc-600" /></label><label className="block text-[10px] font-bold muted">{t('supabaseKey')}<div className="relative mt-1.5"><input autoComplete="off" type={showKey ? 'text' : 'password'} value={configDraft.key} onChange={(event) => setConfigDraft((current) => ({ ...current, key: event.target.value }))} placeholder="eyJ…" className="control h-11 w-full rounded-xl px-3 pe-11 text-sm font-normal text-current outline-none placeholder:text-zinc-600" /><button type="button" onClick={() => setShowKey((current) => !current)} className="absolute inset-y-0 end-0 px-3 muted"><Eye size={15} /></button></div></label></div>{message && <div className="mt-3 rounded-xl border border-lime/15 bg-lime/[.05] p-3 text-[10px] leading-5 text-lime">{message}</div>}<div className="mt-5 flex gap-2"><button type="button" onClick={onSave} className="primary h-11 flex-1 rounded-xl text-xs font-bold">{t('save')}</button><button type="button" onClick={onClose} className="control h-11 rounded-xl px-4 text-xs font-semibold">{t('cancel')}</button></div></div></div>
}

export default App
