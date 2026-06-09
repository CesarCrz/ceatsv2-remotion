import React from 'react'
import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import type { LucideIcon } from 'lucide-react'
import { User, Store, MessageSquare, BarChart3, Zap } from 'lucide-react'
import { IPhoneMockup } from './IPhoneMockup'
import { LeftPhone } from './LeftPhone'
import { RightPhone } from './RightPhone'
import {
  C, STEP_STARTS, ANIMATION_END, VIDEO_OFFSET,
  LEFT_PHONE_X, RIGHT_PHONE_X, PHONE_Y_FINAL, LABEL_Y,
  PHONE_W, PHONE_H, CONNECTOR_W, relFrame, getStep,
} from './constants'

// ── Act timing (frames at 60fps) ──────────────────────────────────────────
const A1S = 0,    A1E = 360   // 6s   — Problem
const A2S = 360,  A2E = 600   // 4s   — Brand reveal
const A3S = 600,  A3E = 840   // 4s   — Value props
const A4S = 840,  A4E = 990   // 2.5s — Bridge "Así funciona."
const A5S = VIDEO_OFFSET       // 990  — Demo (phone flow)
const A5E = ANIMATION_END      // 2283
const A6S = A5E,  A6E = 2523  // 4s   — Social proof
const A7S = 2523, A7E = 2793  // 4.5s — Close

// ── Design tokens ─────────────────────────────────────────────────────────
const FF    = "'Inter', -apple-system, system-ui, sans-serif"
const TEXT  = '#F7F7F5'
const MUTED = 'rgba(247,247,245,0.42)'
const BG    = '#060709'
const GREEN = C.green

// ── Helpers ───────────────────────────────────────────────────────────────
function actOp(frame: number, start: number, end: number, fi = 24, fo = 24) {
  const i = interpolate(frame, [start, start + fi], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const o = interpolate(frame, [end - fo, end], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return Math.min(i, o)
}

// ── Background ────────────────────────────────────────────────────────────
function Background({ glowOp = 0.05 }: { glowOp?: number }) {
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 60%, #0c1810 0%, #07080F 55%, ${BG} 100%)` }} />
      <div style={{
        position: 'absolute',
        left: LEFT_PHONE_X - 100,
        top: PHONE_Y_FINAL + PHONE_H * 0.3,
        width: PHONE_W * 2 + CONNECTOR_W + 200,
        height: 400,
        background: `radial-gradient(ellipse at 50% 50%, rgba(6,193,103,${glowOp}) 0%, transparent 70%)`,
        borderRadius: '50%',
      }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.018) 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.7 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(180deg, rgba(5,6,8,0.85) 0%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 140, background: 'linear-gradient(0deg, rgba(5,6,8,0.95) 0%, transparent 100%)' }} />
    </AbsoluteFill>
  )
}

// ── Act 1: Problem ────────────────────────────────────────────────────────
function Act1() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const op = actOp(frame, A1S, A1E, 20, 30)
  if (op <= 0) return null

  const h1Sp = spring({ frame: Math.max(0, frame - 10), fps, config: { stiffness: 140, damping: 22 } })
  const h2Sp = spring({ frame: Math.max(0, frame - 24), fps, config: { stiffness: 140, damping: 22 } })

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
  const statProgress = interpolate(frame, [60, 155], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic })
  const stat = Math.round(statProgress * 73)
  const statSp = spring({ frame: Math.max(0, frame - 55), fps, config: { stiffness: 100, damping: 20 } })

  const pains = [
    'Sin registro ni historial de pedidos.',
    'Errores de captura constantes.',
    'Clientes sin respuesta a tiempo.',
  ]

  return (
    <AbsoluteFill style={{ opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 920, textAlign: 'center' }}>

        {/* Headline — two-line clip reveal */}
        <div style={{ overflow: 'hidden', marginBottom: 4 }}>
          <span style={{ display: 'block', transform: `translateY(${interpolate(h1Sp, [0, 1], [110, 0])}%)`, fontSize: 74, fontWeight: 800, letterSpacing: '-0.03em', color: TEXT, lineHeight: 1.1 }}>
            Gestionar pedidos
          </span>
        </div>
        <div style={{ overflow: 'hidden', marginBottom: 60 }}>
          <span style={{ display: 'block', transform: `translateY(${interpolate(h2Sp, [0, 1], [110, 0])}%)`, fontSize: 74, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            <span style={{ color: TEXT }}>por WhatsApp es </span>
            <span style={{ color: GREEN }}>un caos.</span>
          </span>
        </div>

        {/* Stat */}
        <div style={{ opacity: statSp, transform: `translateY(${interpolate(statSp, [0, 1], [20, 0])}px)`, marginBottom: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            <span style={{ fontSize: 100, fontWeight: 800, letterSpacing: '-0.04em', color: GREEN, lineHeight: 1 }}>{stat}</span>
            <span style={{ fontSize: 56, fontWeight: 700, color: GREEN, lineHeight: 1, marginBottom: 10 }}>%</span>
          </div>
          <span style={{ color: MUTED, fontSize: 20, letterSpacing: '0.01em' }}>
            de restaurantes pierde pedidos por errores en WhatsApp
          </span>
        </div>

        {/* Pain points */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start', width: '100%', maxWidth: 640 }}>
          {pains.map((pain, i) => {
            const pSp = spring({ frame: Math.max(0, frame - (168 + i * 38)), fps, config: { stiffness: 120, damping: 22 } })
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: pSp, transform: `translateX(${interpolate(pSp, [0, 1], [-18, 0])}px)` }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.22)', flexShrink: 0 }} />
                <span style={{ color: MUTED, fontSize: 20, lineHeight: 1.4 }}>{pain}</span>
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
  const op = actOp(frame, A2S, A2E, 20, 24)
  if (op <= 0) return null

  const relF = frame - A2S

  const wmSp    = spring({ frame: Math.max(0, relF - 8),  fps, config: { stiffness: 95, damping: 22, mass: 1.4 } })
  const blur    = interpolate(wmSp, [0, 1], [16, 0])
  const wmScale = interpolate(wmSp, [0, 1], [0.91, 1])

  const tagSp = spring({ frame: Math.max(0, relF - 38), fps, config: { stiffness: 110, damping: 20 } })
  const ctaSp = spring({ frame: Math.max(0, relF - 72), fps, config: { stiffness: 100, damping: 20 } })

  return (
    <AbsoluteFill style={{ opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>

        {/* Wordmark: blur-in reveal */}
        <div style={{ transform: `scale(${wmScale})`, filter: `blur(${blur}px)`, opacity: wmSp, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: GREEN, boxShadow: `0 0 32px ${GREEN}, 0 0 60px rgba(6,193,103,0.3)` }} />
          <span style={{ color: TEXT, fontSize: 92, fontWeight: 800, letterSpacing: '-0.045em' }}>cEats</span>
        </div>

        {/* Tagline clip reveal */}
        <div style={{ overflow: 'hidden', opacity: tagSp }}>
          <p style={{
            margin: 0,
            transform: `translateY(${interpolate(tagSp, [0, 1], [20, 0])}px)`,
            color: MUTED, fontSize: 26, fontWeight: 400,
            letterSpacing: '0.005em', textAlign: 'center', lineHeight: 1.4,
          }}>
            La plataforma de pedidos para restaurantes modernos.
          </p>
        </div>

        {/* URL chip */}
        <div style={{ opacity: ctaSp, transform: `translateY(${interpolate(ctaSp, [0, 1], [10, 0])}px)`, display: 'flex', alignItems: 'center', gap: 10, backgroundColor: 'rgba(6,193,103,0.08)', border: '1px solid rgba(6,193,103,0.2)', borderRadius: 100, padding: '10px 26px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: GREEN }} />
          <span style={{ color: 'rgba(247,247,245,0.6)', fontSize: 18, fontWeight: 600, letterSpacing: '0.04em' }}>ceats.app</span>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ── Act 3: Value props ────────────────────────────────────────────────────
const VALUE_PROPS = [
  { Icon: MessageSquare, title: 'Pedidos desde WhatsApp',  desc: 'Tu cliente ordena sin instalar nada.',         delay: 16 },
  { Icon: BarChart3,     title: 'Control en tiempo real',  desc: 'Dashboard para tu equipo, siempre al día.',    delay: 48 },
  { Icon: Zap,           title: 'Menú web propio',          desc: 'Experiencia Uber Eats bajo tu marca.',         delay: 80 },
] as const

function Act3() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const op = actOp(frame, A3S, A3E, 20, 24)
  if (op <= 0) return null

  const relF   = frame - A3S
  const labelSp = spring({ frame: Math.max(0, relF), fps, config: { stiffness: 120, damping: 22 } })

  return (
    <AbsoluteFill style={{ opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 60 }}>

        {/* Label */}
        <div style={{ overflow: 'hidden', opacity: labelSp }}>
          <span style={{ display: 'block', transform: `translateY(${interpolate(labelSp, [0, 1], [100, 0])}%)`, color: GREEN, fontSize: 14, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
            Por qué cEats
          </span>
        </div>

        {/* Three props */}
        <div style={{ display: 'flex', gap: 64 }}>
          {VALUE_PROPS.map(({ Icon, title, desc, delay }, i) => {
            const sp = spring({ frame: Math.max(0, relF - delay), fps, config: { stiffness: 130, damping: 22 } })
            return (
              <div key={i} style={{ opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [26, 0])}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, maxWidth: 272, textAlign: 'center' }}>
                <div style={{ width: 68, height: 68, borderRadius: 20, backgroundColor: 'rgba(6,193,103,0.08)', border: '1px solid rgba(6,193,103,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={32} color={GREEN} strokeWidth={1.7} />
                </div>
                <div>
                  <div style={{ color: TEXT, fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 10 }}>{title}</div>
                  <div style={{ color: MUTED, fontSize: 18, lineHeight: 1.55 }}>{desc}</div>
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
  const op = actOp(frame, A4S, A4E, 20, 30)
  if (op <= 0) return null

  const relF  = frame - A4S
  const headSp = spring({ frame: Math.max(0, relF - 6), fps, config: { stiffness: 110, damping: 22, mass: 1.2 } })
  const subSp  = spring({ frame: Math.max(0, relF - 30), fps, config: { stiffness: 100, damping: 22 } })

  return (
    <AbsoluteFill style={{ opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ display: 'block', transform: `translateY(${interpolate(headSp, [0, 1], [100, 0])}%)`, color: TEXT, fontSize: 84, fontWeight: 800, letterSpacing: '-0.035em' }}>
            Así funciona.
          </span>
        </div>
        <div style={{ overflow: 'hidden', opacity: subSp }}>
          <span style={{ display: 'block', transform: `translateY(${interpolate(subSp, [0, 1], [18, 0])}%)`, color: MUTED, fontSize: 22, fontWeight: 400 }}>
            Mira el flujo completo.
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
  const connectionActive = frame >= STEP_STARTS[10] && frame < STEP_STARTS[12]

  if (!connectionActive) return (
    <div style={{ position: 'absolute', left: LEFT_PHONE_X + PHONE_W, top: PHONE_Y_FINAL + PHONE_H / 2 - 1, width: CONNECTOR_W, height: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 1 }} />)}
    </div>
  )

  const arrowRel  = relFrame(frame, 10)
  const shaftScale = Math.min(1, spring({ frame: arrowRel, fps, config: { stiffness: 300, damping: 28 }, durationInFrames: 18 }))
  const headOp    = spring({ frame: Math.max(0, arrowRel - 14), fps, config: { stiffness: 400, damping: 28 }, durationInFrames: 8 })
  const exitRel   = Math.max(0, frame - STEP_STARTS[12] + 6)
  const arrowOp   = frame >= STEP_STARTS[12] ? Math.max(0, 1 - exitRel / 8) : 1

  return (
    <div style={{ position: 'absolute', left: LEFT_PHONE_X + PHONE_W + 8, top: PHONE_Y_FINAL + PHONE_H / 2 - 8, width: CONNECTOR_W - 16, display: 'flex', alignItems: 'center', opacity: arrowOp }}>
      <div style={{ flex: 1, height: 2, backgroundColor: GREEN, transformOrigin: 'left', transform: `scaleX(${shaftScale})`, boxShadow: `0 0 10px ${GREEN}, 0 0 20px rgba(6,193,103,0.4)` }} />
      <div style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: `10px solid ${GREEN}`, opacity: headOp, filter: `drop-shadow(0 0 5px ${GREEN})`, flexShrink: 0 }} />
    </div>
  )
}

function PhoneLabel({ x, label, Icon }: { x: number; label: string; Icon: LucideIcon }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const op = spring({ frame: Math.max(0, frame - (A5S + 45)), fps, config: { stiffness: 120, damping: 20 } })
  const y  = interpolate(op, [0, 1], [12, 0])
  return (
    <div style={{ position: 'absolute', left: x, top: LABEL_Y, width: PHONE_W, display: 'flex', justifyContent: 'center', opacity: op, transform: `translateY(${y}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '6px 18px 6px 12px' }}>
        <Icon size={16} color="rgba(247,247,245,0.55)" strokeWidth={2} />
        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 600, letterSpacing: '0.04em' }}>{label}</span>
      </div>
    </div>
  )
}

function Act5() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Start rendering 60f early so phones can slide in during Act4 fade-out
  if (frame < A5S - 60 || frame > A5E + 30) return null

  const phoneEntryRel = Math.max(0, frame - (A5S - 40))
  const phoneProgress = spring({ frame: phoneEntryRel, fps, config: { stiffness: 95, damping: 17, mass: 1.5 } })
  const phoneY  = interpolate(phoneProgress, [0, 1], [PHONE_Y_FINAL + 280, PHONE_Y_FINAL])
  const phoneOp = spring({ frame: phoneEntryRel, fps, config: { stiffness: 80, damping: 16 } })
  const exitOp  = interpolate(frame, [A5E - 30, A5E], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const step = getStep(frame)
  const connectionActive = step === 10 || step === 11
  const glowOp = connectionActive ? 0.18 : 0.07
  const shadow = `0 60px 140px rgba(0,0,0,0.75), 0 0 0 0.5px rgba(255,255,255,0.07), 0 0 80px rgba(6,193,103,${glowOp})`

  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: Math.min(phoneOp, exitOp) }}>
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
  { to: 1247, suffix: '',  label: 'pedidos gestionados',      delay: 18,  fmt: (n: number) => n.toLocaleString('es-MX') },
  { to: 200,  suffix: '+', label: 'restaurantes',              delay: 52,  fmt: (n: number) => n.toString() },
  { to: 98,   suffix: '%', label: 'satisfacción de usuarios', delay: 86,  fmt: (n: number) => n.toString() },
] as const

function Act6() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const op = actOp(frame, A6S, A6E, 24, 24)
  if (op <= 0) return null

  const relF    = frame - A6S
  const labelSp = spring({ frame: Math.max(0, relF - 4), fps, config: { stiffness: 120, damping: 22 } })
  const noteSp  = spring({ frame: Math.max(0, relF - 130), fps, config: { stiffness: 100, damping: 22 } })
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

  return (
    <AbsoluteFill style={{ opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 64 }}>

        <div style={{ overflow: 'hidden', opacity: labelSp }}>
          <span style={{ display: 'block', transform: `translateY(${interpolate(labelSp, [0, 1], [100, 0])}%)`, color: GREEN, fontSize: 14, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
            Resultados reales
          </span>
        </div>

        <div style={{ display: 'flex', gap: 88 }}>
          {STATS.map(({ to, suffix, label, delay, fmt }, i) => {
            const sp = spring({ frame: Math.max(0, relF - delay), fps, config: { stiffness: 110, damping: 22 } })
            const countProg = interpolate(frame, [A6S + delay, A6S + delay + 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic })
            const count = Math.round(countProg * to)
            return (
              <div key={i} style={{ opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [22, 0])}px)`, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, justifyContent: 'center' }}>
                  <span style={{ color: TEXT, fontSize: 82, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>{fmt(count)}</span>
                  <span style={{ color: GREEN, fontSize: 50, fontWeight: 700, lineHeight: 1, marginBottom: 8 }}>{suffix}</span>
                </div>
                <span style={{ color: MUTED, fontSize: 18 }}>{label}</span>
              </div>
            )
          })}
        </div>

        <span style={{ color: 'rgba(247,247,245,0.18)', fontSize: 14, opacity: noteSp }}>Beta privada · 2025</span>
      </div>
    </AbsoluteFill>
  )
}

// ── Act 7: Close ──────────────────────────────────────────────────────────
function Act7() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const op = actOp(frame, A7S, A7E, 24, 50)
  if (op <= 0) return null

  const relF   = frame - A7S
  const headSp = spring({ frame: Math.max(0, relF - 6),  fps, config: { stiffness: 110, damping: 22, mass: 1.2 } })
  const ctaSp  = spring({ frame: Math.max(0, relF - 38), fps, config: { stiffness: 100, damping: 22 } })
  const subSp  = spring({ frame: Math.max(0, relF - 58), fps, config: { stiffness: 100, damping: 22 } })
  const dotSp  = spring({ frame: Math.max(0, relF - 72), fps, config: { stiffness: 220, damping: 22 } })

  return (
    <AbsoluteFill style={{ opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ display: 'block', transform: `translateY(${interpolate(headSp, [0, 1], [100, 0])}%)`, color: TEXT, fontSize: 100, fontWeight: 800, letterSpacing: '-0.04em' }}>
            Empieza hoy.
          </span>
        </div>

        <div style={{ opacity: ctaSp, transform: `translateY(${interpolate(ctaSp, [0, 1], [14, 0])}px)`, display: 'flex', alignItems: 'center', gap: 14, backgroundColor: GREEN, borderRadius: 100, padding: '16px 40px', boxShadow: `0 0 50px rgba(6,193,103,0.4), 0 8px 32px rgba(6,193,103,0.28)` }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.7)', transform: `scale(${dotSp})` }} />
          <span style={{ color: 'white', fontSize: 26, fontWeight: 700, letterSpacing: '-0.01em' }}>ceats.app</span>
        </div>

        <div style={{ overflow: 'hidden', opacity: subSp }}>
          <span style={{ display: 'block', transform: `translateY(${interpolate(subSp, [0, 1], [16, 0])}%)`, color: MUTED, fontSize: 20 }}>
            Gratis durante tu primer mes.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────
export function CeatsVideo() {
  const frame = useCurrentFrame()
  const step = getStep(frame)
  const connectionActive = step === 10 || step === 11
  const inDemo = frame >= A5S && frame < A5E

  const fadeToBlack = interpolate(frame, [A7E - 45, A7E], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FF }}>
      <Background glowOp={inDemo ? (connectionActive ? 0.18 : 0.07) : 0.04} />
      <Act1 />
      <Act2 />
      <Act3 />
      <Act4 />
      <Act5 />
      <Act6 />
      <Act7 />
      <AbsoluteFill style={{ backgroundColor: '#000', opacity: fadeToBlack, pointerEvents: 'none' }} />
    </AbsoluteFill>
  )
}
