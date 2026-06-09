import React from 'react'
import { spring, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { ClipboardList, Bell } from 'lucide-react'
import { C, STEP_STARTS, relFrame, getStep } from './constants'

function PingDot({ frame }: { frame: number }) {
  const scale = 1 + (Math.sin(frame * 0.15) * 0.5 + 0.5) * 1.5
  return (
    <div style={{ position: 'relative', width: 10, height: 10, flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: C.green, transform: `scale(${scale})`, opacity: 1 - (scale - 1) / 2 }} />
      <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', backgroundColor: C.green }} />
    </div>
  )
}

export function RightPhone() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const step = getStep(frame)

  const incomingRel = relFrame(frame, 11)
  const flashIntensity = step === 11 ? Math.sin(Math.PI * Math.min(incomingRel, 21) / 21) : 0

  // Order card animations (step 12)
  const orderRel = relFrame(frame, 12)
  const bannerOp = spring({ frame: orderRel, fps, config: { stiffness: 300, damping: 26 } })
  const bannerY = interpolate(bannerOp, [0, 1], [-40, 0])
  const cardOp = spring({ frame: Math.max(0, orderRel - 8), fps, config: { stiffness: 280, damping: 26 } })
  const cardY = interpolate(cardOp, [0, 1], [16, 0])
  const btnOp = spring({ frame: Math.max(0, orderRel - 20), fps, config: { stiffness: 260, damping: 24 } })

  // Slogan
  const sloganRel = relFrame(frame, 13)
  const sloganOp = spring({ frame: Math.max(0, sloganRel - 6), fps, config: { stiffness: 180, damping: 26 } })
  const sloganY = interpolate(sloganOp, [0, 1], [20, 0])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: C.dark }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        {/* DI spacer */}
        <div style={{ height: 59, flexShrink: 0 }} />
        {/* Nav bar */}
        <div style={{ padding: '11px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: step >= 12 ? C.green : flashIntensity > 0.5 ? C.green : 'rgba(255,255,255,0.18)', boxShadow: step >= 12 || flashIntensity > 0.5 ? `0 0 10px ${C.green}` : 'none' }} />
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em' }}>CEATS DASHBOARD</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>8:43 p.m.</span>
        </div>

        {/* Idle state (steps 0-11) */}
        {step < 12 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
            {flashIntensity > 0.01 && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(6,193,103,${flashIntensity * 0.08})`, borderRadius: 4 }} />
            )}
            <div style={{ marginBottom: 16, transform: `scale(${1 + flashIntensity * 0.15})` }}>
              <ClipboardList size={42} color={flashIntensity > 0.5 ? C.green : 'rgba(255,255,255,0.2)'} strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, textAlign: 'center', color: flashIntensity > 0.5 ? C.green : 'rgba(255,255,255,0.2)' }}>
              {flashIntensity > 0.5 ? '¡Pedido entrante!' : 'Sin pedidos activos'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.12)', fontSize: 12, marginTop: 5, textAlign: 'center' }}>
              {flashIntensity > 0.5 ? 'Procesando...' : 'Esperando pedidos vía WhatsApp'}
            </div>
            {flashIntensity > 0.3 && (
              <div style={{ position: 'absolute', width: 70, height: 70, borderRadius: '50%', border: `2px solid ${C.green}`, opacity: 1 - flashIntensity, transform: `scale(${1 + flashIntensity})` }} />
            )}
          </div>
        )}

        {/* Order arrived (step 12+) */}
        {step >= 12 && step < 13 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Notification banner */}
            <div style={{ margin: '12px 16px 0', backgroundColor: 'rgba(6,193,103,0.1)', border: '1px solid rgba(6,193,103,0.22)', borderRadius: 13, padding: '12px 15px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, opacity: bannerOp, transform: `translateY(${bannerY}px)` }}>
              <PingDot frame={frame} />
              <div style={{ flex: 1 }}>
                <div style={{ color: C.green, fontWeight: 700, fontSize: 15 }}>¡Nuevo pedido!</div>
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 2 }}>Recibido ahora · WhatsApp</div>
              </div>
              <Bell size={22} color={C.green} strokeWidth={1.8} />
            </div>

            {/* Order card */}
            <div style={{ margin: '10px 16px 0', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 15, overflow: 'hidden', flexShrink: 0, opacity: cardOp, transform: `translateY(${cardY}px)` }}>
              <div style={{ padding: '12px 15px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Pedido #A-047</div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 2 }}>Tacos El Güero · WA</div>
                </div>
                <div style={{ backgroundColor: 'rgba(251,191,36,0.13)', border: '1px solid rgba(251,191,36,0.28)', borderRadius: 8, padding: '4px 11px' }}>
                  <span style={{ color: '#fbbf24', fontSize: 11, fontWeight: 700 }}>PENDIENTE</span>
                </div>
              </div>
              <div style={{ padding: '12px 15px' }}>
                {[
                  { qty: 2, name: 'Taco al Pastor', price: '$45', delay: 18 },
                  { qty: 1, name: 'Agua de Jamaica', price: '$20', delay: 28 },
                ].map((item, i) => {
                  const iOp = spring({ frame: Math.max(0, orderRel - item.delay), fps, config: { stiffness: 320, damping: 26 } })
                  const iX = interpolate(iOp, [0, 1], [-10, 0])
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i === 0 ? 8 : 0, opacity: iOp, transform: `translateX(${iX}px)` }}>
                      <div style={{ display: 'flex', gap: 9 }}>
                        <span style={{ color: C.green, fontSize: 13, fontWeight: 700, minWidth: 24 }}>{item.qty}×</span>
                        <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14 }}>{item.name}</span>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{item.price}</span>
                    </div>
                  )
                })}
                {(() => {
                  const totalOp = spring({ frame: Math.max(0, orderRel - 40), fps })
                  return (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', opacity: totalOp }}>
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Total</span>
                      <span style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>$65 MXN</span>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Accept button */}
            <div style={{ padding: '10px 16px 0', flexShrink: 0, opacity: btnOp }}>
              <div style={{ backgroundColor: C.green, borderRadius: 14, padding: '14px', textAlign: 'center', boxShadow: '0 4px 22px rgba(6,193,103,0.38)' }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Aceptar pedido</span>
              </div>
            </div>
            <div style={{ marginTop: 'auto', padding: '12px', textAlign: 'center', flexShrink: 0 }}>
              <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 11 }}>Powered by cEats</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Slogan ── */}
      {step >= 13 && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: C.dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 32px', opacity: sloganOp }}>
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
            height: 3, width: 48, backgroundColor: C.green, borderRadius: 2, marginTop: 24, transformOrigin: 'left',
            transform: `scaleX(${Math.min(1, spring({ frame: Math.max(0, sloganRel - 26), fps, config: { stiffness: 220, damping: 26 } }))})`,
          }} />
        </div>
      )}
    </div>
  )
}
