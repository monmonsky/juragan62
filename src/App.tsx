import { useCallback, useState } from 'react'
import { createGame } from './engine/engine.ts'
import type { GameState } from './engine/types.ts'
import { Game } from './ui/Game.tsx'
import { Achievements, Home, Rapor, Setup, Welcome } from './ui/Screens.tsx'
import { recordGame } from './ui/achievements.ts'
import type { Achievement } from './ui/achievements.ts'
import { Online } from './ui/Online.tsx'
import type { Profile, SetupResult } from './ui/Screens.tsx'
import type { Speed } from './ui/fx.ts'

const SAVE_KEY = 'juragan62.save'
const SPEED_KEY = 'juragan62.speed'
const PROFILE_KEY = 'juragan62.profile'
const GUIDE_KEY = 'juragan62.guideSeen'
const SOUND_KEY = 'juragan62.sound'
const MUSIC_KEY = 'juragan62.music'
const roomFromUrl = new URLSearchParams(location.search).get('room')

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function save(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // penyimpanan tidak tersedia (mode privat): game tetap jalan tanpa simpan otomatis
  }
}

type Screen =
  | { name: 'welcome' }
  | { name: 'home' }
  | { name: 'setup' }
  | { name: 'online'; code: string | null }
  | { name: 'game'; state: GameState; key: number; guide: boolean }
  | { name: 'rapor'; state: GameState; unlocked: Achievement[] }
  | { name: 'achievements' }

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(() => load<Profile>(PROFILE_KEY))
  const [screen, setScreen] = useState<Screen>(() =>
    !profile ? { name: 'welcome' } : roomFromUrl ? { name: 'online', code: roomFromUrl } : { name: 'home' },
  )
  const [sound, setSound] = useState(() => load<boolean>(SOUND_KEY) ?? true)
  const [music, setMusicOn] = useState(() => load<boolean>(MUSIC_KEY) ?? false)
  const toggleMusic = useCallback(() => {
    setMusicOn((on) => {
      save(MUSIC_KEY, !on)
      return !on
    })
  }, [])
  const toggleSound = useCallback(() => {
    setSound((on) => {
      save(SOUND_KEY, !on)
      return !on
    })
  }, [])
  const [showGuide, setShowGuide] = useState(() => !load<boolean>(GUIDE_KEY))
  const [speed, setSpeed] = useState<Speed>(() => load<Speed>(SPEED_KEY) ?? 'normal')
  const [savedGame, setSavedGame] = useState<GameState | null>(() => {
    const s = load<GameState>(SAVE_KEY)
    return s?.version === 7 && s.phase !== 'gameover' ? s : null
  })

  const onChange = useCallback((s: GameState) => {
    save(SAVE_KEY, s.phase === 'gameover' ? null : s)
    setSavedGame(s.phase === 'gameover' ? null : s)
  }, [])

  // Pencapaian dicatat untuk kursi milik perangkat ini.
  const onGameOver = useCallback((s: GameState, mySeats?: number[]) => {
    const seats = mySeats ?? s.players.filter((p) => !p.isBot).map((p) => p.id)
    setScreen({ name: 'rapor', state: s, unlocked: recordGame(s, seats) })
  }, [])
  const onExit = useCallback(() => setScreen({ name: 'home' }), [])

  const start = (r: SetupResult) => {
    setSpeed(r.speed)
    save(SPEED_KEY, r.speed)
    const state = createGame(r.players, { maxRounds: r.maxRounds, edisi: r.edisi, openingRoll: r.openingRoll })
    onChange(state)
    openGame(state)
  }

  const openGame = (state: GameState) => {
    setScreen({ name: 'game', state, key: Date.now(), guide: showGuide })
    if (showGuide) {
      save(GUIDE_KEY, true)
      setShowGuide(false)
    }
  }

  if (!profile || screen.name === 'welcome') {
    return (
      <Welcome
        initial={profile}
        onDone={(p) => {
          save(PROFILE_KEY, p)
          setProfile(p)
          setScreen(roomFromUrl ? { name: 'online', code: roomFromUrl } : { name: 'home' })
        }}
      />
    )
  }

  switch (screen.name) {
    case 'home':
      return (
        <Home
          profile={profile}
          onEditProfile={() => setScreen({ name: 'welcome' })}
          hasSave={!!savedGame}
          onNew={() => setScreen({ name: 'setup' })}
          onOnline={() => setScreen({ name: 'online', code: null })}
          onAchievements={() => setScreen({ name: 'achievements' })}
          onContinue={() => savedGame && openGame(savedGame)}
        />
      )
    case 'setup':
      return <Setup profile={profile} speed={speed} onStart={start} onBack={() => setScreen({ name: 'home' })} />
    case 'game':
      return (
        <Game
          key={screen.key}
          initial={screen.state}
          showGuide={screen.guide}
          speed={speed}
          sound={sound}
          music={music}
          onToggleSound={toggleSound}
          onToggleMusic={toggleMusic}
          onChange={onChange}
          onExit={onExit}
          onGameOver={onGameOver}
        />
      )
    case 'online':
      return (
        <Online
          profile={profile}
          speed={speed}
          sound={sound}
          music={music}
          initialCode={screen.code}
          onToggleSound={toggleSound}
          onToggleMusic={toggleMusic}
          onExit={() => {
            if (roomFromUrl) history.replaceState(null, '', location.pathname)
            setScreen({ name: 'home' })
          }}
          onGameOver={onGameOver}
        />
      )
    case 'achievements':
      return <Achievements onBack={() => setScreen({ name: 'home' })} />
    case 'rapor':
      return <Rapor s={screen.state} unlocked={screen.unlocked} onAgain={() => setScreen({ name: 'setup' })} onHome={() => setScreen({ name: 'home' })} />
  }
}
