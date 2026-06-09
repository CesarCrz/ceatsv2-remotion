import React from 'react'
import { spring, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, WA_MESSAGES, STEP_STARTS, relFrame, getStep } from './constants'

// ── WA Text renderer ──────────────────────────────────────────────────────
function WaText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => {
        const parts = line.split(/(\*[^*]+\*)/g)
        return (
          <span key={i} style={{ display: 'block' }}>
            {parts.map((p, j) =>
              /^\*[^*]+\*$/.test(p)
                ? <strong key={j} style={{ fontWeight: 700 }}>{p.slice(1, -1)}</strong>
                : <span key={j}>{p}</span>
            )}
          </span>
        )
      })}
    </>
  )
}

function TypingDot({ index, frame }: { index: number; frame: number }) {
  const phase = (frame * 0.28) + index * (Math.PI * 2 / 3)
  return (
    <div style={{
      width: 8, height: 8, borderRadius: '50%', backgroundColor: '#888',
      transform: `translateY(${Math.sin(phase) * 4 - 1}px)`,
      opacity: 0.35 + 0.65 * ((Math.sin(phase) + 1) / 2),
    }} />
  )
}

// ── Stripe Checkout Sheet ────────────────────────────────────────────────
function StripeCheckout({ frame, fps }: { frame: number; fps: number }) {
  const step = getStep(frame)
  const sheetRel = relFrame(frame, 12)

  // Sheet slides up from bottom
  const sheetSp = spring({ frame: sheetRel, fps, config: { stiffness: 220, damping: 28, mass: 1.1 } })
  const sheetY = interpolate(sheetSp, [0, 1], [500, 0])

  const applePayTapped = step >= 14
  const paymentSuccess = step >= 15

  const applePayRel = relFrame(frame, 14)
  const applePressSp = spring({ frame: applePayRel, fps, config: { stiffness: 400, damping: 30 } })
  const applePressScale = applePayTapped ? interpolate(applePressSp, [0, 1], [0.96, 1]) : 1

  const successRel = relFrame(frame, 15)
  const successSp = spring({ frame: successRel, fps, config: { stiffness: 260, damping: 26 } })
  const successOp = successSp
  const checkScale = spring({ frame: Math.max(0, successRel - 8), fps, config: { stiffness: 360, damping: 22 } })

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      {/* Sheet */}
      <div style={{
        transform: `translateY(${sheetY}px)`,
        backgroundColor: '#F6F8FB',
        borderRadius: '20px 20px 0 0',
        overflow: 'hidden',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.22)',
        paddingBottom: 28,
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 8 }}>
          <div style={{ width: 36, height: 4, backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 2 }} />
        </div>

        {/* Stripe header */}
        <div style={{ padding: '6px 20px 16px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Stripe wordmark */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M5.48 4.68C5.48 4.14 5.94 3.92 6.72 3.92C7.84 3.92 9.24 4.26 10.36 4.88V1.84C9.12 1.36 7.9 1.16 6.72 1.16C3.96 1.16 2.12 2.56 2.12 4.84C2.12 8.42 7.08 7.88 7.08 9.46C7.08 10.1 6.52 10.32 5.7 10.32C4.46 10.32 2.84 9.82 1.6 9.1V12.18C2.96 12.72 4.32 12.96 5.7 12.96C8.52 12.96 10.46 11.6 10.46 9.3C10.44 5.44 5.48 6.1 5.48 4.68Z" fill="white" />
                  </svg>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', letterSpacing: '-0.01em' }}>stripe</span>
              </div>
              <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.3)', fontWeight: 500 }}>· checkout seguro</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#06C167' }} />
              <span style={{ fontSize: 11, color: '#06C167', fontWeight: 600 }}>Encriptado</span>
            </div>
          </div>

          {/* Order summary */}
          <div style={{ marginTop: 14, backgroundColor: 'white', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.4)', fontWeight: 600, marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>Tacos El Güero</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 13, color: '#111', fontWeight: 500 }}>2× Taco al Pastor</span>
                <span style={{ fontSize: 13, color: '#111', fontWeight: 500 }}>1× Agua de Jamaica</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#111', letterSpacing: '-0.03em' }}>$65</div>
                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)' }}>MXN</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div style={{ padding: '16px 20px 0' }}>

          {/* Apple Pay — primary CTA */}
          <div
            style={{
              backgroundColor: applePayTapped ? '#333' : '#000',
              borderRadius: 13,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transform: `scale(${applePressScale})`,
              boxShadow: applePayTapped ? 'none' : '0 4px 18px rgba(0,0,0,0.25)',
            }}
          >
            {/* Apple logo */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <span style={{ color: 'white', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>
              {applePayTapped ? 'Procesando...' : 'Pay'}
            </span>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0' }}>
            <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.1)' }} />
            <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.3)', fontWeight: 600 }}>o paga con tarjeta</span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.1)' }} />
          </div>

          {/* Card field (decorative) */}
          <div style={{ backgroundColor: 'white', borderRadius: 10, border: '1.5px solid rgba(99,91,255,0.3)', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 3 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#eb001b', opacity: 0.9 }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f79e1b', opacity: 0.9, marginLeft: -4 }} />
              </div>
              <span style={{ fontSize: 13, color: '#999', letterSpacing: '0.08em' }}>•••• •••• •••• ••••</span>
            </div>
            <span style={{ fontSize: 11, color: '#bbb' }}>MM/AA</span>
          </div>

          {/* Trust row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
              <path d="M5 0L0 2V6C0 8.76 2.24 11.35 5 12C7.76 11.35 10 8.76 10 6V2L5 0Z" fill="rgba(0,0,0,0.25)" />
            </svg>
            <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.3)', fontWeight: 500 }}>Powered by Stripe · Pago 100% seguro</span>
          </div>
        </div>
      </div>

      {/* Payment success overlay */}
      {paymentSuccess && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: '#07080F',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 20, opacity: successOp,
        }}>
          {/* Success ring */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            backgroundColor: 'rgba(6,193,103,0.12)',
            border: `2px solid ${C.green}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${checkScale})`,
            boxShadow: `0 0 40px rgba(6,193,103,0.3)`,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'white', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Pago confirmado</div>
            <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, marginTop: 6 }}>Tu pedido fue enviado al restaurante</div>
          </div>
          {/* Receipt chip */}
          <div style={{
            backgroundColor: 'rgba(6,193,103,0.08)',
            border: `1px solid ${C.green}30`,
            borderRadius: 12, padding: '10px 18px',
            display: 'flex', alignItems: 'center', gap: 10,
            opacity: spring({ frame: Math.max(0, successRel - 20), fps, config: { stiffness: 200, damping: 24 } }),
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke={C.green} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div>
              <div style={{ color: C.green, fontSize: 12, fontWeight: 700 }}>Pedido #A-047 · $65 MXN</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 1 }}>Apple Pay · Visa ••4242</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main LeftPhone ────────────────────────────────────────────────────────
export function LeftPhone() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const step = getStep(frame)

  // Menu enter/exit
  const menuEnterRel = relFrame(frame, 7)
  const menuEnterX = interpolate(
    spring({ frame: menuEnterRel, fps, config: { stiffness: 280, damping: 30 } }),
    [0, 1], [393, 0]
  )
  // Menu stays visible through payment steps
  const menuExitRel = relFrame(frame, 19)
  const menuExitX = interpolate(
    spring({ frame: menuExitRel, fps, config: { stiffness: 300, damping: 30 } }),
    [0, 1], [0, 393]
  )
  const menuX = frame < STEP_STARTS[7] ? 393 : frame < STEP_STARTS[19] ? menuEnterX : menuExitX
  const showMenu = frame >= STEP_STARTS[7]

  // Payment sheet: step 12+
  const showPayment = step >= 12 && step < 19

  // Slogan: step 19+
  const sloganRel = relFrame(frame, 19)
  const sloganOpacity = spring({ frame: sloganRel, fps, config: { stiffness: 180, damping: 26 } })
  const sloganY = interpolate(sloganOpacity, [0, 1], [20, 0])

  // WA messages
  const visibleMessages = WA_MESSAGES.filter(m => frame >= STEP_STARTS[m.visibleAtStep])
  const showTyping = (frame >= STEP_STARTS[2] && frame < STEP_STARTS[3]) ||
                     (frame >= STEP_STARTS[5] && frame < STEP_STARTS[6])

  const confirmRel = relFrame(frame, 12)
  const confirmOpacity = spring({ frame: confirmRel, fps, config: { stiffness: 360, damping: 28 } })
  const confirmY = interpolate(confirmOpacity, [0, 1], [14, 0])

  // Cart state
  const cartCount = frame >= STEP_STARTS[9] ? 2 : frame >= STEP_STARTS[8] ? 1 : 0
  const cartTotal = cartCount === 2 ? '$65 MXN' : '$45 MXN'
  const cartBarRel = relFrame(frame, 8)
  const cartBarY = interpolate(
    spring({ frame: cartBarRel, fps, config: { stiffness: 360, damping: 28 } }),
    [0, 1], [80, 0]
  )
  const orderTapped = frame >= STEP_STARTS[10]
  const orderSending = frame >= STEP_STARTS[11]

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: C.waBg }}>

      {/* ── WA screen ── */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 59, flexShrink: 0, backgroundColor: C.waHeader }} />
        <div style={{ backgroundColor: C.waHeader, flexShrink: 0, padding: '11px 16px 13px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 30, lineHeight: 1 }}>‹</span>
          <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: C.waHeaderLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🍽️</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 17 }}>Tacos El Güero</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 2 }}>
              {step >= 12 ? 'pedido recibido ✓' : 'en línea'}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', backgroundColor: C.waBg }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '12px 12px 10px', gap: 4 }}>
            {visibleMessages.map(msg => {
              const msgRel = relFrame(frame, msg.visibleAtStep)
              const op = spring({ frame: msgRel, fps, config: { stiffness: 420, damping: 30, mass: 0.75 } })
              const y = interpolate(op, [0, 1], [14, 0])
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'customer' ? 'flex-start' : 'flex-end', transform: `translateY(${y}px)`, opacity: op }}>
                  <div style={{ maxWidth: '78%', backgroundColor: msg.from === 'customer' ? 'white' : C.waBotBubble, borderRadius: msg.from === 'customer' ? '14px 14px 14px 3px' : '14px 14px 3px 14px', padding: '9px 12px 6px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: 15, color: '#111', lineHeight: 1.48 }}><WaText text={msg.text} /></div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 3 }}>
                      <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.38)' }}>{msg.time}</span>
                      {msg.from === 'bot' && <span style={{ fontSize: 13, color: C.waRead }}>✓✓</span>}
                    </div>
                  </div>
                </div>
              )
            })}

            {showTyping && (() => {
              const typRel = frame >= STEP_STARTS[2] && frame < STEP_STARTS[3]
                ? relFrame(frame, 2) : relFrame(frame, 5)
              const typOp = spring({ frame: typRel, fps, config: { stiffness: 420, damping: 28 } })
              return (
                <div style={{ display: 'flex', justifyContent: 'flex-end', opacity: typOp }}>
                  <div style={{ backgroundColor: C.waBotBubble, borderRadius: '14px 14px 3px 14px', padding: '12px 15px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', display: 'flex', gap: 6, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => <TypingDot key={i} index={i} frame={frame} />)}
                  </div>
                </div>
              )
            })()}

            {step >= 12 && step < 15 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', transform: `translateY(${confirmY}px)`, opacity: confirmOpacity }}>
                <div style={{ maxWidth: '82%', backgroundColor: C.waBotBubble, borderRadius: '14px 14px 3px 14px', padding: '9px 12px 6px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: 15, color: '#111', lineHeight: 1.48 }}>
                    ✅ ¡Pedido listo para pago! <strong>#A-047</strong><br />
                    Completa tu pago seguro 👇<br />
                    <span style={{ color: C.green, fontWeight: 600 }}>$65 MXN</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 3 }}>
                    <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.38)' }}>8:43 p.m.</span>
                    <span style={{ fontSize: 13, color: C.waRead }}>✓✓</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ backgroundColor: '#F0F2F0', flexShrink: 0, padding: '9px 12px', display: 'flex', gap: 9, alignItems: 'center' }}>
          <div style={{ flex: 1, backgroundColor: 'white', borderRadius: 100, padding: '10px 16px', fontSize: 15, color: '#bbb' }}>Escribe un mensaje</div>
          <div style={{ width: 46, height: 46, borderRadius: '50%', backgroundColor: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🎤</div>
        </div>
      </div>

      {/* ── Menu web screen ── */}
      {showMenu && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', backgroundColor: '#f8f8f8', transform: `translateX(${menuX}px)` }}>
          <div style={{ height: 59, flexShrink: 0, backgroundColor: '#1c1c1e' }} />
          {/* Safari URL bar */}
          <div style={{ backgroundColor: '#1c1c1e', flexShrink: 0, padding: '7px 14px 9px', display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 22 }}>‹</span>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 9, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 12, color: '#4caf9e' }}>🔒</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', fontWeight: 500 }}>ceats.app/tacos-centro</span>
            </div>
          </div>
          {/* Restaurant header */}
          <div style={{ backgroundColor: '#07080F', padding: '16px 16px 14px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 13, backgroundColor: '#128C7E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🌮</div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>Tacos El Güero</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 2 }}>Centro · Tlaquepaque · Abierto</div>
              </div>
            </div>
          </div>
          {/* Menu items */}
          <div style={{ flex: 1, overflowY: 'hidden', backgroundColor: '#f8f8f8', padding: '14px 16px 0' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#333', marginBottom: 9, letterSpacing: '0.02em' }}>🌮 Tacos</div>
            {[
              { name: 'Taco al Pastor', desc: 'Cilantro, cebolla, piña', price: '$22.50', addStep: 8 },
              { name: 'Taco de Bistec', desc: 'Con guacamole y salsa', price: '$25.00', addStep: -1 },
            ].map((item, i) => {
              const itemOp = Math.min(1, Math.max(0, spring({ frame: Math.max(0, relFrame(frame, 8) - i * 9), fps, config: { stiffness: 320, damping: 26 } })))
              const added = item.addStep > 0 && frame >= STEP_STARTS[item.addStep]
              return (
                <div key={i} style={{ backgroundColor: 'white', borderRadius: 13, padding: '12px 14px', marginBottom: 9, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', opacity: itemOp }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{item.desc}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginTop: 5 }}>{item.price}</div>
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: added ? C.green : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: added ? 'white' : '#999', fontWeight: 700, fontSize: 20, lineHeight: 1 }}>+</span>
                  </div>
                </div>
              )
            })}
            <div style={{ fontSize: 14, fontWeight: 700, color: '#333', margin: '5px 0 9px', letterSpacing: '0.02em' }}>🥤 Bebidas</div>
            {(() => {
              const bvgOp = Math.min(1, Math.max(0, spring({ frame: Math.max(0, relFrame(frame, 8) - 18), fps, config: { stiffness: 320, damping: 26 } })))
              const jamaicaAdded = frame >= STEP_STARTS[9]
              return (
                <div style={{ backgroundColor: 'white', borderRadius: 13, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', opacity: bvgOp }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>Agua de Jamaica</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>1L sin azúcar</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginTop: 5 }}>$20.00</div>
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: jamaicaAdded ? C.green : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: jamaicaAdded ? 'white' : '#999', fontWeight: 700, fontSize: 20, lineHeight: 1 }}>+</span>
                  </div>
                </div>
              )
            })()}
          </div>
          {/* Cart bar */}
          {cartCount > 0 && step < 12 && (
            <div style={{ flexShrink: 0, padding: '9px 16px 14px', backgroundColor: '#f8f8f8', transform: `translateY(${cartBarY}px)` }}>
              <div style={{
                backgroundColor: orderTapped ? '#059952' : C.green,
                borderRadius: 16, padding: '15px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(6,193,103,0.38)',
                transform: orderTapped ? 'scale(0.98)' : 'scale(1)',
              }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 9, padding: '4px 11px' }}>
                  <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>{cartCount}</span>
                </div>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>
                  {orderSending ? 'Enviando pedido...' : orderTapped ? 'Confirmando...' : 'Confirmar pedido'}
                </span>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{cartTotal}</span>
              </div>
            </div>
          )}

          {/* Stripe Checkout Sheet overlay */}
          {showPayment && <StripeCheckout frame={frame} fps={fps} />}
        </div>
      )}

      {/* ── Slogan screen ── */}
      {step >= 19 && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: C.dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 32px', opacity: sloganOpacity }}>
          <div style={{ height: 59, position: 'absolute', top: 0, left: 0, right: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: C.green }} />
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em' }}>cEats</span>
          </div>
          <div style={{ transform: `translateY(${sloganY}px)` }}>
            <p style={{ color: 'white', fontSize: 30, fontWeight: 700, lineHeight: 1.25, textAlign: 'center', margin: 0 }}>
              ¿Y tú, ya conoces la nueva forma de tomar pedidos?
            </p>
          </div>
          <div style={{
            height: 3, width: 48, backgroundColor: C.green, borderRadius: 2, marginTop: 24,
            transformOrigin: 'left',
            transform: `scaleX(${Math.min(1, spring({ frame: Math.max(0, relFrame(frame, 19) - 20), fps, config: { stiffness: 220, damping: 26 } }))})`,
          }} />
        </div>
      )}
    </div>
  )
}
