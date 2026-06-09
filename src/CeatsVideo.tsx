import React from 'react'
import { AbsoluteFill, Img, spring, interpolate, useCurrentFrame, useVideoConfig, staticFile } from 'remotion'
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
const A1S = 0,    A1E = 360   // 6s   — Problem
const A2S = 360,  A2E = 600   // 4s   — Brand reveal
const A3S = 600,  A3E = 840   // 4s   — Value props
const A4S = 840,  A4E = 990   // 2.5s — Bridge
const A5S = VIDEO_OFFSET       // 990  — Demo (phone flow)
const A5E = ANIMATION_END
const A6S = A5E,  A6E = A5E + 240   // 4s — Social proof
const A7S = A6E,  A7E = A6E + 270  // 4.5s — Close

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

// ── Persistent header branding ─────────────────────────────────────────────
function HeaderBrand() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const sp = spring({ frame: Math.max(0, frame - 18), fps, config: { stiffness: 120, damping: 22 } })
  const op = interpolate(sp, [0, 1], [0, 1])
  const y  = interpolate(sp, [0, 1], [-12, 0])

  return (
    <div style={{
      position: 'absolute', top: 44, left: 72,
      display: 'flex', alignItems: 'center', gap: 14,
      opacity: op, transform: `translateY(${y}px)`,
      zIndex: 100,
    }}>
      <Img
        src={staticFile('imagotipo-cEats.jpg')}
        style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8, filter: 'invert(1) brightness(1.0)' }}
      />
      <span style={{ color: 'rgba(247,247,245,0.55)', fontSize: 15, fontWeight: 700, letterSpacing: '0.01em', fontFamily: FF }}>
        cEats
      </span>
    </div>
  )
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
        transition: 'opacity 0.3s',
      }} />
      {/* Subtle dot grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.6 }} />
      {/* Vignette */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 240, background: 'linear-gradient(180deg, rgba(5,6,8,0.9) 0%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, background: 'linear-gradient(0deg, rgba(5,6,8,0.95) 0%, transparent 100%)' }} />
    </AbsoluteFill>
  )
}

// ── Pill label ─────────────────────────────────────────────────────────────
function Pill({ label, frame, delay = 0 }: { label: string; frame: number; delay?: number }) {
  const { fps } = useVideoConfig()
  const sp = spring({ frame: Math.max(0, frame - delay), fps, config: { stiffness: 120, damping: 20 } })
  return (
    <div style={{ overflow: 'hidden', opacity: sp }}>
      <span style={{
        display: 'block',
        transform: `translateY(${interpolate(sp, [0, 1], [100, 0])}%)`,
        color: GREEN, fontSize: 13, fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase' as const,
      }}>
        {label}
      </span>
    </div>
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 940, textAlign: 'center' }}>

        {/* Eyebrow label */}
        <div style={{ marginBottom: 22 }}>
          <Pill label="El problema" frame={frame} delay={4} />
        </div>

        {/* Headline — two-line clip reveal */}
        <div style={{ overflow: 'hidden', marginBottom: 4 }}>
          <span style={{ display: 'block', transform: `translateY(${interpolate(h1Sp, [0, 1], [110, 0])}%)`, fontSize: 76, fontWeight: 800, letterSpacing: '-0.035em', color: TEXT, lineHeight: 1.08 }}>
            Gestionar pedidos
          </span>
        </div>
        <div style={{ overflow: 'hidden', marginBottom: 64 }}>
          <span style={{ display: 'block', transform: `translateY(${interpolate(h2Sp, [0, 1], [110, 0])}%)`, fontSize: 76, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.08 }}>
            <span style={{ color: TEXT }}>por WhatsApp es </span>
            <span style={{ color: GREEN }}>un caos.</span>
          </span>
        </div>

        {/* Stat */}
        <div style={{ opacity: statSp, transform: `translateY(${interpolate(statSp, [0, 1], [20, 0])}px)`, marginBottom: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {/* Stat card */}
          <div style={{ backgroundColor: 'rgba(6,193,103,0.06)', border: '1px solid rgba(6,193,103,0.14)', borderRadius: 24, padding: '28px 56px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
              <span style={{ fontSize: 108, fontWeight: 800, letterSpacing: '-0.05em', color: GREEN, lineHeight: 1 }}>{stat}</span>
              <span style={{ fontSize: 60, fontWeight: 700, color: GREEN, lineHeight: 1, marginBottom: 12 }}>%</span>
            </div>
            <span style={{ color: MUTED, fontSize: 19, letterSpacing: '0.01em' }}>
              de restaurantes pierde pedidos por errores en WhatsApp
            </span>
          </div>
        </div>

        {/* Pain points */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start', width: '100%', maxWidth: 640 }}>
          {pains.map((pain, i) => {
            const pSp = spring({ frame: Math.max(0, frame - (168 + i * 38)), fps, config: { stiffness: 120, damping: 22 } })
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: pSp, transform: `translateX(${interpolate(pSp, [0, 1], [-18, 0])}px)` }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.22)', flexShrink: 0 }} />
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
  const blur    = interpolate(wmSp, [0, 1], [20, 0])
  const wmScale = interpolate(wmSp, [0, 1], [0.88, 1])

  const tagSp = spring({ frame: Math.max(0, relF - 38), fps, config: { stiffness: 110, damping: 20 } })
  const ctaSp = spring({ frame: Math.max(0, relF - 72), fps, config: { stiffness: 100, damping: 20 } })

  return (
    <AbsoluteFill style={{ opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 38 }}>

        {/* Logo + Wordmark */}
        <div style={{ transform: `scale(${wmScale})`, filter: `blur(${blur}px)`, opacity: wmSp, display: 'flex', alignItems: 'center', gap: 24 }}>
          <Img
            src={staticFile('imagotipo-cEats.jpg')}
            style={{ width: 100, height: 100, objectFit: 'contain', filter: 'invert(1) brightness(1.1)', borderRadius: 20 }}
          />
          <span style={{ color: TEXT, fontSize: 96, fontWeight: 800, letterSpacing: '-0.048em' }}>cEats</span>
        </div>

        {/* Tagline */}
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
        <div style={{ opacity: ctaSp, transform: `translateY(${interpolate(ctaSp, [0, 1], [10, 0])}px)`, display: 'flex', alignItems: 'center', gap: 10, backgroundColor: 'rgba(6,193,103,0.08)', border: '1px solid rgba(6,193,103,0.2)', borderRadius: 100, padding: '11px 28px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: GREEN }} />
          <span style={{ color: 'rgba(247,247,245,0.6)', fontSize: 18, fontWeight: 600, letterSpacing: '0.04em' }}>ceats.app</span>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ── Act 3: Value props ────────────────────────────────────────────────────
const VALUE_PROPS = [
  { Icon: MessageSquare, title: 'Pedidos desde WhatsApp',  desc: 'Tu cliente ordena sin instalar nada.',        delay: 16 },
  { Icon: BarChart3,     title: 'Control en tiempo real',  desc: 'Dashboard para tu equipo, siempre al día.',   delay: 48 },
  { Icon: CreditCard,    title: 'Cobros con Stripe',       desc: 'Apple Pay, tarjeta y más — en segundos.',     delay: 80 },
] as const

function Act3() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const op = actOp(frame, A3S, A3E, 20, 24)
  if (op <= 0) return null

  const relF = frame - A3S

  return (
    <AbsoluteFill style={{ opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 64 }}>

        <Pill label="Por qué cEats" frame={frame} delay={A3S} />

        {/* Three props */}
        <div style={{ display: 'flex', gap: 72 }}>
          {VALUE_PROPS.map(({ Icon, title, desc, delay }, i) => {
            const sp = spring({ frame: Math.max(0, relF - delay), fps, config: { stiffness: 130, damping: 22 } })
            return (
              <div key={i} style={{ opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [30, 0])}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, maxWidth: 280, textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(6,193,103,0.07)', border: '1px solid rgba(6,193,103,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={34} color={GREEN} strokeWidth={1.6} />
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

  const relF   = frame - A4S
  const headSp = spring({ frame: Math.max(0, relF - 6), fps, config: { stiffness: 110, damping: 22, mass: 1.2 } })
  const subSp  = spring({ frame: Math.max(0, relF - 30), fps, config: { stiffness: 100, damping: 22 } })

  return (
    <AbsoluteFill style={{ opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ display: 'block', transform: `translateY(${interpolate(headSp, [0, 1], [100, 0])}%)`, color: TEXT, fontSize: 88, fontWeight: 800, letterSpacing: '-0.038em' }}>
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
      {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 1 }} />)}
    </div>
  )

  const arrowRel   = relFrame(frame, 10)
  const shaftScale = Math.min(1, spring({ frame: arrowRel, fps, config: { stiffness: 300, damping: 28 }, durationInFrames: 18 }))
  const headOp     = spring({ frame: Math.max(0, arrowRel - 14), fps, config: { stiffness: 400, damping: 28 }, durationInFrames: 8 })
  const exitRel    = Math.max(0, frame - STEP_STARTS[12] + 6)
  const arrowOp    = frame >= STEP_STARTS[12] ? Math.max(0, 1 - exitRel / 8) : 1

  return (
    <div style={{ position: 'absolute', left: LEFT_PHONE_X + PHONE_W + 8, top: PHONE_Y_FINAL + PHONE_H / 2 - 8, width: CONNECTOR_W - 16, display: 'flex', alignItems: 'center', opacity: arrowOp }}>
      <div style={{ flex: 1, height: 2, backgroundColor: GREEN, transformOrigin: 'left', transform: `scaleX(${shaftScale})`, boxShadow: `0 0 10px ${GREEN}, 0 0 22px rgba(6,193,103,0.4)` }} />
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 100, padding: '7px 20px 7px 14px' }}>
        <Icon size={15} color="rgba(247,247,245,0.5)" strokeWidth={2} />
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em' }}>{label}</span>
      </div>
    </div>
  )
}

function Act5() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  if (frame < A5S - 60 || frame > A5E + 30) return null

  const phoneEntryRel = Math.max(0, frame - (A5S - 40))
  const phoneProgress = spring({ frame: phoneEntryRel, fps, config: { stiffness: 95, damping: 17, mass: 1.5 } })
  const phoneY  = interpolate(phoneProgress, [0, 1], [PHONE_Y_FINAL + 320, PHONE_Y_FINAL])
  const phoneOp = spring({ frame: phoneEntryRel, fps, config: { stiffness: 80, damping: 16 } })
  const exitOp  = interpolate(frame, [A5E - 30, A5E], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const step = getStep(frame)
  const connectionActive = step === 10 || step === 11
  const glowOp = connectionActive ? 0.20 : 0.07
  const shadow = `0 70px 160px rgba(0,0,0,0.8), 0 0 0 0.5px rgba(255,255,255,0.07), 0 0 80px rgba(6,193,103,${glowOp})`

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
          <span style={{ display: 'block', transform: `translateY(${interpolate(labelSp, [0, 1], [100, 0])}%)`, color: GREEN, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
            Resultados reales
          </span>
        </div>

        <div style={{ display: 'flex', gap: 96 }}>
          {STATS.map(({ to, suffix, label, delay, fmt }, i) => {
            const sp = spring({ frame: Math.max(0, relF - delay), fps, config: { stiffness: 110, damping: 22 } })
            const countProg = interpolate(frame, [A6S + delay, A6S + delay + 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic })
            const count = Math.round(countProg * to)
            return (
              <div key={i} style={{ opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [22, 0])}px)`, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, justifyContent: 'center' }}>
                  <span style={{ color: TEXT, fontSize: 84, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>{fmt(count)}</span>
                  <span style={{ color: GREEN, fontSize: 52, fontWeight: 700, lineHeight: 1, marginBottom: 9 }}>{suffix}</span>
                </div>
                <span style={{ color: MUTED, fontSize: 18 }}>{label}</span>
              </div>
            )
          })}
        </div>

        <span style={{ color: 'rgba(247,247,245,0.16)', fontSize: 14, opacity: noteSp }}>Beta privada · 2025</span>
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

        {/* Logo lockup */}
        <div style={{ opacity: ctaSp, transform: `translateY(${interpolate(ctaSp, [0, 1], [12, 0])}px)`, display: 'flex', alignItems: 'center', gap: 16, marginBottom: -10 }}>
          <Img
            src={staticFile('imagotipo-cEats.jpg')}
            style={{ width: 52, height: 52, objectFit: 'contain', filter: 'invert(1) brightness(1.1)', borderRadius: 12 }}
          />
        </div>

        <div style={{ overflow: 'hidden' }}>
          <span style={{ display: 'block', transform: `translateY(${interpolate(headSp, [0, 1], [100, 0])}%)`, color: TEXT, fontSize: 104, fontWeight: 800, letterSpacing: '-0.042em' }}>
            Empieza hoy.
          </span>
        </div>

        <div style={{ opacity: ctaSp, transform: `translateY(${interpolate(ctaSp, [0, 1], [14, 0])}px)`, display: 'flex', alignItems: 'center', gap: 14, backgroundColor: GREEN, borderRadius: 100, padding: '17px 44px', boxShadow: `0 0 60px rgba(6,193,103,0.45), 0 10px 40px rgba(6,193,103,0.3)` }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.7)', transform: `scale(${dotSp})` }} />
          <span style={{ color: 'white', fontSize: 27, fontWeight: 700, letterSpacing: '-0.01em' }}>ceats.app</span>
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

  const totalDuration = A7E
  const fadeToBlack = interpolate(frame, [totalDuration - 45, totalDuration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FF }}>
      <Background glowOp={inDemo ? (connectionActive ? 0.20 : 0.07) : 0.04} />
      <HeaderBrand />
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
