import React from 'react'
import {
  AbsoluteFill, Img, spring, interpolate,
  useCurrentFrame, useVideoConfig, staticFile,
} from 'remotion'
import type { LucideIcon } from 'lucide-react'
import { User, Store, MessageSquare, BarChart3, CreditCard } from 'lucide-react'
import { IPhoneMockup } from './IPhoneMockup'
import { LeftPhone } from './LeftPhone'
import { RightPhone } from './RightPhone'
import {
  C, STEP_STARTS, ANIMATION_END, VIDEO_OFFSET,
  LEFT_PHONE_X, RIGHT_PHONE_X, PHONE_Y_FINAL, LABEL_Y,
  PHONE_W, PHONE_H, CONNECTOR_W, relFrame, getStep,
} from './constants'

// ── Act timing (frames at 60fps) ──────────────────────────────────────────
const A1S = 0,    A1E = 390   // 6.5s  — Problem
const A2S = 390,  A2E = 630   // 4s    — Brand reveal
const A3S = 630,  A3E = 870   // 4s    — Value props
const A4S = 870,  A4E = 990   // 2s    — Bridge
const A5S = VIDEO_OFFSET      // 990   — Demo
const A5E = ANIMATION_END
const A6S = A5E,  A6E = A5E + 240   // 4s  — Social proof
const A7S = A6E,  A7E = A6E + 270   // 4.5s — Close

// ── Design tokens ─────────────────────────────────────────────────────────
const FF    = "'Inter', -apple-system, system-ui, sans-serif"
const TEXT  = '#F2F2F0'
const MUTED = 'rgba(242,242,240,0.38)'
const DIM   = 'rgba(242,242,240,0.18)'
const BG    = '#060709'
const GREEN = C.green

// Spring config catalogue
const SP_HERO   = { stiffness: 90,  damping: 20, mass: 1.6 } // slow/heavy for big type
const SP_PANEL  = { stiffness: 140, damping: 24 }             // medium panels
const SP_FAST   = { stiffness: 320, damping: 28 }             // microinteractions

// ── Helpers ───────────────────────────────────────────────────────────────
function actOp(frame: number, start: number, end: number, fi = 22, fo = 28) {
  const i = interpolate(frame, [start, start + fi], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const o = interpolate(frame, [end - fo, end], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return Math.min(i, o)
}

/** Clip-reveal: wraps children in overflow:hidden, slides up from bottom */
function Reveal({ sp, children, style }: { sp: number; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ overflow: 'hidden', ...style }}>
      <div style={{ transform: `translateY(${interpolate(sp, [0, 1], [108, 0])}%)` }}>
        {children}
      </div>
    </div>
  )
}

/** Eyebrow label — spaced uppercase green */
function Eyebrow({ label, sp }: { label: string; sp: number }) {
  return (
    <div style={{ overflow: 'hidden' }}>
      <div style={{ transform: `translateY(${interpolate(sp, [0, 1], [100, 0])}%)`, opacity: sp }}>
        <span style={{
          display: 'block',
          color: GREEN, fontSize: 12, fontWeight: 700,
          letterSpacing: '0.16em', textTransform: 'uppercase' as const,
          fontFamily: FF,
        }}>
          {label}
        </span>
      </div>
    </div>
  )
}

// ── Persistent header branding ─────────────────────────────────────────────
function HeaderBrand({ frame }: { frame: number }) {
  const { fps } = useVideoConfig()
  // Fades in at frame 18, fades out during Act 7
  const inSp  = spring({ frame: Math.max(0, frame - 18), fps, config: SP_PANEL })
  const outOp = interpolate(frame, [A7S + 20, A7S + 60], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const op    = interpolate(inSp, [0, 1], [0, 1]) * outOp
  const y     = interpolate(inSp, [0, 1], [-14, 0])

  // During Act 2 (brand reveal) hide the small header so it doesn't compete
  const hideForAct2 = interpolate(frame, [A2S, A2S + 20, A2E - 20, A2E], [1, 0, 0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <div style={{
      position: 'absolute', top: 40, left: 64,
      display: 'flex', alignItems: 'center', gap: 12,
      opacity: op * hideForAct2, transform: `translateY(${y}px)`,
      zIndex: 100, fontFamily: FF,
    }}>
      <Img
        src={staticFile('imagotipo-cEats.jpg')}
        style={{ width: 30, height: 30, objectFit: 'contain', borderRadius: 7, filter: 'invert(1) brightness(1.1)' }}
      />
      <span style={{ color: 'rgba(242,242,240,0.45)', fontSize: 14, fontWeight: 700, letterSpacing: '0.01em' }}>
        cEats
      </span>
    </div>
  )
}

// ── Background ────────────────────────────────────────────────────────────
function Background({ glowOp = 0.05 }: { glowOp?: number }) {
  return (
    <AbsoluteFill>
      {/* Base */}
      <div style={{ position: 'absolute', inset: 0, background: BG }} />
      {/* Subtle warm-center radial — very restrained */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 55%, rgba(10,16,12,0.95) 0%, transparent 100%)' }} />
      {/* Green under-phone glow — only visible during demo */}
      <div style={{
        position: 'absolute',
        left: LEFT_PHONE_X - 80,
        top: PHONE_Y_FINAL + PHONE_H * 0.55,
        width: PHONE_W * 2 + CONNECTOR_W + 160,
        height: 320,
        background: `radial-gradient(ellipse at 50% 50%, rgba(6,193,103,${glowOp}) 0%, transparent 68%)`,
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      {/* Top vignette */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(180deg, rgba(6,7,9,0.96) 0%, transparent 100%)' }} />
      {/* Bottom vignette */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, background: 'linear-gradient(0deg, rgba(6,7,9,0.97) 0%, transparent 100%)' }} />
    </AbsoluteFill>
  )
}

// ── Act 1: Problem ────────────────────────────────────────────────────────
function Act1() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const op = actOp(frame, A1S, A1E, 18, 32)
  if (op <= 0) return null

  const h1Sp = spring({ frame: Math.max(0, frame - 8),  fps, config: SP_HERO })
  const h2Sp = spring({ frame: Math.max(0, frame - 22), fps, config: SP_HERO })

  // Animated counter
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
  const statProgress = interpolate(frame, [64, 170], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })
  const stat    = Math.round(statProgress * 73)
  const statSp  = spring({ frame: Math.max(0, frame - 56), fps, config: SP_PANEL })

  const pains = [
    'Pedidos perdidos sin historial ni registro.',
    'Errores de captura constantes entre turnos.',
    'Clientes sin confirmación ni seguimiento.',
  ]

  return (
    <AbsoluteFill style={{ opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: 900 }}>

        <div style={{ marginBottom: 28 }}>
          <Eyebrow label="El problema" sp={spring({ frame: Math.max(0, frame - 4), fps, config: SP_PANEL })} />
        </div>

        {/* Two-line headline with clip reveal */}
        <Reveal sp={h1Sp} style={{ marginBottom: 2 }}>
          <span style={{ display: 'block', fontSize: 80, fontWeight: 800, letterSpacing: '-0.038em', color: TEXT, lineHeight: 1.06 }}>
            Gestionar pedidos
          </span>
        </Reveal>
        <Reveal sp={h2Sp} style={{ marginBottom: 72 }}>
          <span style={{ display: 'block', fontSize: 80, fontWeight: 800, letterSpacing: '-0.038em', lineHeight: 1.06 }}>
            <span style={{ color: TEXT }}>por WhatsApp es </span>
            <span style={{ color: GREEN }}>un caos.</span>
          </span>
        </Reveal>

        {/* Stat — left aligned, subtle card */}
        <div style={{
          opacity: statSp,
          transform: `translateY(${interpolate(statSp, [0, 1], [18, 0])}px)`,
          marginBottom: 64,
          display: 'flex', alignItems: 'flex-end', gap: 20,
        }}>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 0,
            borderLeft: `3px solid ${GREEN}`, paddingLeft: 22,
          }}>
            <span style={{ fontSize: 100, fontWeight: 800, letterSpacing: '-0.06em', color: GREEN, lineHeight: 1 }}>{stat}</span>
            <span style={{ fontSize: 52, fontWeight: 700, color: GREEN, lineHeight: 1, marginBottom: 10 }}>%</span>
          </div>
          <span style={{ color: MUTED, fontSize: 20, maxWidth: 320, lineHeight: 1.5, paddingBottom: 8 }}>
            de restaurantes pierde pedidos por errores en WhatsApp
          </span>
        </div>

        {/* Pain points */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {pains.map((pain, i) => {
            const pSp = spring({ frame: Math.max(0, frame - (176 + i * 36)), fps, config: SP_PANEL })
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: pSp, transform: `translateX(${interpolate(pSp, [0, 1], [-16, 0])}px)` }}>
                <div style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: DIM, flexShrink: 0 }} />
                <span style={{ color: MUTED, fontSize: 19, lineHeight: 1.45 }}>{pain}</span>
              </div>
            )
          })}
        </div>

      </div>
    </AbsoluteFill>
  )
}

// ── Act 2: Brand reveal ───────────────────────────────────────────────────
function Act2() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const op = actOp(frame, A2S, A2E, 18, 24)
  if (op <= 0) return null

  const relF = frame - A2S

  // Logo + wordmark — one unified spring, slight scale from 0.92
  const heroSp = spring({ frame: Math.max(0, relF - 6), fps, config: SP_HERO })
  const heroScale = interpolate(heroSp, [0, 1], [0.90, 1])
  const heroBlur  = interpolate(heroSp, [0, 1], [18, 0])

  // Per-character stagger for "cEats"
  const chars = ['c', 'E', 'a', 't', 's']
  const charDelay = 7

  // Tagline
  const tagSp = spring({ frame: Math.max(0, relF - 48), fps, config: SP_PANEL })
  // Domain chip
  const chipSp = spring({ frame: Math.max(0, relF - 72), fps, config: SP_PANEL })

  return (
    <AbsoluteFill style={{ opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>

        {/* Logo + character-staggered wordmark */}
        <div style={{ transform: `scale(${heroScale})`, filter: `blur(${heroBlur}px)`, display: 'flex', alignItems: 'center', gap: 28 }}>
          <Img
            src={staticFile('imagotipo-cEats.jpg')}
            style={{ width: 96, height: 96, objectFit: 'contain', filter: 'invert(1) brightness(1.1)', borderRadius: 18, opacity: heroSp }}
          />
          {/* Character stagger */}
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            {chars.map((ch, i) => {
              const chSp = spring({ frame: Math.max(0, relF - (8 + i * charDelay)), fps, config: SP_FAST })
              return (
                <span
                  key={i}
                  style={{
                    fontSize: 104,
                    fontWeight: 800,
                    letterSpacing: '-0.048em',
                    color: TEXT,
                    display: 'inline-block',
                    opacity: chSp,
                    transform: `translateY(${interpolate(chSp, [0, 1], [32, 0])}px)`,
                  }}
                >
                  {ch}
                </span>
              )
            })}
          </div>
        </div>

        {/* Tagline */}
        <div style={{ overflow: 'hidden' }}>
          <p style={{
            margin: 0,
            transform: `translateY(${interpolate(tagSp, [0, 1], [22, 0])}px)`,
            opacity: tagSp,
            color: MUTED, fontSize: 24, fontWeight: 400,
            letterSpacing: '0.004em', textAlign: 'center', lineHeight: 1.45,
          }}>
            La plataforma de pedidos para restaurantes modernos.
          </p>
        </div>

        {/* Domain chip */}
        <div style={{
          opacity: chipSp,
          transform: `translateY(${interpolate(chipSp, [0, 1], [10, 0])}px)`,
          display: 'flex', alignItems: 'center', gap: 10,
          backgroundColor: 'rgba(6,193,103,0.06)',
          border: '1px solid rgba(6,193,103,0.18)',
          borderRadius: 100, padding: '10px 26px',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: GREEN }} />
          <span style={{ color: 'rgba(242,242,240,0.55)', fontSize: 17, fontWeight: 600, letterSpacing: '0.04em' }}>ceats.app</span>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ── Act 3: Value props ────────────────────────────────────────────────────
const VALUE_PROPS = [
  { Icon: MessageSquare, title: 'Pedidos desde WhatsApp',  desc: 'Tu cliente ordena sin instalar nada.',      delay: 14 },
  { Icon: BarChart3,     title: 'Control en tiempo real',  desc: 'Dashboard para tu equipo, siempre al día.', delay: 50 },
  { Icon: CreditCard,    title: 'Cobros con Stripe',       desc: 'Apple Pay, tarjeta y más — en segundos.',   delay: 86 },
] as const

function Act3() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const op = actOp(frame, A3S, A3E, 18, 26)
  if (op <= 0) return null

  const relF   = frame - A3S
  const eyeSp  = spring({ frame: Math.max(0, relF - 4), fps, config: SP_PANEL })

  return (
    <AbsoluteFill style={{ opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 72 }}>

        <Eyebrow label="Por qué cEats" sp={eyeSp} />

        {/* Three value prop columns */}
        <div style={{ display: 'flex', gap: 80, alignItems: 'flex-start' }}>
          {VALUE_PROPS.map(({ Icon, title, desc, delay }, i) => {
            const sp = spring({ frame: Math.max(0, relF - delay), fps, config: SP_PANEL })
            return (
              <div key={i} style={{
                opacity: sp,
                transform: `translateY(${interpolate(sp, [0, 1], [28, 0])}px)`,
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: 20, maxWidth: 270,
              }}>
                {/* Icon box */}
                <div style={{
                  width: 60, height: 60, borderRadius: 18,
                  backgroundColor: 'rgba(6,193,103,0.05)',
                  border: '1px solid rgba(6,193,103,0.14)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={28} color={GREEN} strokeWidth={1.6} />
                </div>
                <div>
                  <div style={{ color: TEXT, fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 10, lineHeight: 1.3 }}>{title}</div>
                  <div style={{ color: MUTED, fontSize: 16, lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ── Act 4: Bridge ─────────────────────────────────────────────────────────
function Act4() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const op = actOp(frame, A4S, A4E, 18, 28)
  if (op <= 0) return null

  const relF   = frame - A4S
  const headSp = spring({ frame: Math.max(0, relF - 5),  fps, config: SP_HERO })
  const subSp  = spring({ frame: Math.max(0, relF - 28), fps, config: SP_PANEL })

  return (
    <AbsoluteFill style={{ opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <Reveal sp={headSp}>
          <span style={{ display: 'block', color: TEXT, fontSize: 96, fontWeight: 800, letterSpacing: '-0.042em', lineHeight: 1 }}>
            Así funciona.
          </span>
        </Reveal>
        <div style={{ overflow: 'hidden' }}>
          <span style={{
            display: 'block',
            transform: `translateY(${interpolate(subSp, [0, 1], [20, 0])}px)`,
            opacity: subSp,
            color: MUTED, fontSize: 21, fontWeight: 400, letterSpacing: '0.006em',
          }}>
            Ordena, paga y el restaurante recibe al instante.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ── Act 5: Demo ───────────────────────────────────────────────────────────
function ConnectionArrow() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  // Arrow fires at step 12 (connection), exits at step 13 (was 11/12)
  const connectionActive = frame >= STEP_STARTS[10] && frame < STEP_STARTS[13]

  // Idle — hairline dots
  if (!connectionActive) return (
    <div style={{ position: 'absolute', left: LEFT_PHONE_X + PHONE_W, top: PHONE_Y_FINAL + PHONE_H / 2 - 1, width: CONNECTOR_W, height: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
      {[0, 1, 2].map(i => <div key={i} style={{ width: 4, height: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 1 }} />)}
    </div>
  )

  const arrowRel   = relFrame(frame, 10)
  const shaftScale = Math.min(1, spring({ frame: arrowRel, fps, config: SP_FAST, durationInFrames: 18 }))
  const headOp     = spring({ frame: Math.max(0, arrowRel - 14), fps, config: SP_FAST, durationInFrames: 8 })
  const exitRel    = Math.max(0, frame - STEP_STARTS[13] + 6)
  const arrowOp    = frame >= STEP_STARTS[13] ? Math.max(0, 1 - exitRel / 8) : 1

  return (
    <div style={{ position: 'absolute', left: LEFT_PHONE_X + PHONE_W + 8, top: PHONE_Y_FINAL + PHONE_H / 2 - 8, width: CONNECTOR_W - 16, display: 'flex', alignItems: 'center', opacity: arrowOp }}>
      <div style={{ flex: 1, height: 2, backgroundColor: GREEN, transformOrigin: 'left', transform: `scaleX(${shaftScale})`, boxShadow: `0 0 10px ${GREEN}, 0 0 22px rgba(6,193,103,0.38)` }} />
      <div style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: `10px solid ${GREEN}`, opacity: headOp, filter: `drop-shadow(0 0 5px ${GREEN})`, flexShrink: 0 }} />
    </div>
  )
}

function PhoneLabel({ x, label, Icon }: { x: number; label: string; Icon: LucideIcon }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const op = spring({ frame: Math.max(0, frame - (A5S + 40)), fps, config: SP_PANEL })
  const y  = interpolate(op, [0, 1], [10, 0])
  return (
    <div style={{ position: 'absolute', left: x, top: LABEL_Y, width: PHONE_W, display: 'flex', justifyContent: 'center', opacity: op, transform: `translateY(${y}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '7px 20px 7px 14px' }}>
        <Icon size={14} color="rgba(242,242,240,0.42)" strokeWidth={2} />
        <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', fontFamily: FF }}>{label}</span>
      </div>
    </div>
  )
}

function Act5() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  if (frame < A5S - 60 || frame > A5E + 30) return null

  const phoneEntryRel = Math.max(0, frame - (A5S - 44))
  const phoneProgress = spring({ frame: phoneEntryRel, fps, config: { stiffness: 88, damping: 17, mass: 1.6 } })
  const phoneY   = interpolate(phoneProgress, [0, 1], [PHONE_Y_FINAL + 340, PHONE_Y_FINAL])
  const phoneOp  = spring({ frame: phoneEntryRel, fps, config: { stiffness: 75, damping: 16 } })
  const exitOp   = interpolate(frame, [A5E - 28, A5E], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const step = getStep(frame)
  // step 10 = orderTap, step 11 = address, step 12 = connection arrow
  const connectionActive = step === 12
  const glowOp = connectionActive ? 0.22 : 0.06
  const shadow = `0 72px 180px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), 0 0 90px rgba(6,193,103,${glowOp})`

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: Math.min(phoneOp, exitOp) }}>
      <PhoneLabel x={LEFT_PHONE_X}  label="Cliente"     Icon={User}  />
      <PhoneLabel x={RIGHT_PHONE_X} label="Restaurante" Icon={Store} />

      <div style={{ position: 'absolute', left: LEFT_PHONE_X, top: phoneY }}>
        <IPhoneMockup model="15-pro" color="space-black" scale={1} safeArea={false} screenBg={C.waBg} showHomeIndicator shadow={shadow}>
          <LeftPhone />
        </IPhoneMockup>
      </div>

      <div style={{ position: 'absolute', left: RIGHT_PHONE_X, top: phoneY }}>
        <IPhoneMockup model="15-pro" color="space-black" scale={1} safeArea={false} screenBg={C.dark} showHomeIndicator shadow={shadow}>
          <RightPhone />
        </IPhoneMockup>
      </div>

      <ConnectionArrow />
    </div>
  )
}

// ── Act 6: Social proof ───────────────────────────────────────────────────
const STATS = [
  { to: 1247, suffix: '',  label: 'pedidos gestionados',      delay: 16,  fmt: (n: number) => n.toLocaleString('es-MX') },
  { to: 200,  suffix: '+', label: 'restaurantes activos',     delay: 50,  fmt: (n: number) => n.toString() },
  { to: 98,   suffix: '%', label: 'satisfacción de usuarios', delay: 84,  fmt: (n: number) => n.toString() },
] as const

function Act6() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const op = actOp(frame, A6S, A6E, 22, 24)
  if (op <= 0) return null

  const relF   = frame - A6S
  const eyeSp  = spring({ frame: Math.max(0, relF - 4), fps, config: SP_PANEL })
  const noteSp = spring({ frame: Math.max(0, relF - 134), fps, config: SP_PANEL })
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

  return (
    <AbsoluteFill style={{ opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: 880, gap: 60 }}>

        <Eyebrow label="Tracción" sp={eyeSp} />

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 0, width: '100%' }}>
          {STATS.map(({ to, suffix, label, delay, fmt }, i) => {
            const sp   = spring({ frame: Math.max(0, relF - delay), fps, config: SP_PANEL })
            const prog = interpolate(relF, [delay, delay + 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })
            const num  = fmt(Math.round(prog * to))
            // Divider between cols
            const showDivider = i < STATS.length - 1
            return (
              <React.Fragment key={i}>
                <div style={{ flex: 1, opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [22, 0])}px)` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, marginBottom: 10 }}>
                    <span style={{ fontSize: 72, fontWeight: 800, letterSpacing: '-0.05em', color: TEXT, lineHeight: 1 }}>{num}</span>
                    <span style={{ fontSize: 40, fontWeight: 700, color: GREEN, lineHeight: 1, marginBottom: 6 }}>{suffix}</span>
                  </div>
                  <span style={{ color: MUTED, fontSize: 16, lineHeight: 1.45 }}>{label}</span>
                </div>
                {showDivider && (
                  <div style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.07)', alignSelf: 'stretch', margin: '0 56px' }} />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Footnote */}
        <div style={{ opacity: noteSp, transform: `translateY(${interpolate(noteSp, [0, 1], [12, 0])}px)` }}>
          <span style={{ color: DIM, fontSize: 13, letterSpacing: '0.04em' }}>
            Datos acumulados desde lanzamiento en beta privada · Jalisco, México
          </span>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ── Act 7: Close ──────────────────────────────────────────────────────────
function Act7() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const op = actOp(frame, A7S, A7E, 20, 40)
  if (op <= 0) return null

  const relF   = frame - A7S
  const h1Sp   = spring({ frame: Math.max(0, relF - 6),  fps, config: SP_HERO })
  const h2Sp   = spring({ frame: Math.max(0, relF - 22), fps, config: SP_HERO })
  const btnSp  = spring({ frame: Math.max(0, relF - 68), fps, config: SP_PANEL })
  const chipSp = spring({ frame: Math.max(0, relF - 90), fps, config: SP_PANEL })

  return (
    <AbsoluteFill style={{ opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>

        {/* Logo */}
        <Img
          src={staticFile('imagotipo-cEats.jpg')}
          style={{ width: 72, height: 72, objectFit: 'contain', filter: 'invert(1) brightness(1.1)', borderRadius: 16, opacity: h1Sp, transform: `scale(${interpolate(h1Sp, [0, 1], [0.82, 1])})` }}
        />

        {/* Two-line close headline */}
        <div style={{ textAlign: 'center' }}>
          <Reveal sp={h1Sp} style={{ marginBottom: 2 }}>
            <span style={{ display: 'block', color: TEXT, fontSize: 88, fontWeight: 800, letterSpacing: '-0.042em', lineHeight: 1.04 }}>
              Tu restaurante,
            </span>
          </Reveal>
          <Reveal sp={h2Sp}>
            <span style={{ display: 'block', color: GREEN, fontSize: 88, fontWeight: 800, letterSpacing: '-0.042em', lineHeight: 1.04 }}>
              siempre al día.
            </span>
          </Reveal>
        </div>

        {/* Ghost CTA button */}
        <div style={{
          opacity: btnSp,
          transform: `translateY(${interpolate(btnSp, [0, 1], [16, 0])}px)`,
          border: `1px solid rgba(242,242,240,0.18)`,
          borderRadius: 100,
          padding: '14px 40px',
          display: 'flex', alignItems: 'center', gap: 10,
          marginTop: 8,
        }}>
          <span style={{ color: TEXT, fontSize: 18, fontWeight: 600, letterSpacing: '0.01em' }}>ceats.app</span>
          <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <span style={{ color: MUTED, fontSize: 15, fontWeight: 500 }}>Únete gratis</span>
        </div>

        {/* Domain chip */}
        <div style={{
          opacity: chipSp,
          transform: `translateY(${interpolate(chipSp, [0, 1], [10, 0])}px)`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: GREEN }} />
          <span style={{ color: DIM, fontSize: 13, fontWeight: 500, letterSpacing: '0.06em' }}>
            ceats.app
          </span>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ── Root composition ──────────────────────────────────────────────────────
export function CeatsVideo() {
  const frame = useCurrentFrame()

  const step = getStep(frame)
  const connectionActive = step === 12
  const glowOp = frame >= A5S && frame <= A5E
    ? (connectionActive ? 0.22 : 0.06)
    : 0

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FF }}>
      <Background glowOp={glowOp} />
      <HeaderBrand frame={frame} />

      <Act1 />
      <Act2 />
      <Act3 />
      <Act4 />
      <Act5 />
      <Act6 />
      <Act7 />
    </AbsoluteFill>
  )
}
