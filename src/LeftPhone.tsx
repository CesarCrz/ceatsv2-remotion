import React from 'react'
import { spring, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, WA_MESSAGES, STEP_STARTS, relFrame, getStep } from './constants'

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

export function LeftPhone() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const step = getStep(frame)

  // ── Screen visibility ──────────────────────────────────────────────────────
  const menuEnterRel = relFrame(frame, 7)
  const menuEnterX = interpolate(
    spring({ frame: menuEnterRel, fps, config: { stiffness: 280, damping: 30 } }),
    [0, 1], [393, 0]
  )
  const menuExitRel = relFrame(frame, 12)
  const menuExitX = interpolate(
    spring({ frame: menuExitRel, fps, config: { stiffness: 300, damping: 30 } }),
    [0, 1], [0, 393]
  )
  const menuX = frame < STEP_STARTS[7] ? 393 : frame < STEP_STARTS[12] ? menuEnterX : menuExitX
  const showMenu = frame >= STEP_STARTS[7]

  const sloganRel = relFrame(frame, 13)
  const sloganOpacity = spring({ frame: sloganRel, fps, config: { stiffness: 180, damping: 26 } })
  const sloganY = interpolate(sloganOpacity, [0, 1], [20, 0])

  // ── WA messages ────────────────────────────────────────────────────────────
  const visibleMessages = WA_MESSAGES.filter(m => frame >= STEP_STARTS[m.visibleAtStep])
  const showTyping = (frame >= STEP_STARTS[2] && frame < STEP_STARTS[3]) ||
                     (frame >= STEP_STARTS[5] && frame < STEP_STARTS[6])

  const confirmRel = relFrame(frame, 12)
  const confirmOpacity = spring({ frame: confirmRel, fps, config: { stiffness: 360, damping: 28 } })
  const confirmY = interpolate(confirmOpacity, [0, 1], [14, 0])

  // ── Menu / cart state ──────────────────────────────────────────────────────
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
        {/* Header */}
        <div style={{ backgroundColor: C.waHeader, flexShrink: 0, padding: '11px 16px 13px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 30, lineHeight: 1 }}>‹</span>
          <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: C.waHeaderLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🍽️</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 17 }}>Tacos El Güero</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 2 }}>
              {step === 12 ? 'pedido recibido ✓' : 'en línea'}
            </div>
          </div>
        </div>
        {/* Messages */}
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

            {/* Typing indicator */}
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

            {/* Confirm message */}
            {step === 12 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', transform: `translateY(${confirmY}px)`, opacity: confirmOpacity }}>
                <div style={{ maxWidth: '82%', backgroundColor: C.waBotBubble, borderRadius: '14px 14px 3px 14px', padding: '9px 12px 6px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: 15, color: '#111', lineHeight: 1.48 }}>
                    ✅ ¡Pedido Confirmado! <strong>#A-047</strong><br />
                    Tu pedido fue registrado exitosamente.<br />
                    Tiempo estimado: <strong>~25 min</strong> 🕐
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
        {/* Input bar */}
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
          {/* Menu */}
          <div style={{ flex: 1, overflowY: 'hidden', backgroundColor: '#f8f8f8', padding: '14px 16px 0' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#333', marginBottom: 9, letterSpacing: '0.02em' }}>🌮 Tacos</div>
            {[
              { name: 'Taco al Pastor', desc: 'Cilantro, cebolla, piña', price: '$22.50', addStep: 8 },
              { name: 'Taco de Bistec', desc: 'Con guacamole y salsa', price: '$25.00', addStep: -1 },
            ].map((item, i) => {
              const itemRel = relFrame(frame, 8) - i * 9
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
          {cartCount > 0 && (
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
        </div>
      )}

      {/* ── Slogan screen ── */}
      {step >= 13 && (
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
            transform: `scaleX(${Math.min(1, spring({ frame: Math.max(0, relFrame(frame, 13) - 20), fps, config: { stiffness: 220, damping: 26 } }))})`,
          }} />
        </div>
      )}
    </div>
  )
}
