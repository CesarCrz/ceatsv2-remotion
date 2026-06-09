import React from 'react'
import { spring, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { ClipboardList, Bell, CheckCircle, Truck } from 'lucide-react'
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

// ── Notification toast ────────────────────────────────────────────────────
function NotifToast({
  icon, title, subtitle, accent,
  frame, startStep, delay = 0,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  accent: string
  frame: number
  startStep: number
  delay?: number
}) {
  const { fps } = useVideoConfig()
  const rel = Math.max(0, relFrame(frame, startStep) - delay)
  const sp = spring({ frame: rel, fps, config: { stiffness: 260, damping: 26 } })
  const y = interpolate(sp, [0, 1], [-60, 0])
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      backgroundColor: 'rgba(255,255,255,0.06)',
      border: `1px solid ${accent}40`,
      borderRadius: 14, padding: '12px 14px',
      opacity: sp, transform: `translateY(${y}px)`,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${accent}30` }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: 'white', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>{title}</div>
        <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 2 }}>{subtitle}</div>
      </div>
      <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: accent, flexShrink: 0 }} />
    </div>
  )
}

// ── Dashboard view ────────────────────────────────────────────────────────
function Dashboard({ frame, fps }: { frame: number; fps: number }) {
  const step = getStep(frame)
  const dashRel = relFrame(frame, 16)

  // Revenue card
  const revSp = spring({ frame: dashRel, fps, config: { stiffness: 200, damping: 26 } })
  // Order count
  const orderSp = spring({ frame: Math.max(0, dashRel - 14), fps, config: { stiffness: 200, damping: 26 } })
  // Active orders
  const activeSp = spring({ frame: Math.max(0, dashRel - 28), fps, config: { stiffness: 200, damping: 26 } })

  const showOrderReady = step >= 17
  const showRider = step >= 18

  const orderReadyRel = relFrame(frame, 17)
  const riderRel = relFrame(frame, 18)

  // Status badge for the order row
  const orderStatus = step >= 18 ? 'EN CAMINO' : step >= 17 ? 'LISTO' : 'PENDIENTE'
  const orderStatusColor = step >= 18 ? '#3B82F6' : step >= 17 ? C.green : '#fbbf24'
  const orderStatusBg = step >= 18 ? 'rgba(59,130,246,0.12)' : step >= 17 ? 'rgba(6,193,103,0.12)' : 'rgba(251,191,36,0.1)'
  const orderStatusBorder = step >= 18 ? 'rgba(59,130,246,0.28)' : step >= 17 ? 'rgba(6,193,103,0.28)' : 'rgba(251,191,36,0.28)'

  const statusChangeSp = spring({ frame: step >= 18 ? riderRel : orderReadyRel, fps, config: { stiffness: 400, damping: 26 } })

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* KPI row */}
      <div style={{ padding: '10px 14px 0', display: 'flex', gap: 9, flexShrink: 0 }}>
        {/* Revenue */}
        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 13, padding: '10px 12px', opacity: revSp, transform: `translateY(${interpolate(revSp, [0, 1], [16, 0])}px)` }}>
          <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 4 }}>Ventas hoy</div>
          <div style={{ color: 'white', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>$1,840</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1L9 5H6V9H4V5H1L5 1Z" fill={C.green} />
            </svg>
            <span style={{ color: C.green, fontSize: 10, fontWeight: 700 }}>+12%</span>
          </div>
        </div>
        {/* Orders */}
        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 13, padding: '10px 12px', opacity: orderSp, transform: `translateY(${interpolate(orderSp, [0, 1], [16, 0])}px)` }}>
          <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 4 }}>Pedidos</div>
          <div style={{ color: 'white', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>28</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: C.green }} />
            <span style={{ color: 'rgba(255,255,255,0.32)', fontSize: 10 }}>4 activos</span>
          </div>
        </div>
        {/* Rating */}
        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 13, padding: '10px 12px', opacity: activeSp, transform: `translateY(${interpolate(activeSp, [0, 1], [16, 0])}px)` }}>
          <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 4 }}>Rating</div>
          <div style={{ color: 'white', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>4.9</div>
          <div style={{ display: 'flex', gap: 1, marginTop: 3 }}>
            {[0, 1, 2, 3, 4].map(i => (
              <svg key={i} width="8" height="8" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ margin: '12px 14px 0', height: 1, backgroundColor: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />

      {/* Active orders label */}
      <div style={{ padding: '10px 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, opacity: activeSp }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Pedidos activos</span>
        <div style={{ backgroundColor: 'rgba(6,193,103,0.12)', border: '1px solid rgba(6,193,103,0.22)', borderRadius: 20, padding: '2px 8px' }}>
          <span style={{ color: C.green, fontSize: 10, fontWeight: 700 }}>4 activos</span>
        </div>
      </div>

      {/* Order list */}
      <div style={{ flex: 1, padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>

        {/* Main order A-047 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: `1px solid ${step >= 16 ? 'rgba(6,193,103,0.18)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 14, overflow: 'hidden',
          opacity: activeSp, transform: `translateY(${interpolate(activeSp, [0, 1], [12, 0])}px)`,
          boxShadow: step >= 16 ? '0 0 24px rgba(6,193,103,0.08)' : 'none',
        }}>
          <div style={{ padding: '11px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Pedido #A-047</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2 }}>Tacos El Güero · WA · Apple Pay</div>
            </div>
            <div style={{
              backgroundColor: orderStatusBg,
              border: `1px solid ${orderStatusBorder}`,
              borderRadius: 8, padding: '4px 10px',
              transform: `scale(${statusChangeSp > 0.01 ? interpolate(statusChangeSp, [0, 0.5, 1], [0.9, 1.05, 1]) : 1})`,
            }}>
              <span style={{ color: orderStatusColor, fontSize: 10, fontWeight: 700 }}>{orderStatus}</span>
            </div>
          </div>
          <div style={{ padding: '0 13px 11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>2× Taco al Pastor · 1× Jamaica</span>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>$65</span>
            </div>
          </div>
        </div>

        {/* Other orders (decorative) */}
        {[
          { id: 'A-046', items: '1× Torta · 2× Refresco', total: '$85', status: 'EN PREP', statusColor: '#f59e0b', statusBg: 'rgba(245,158,11,0.1)', statusBorder: 'rgba(245,158,11,0.25)', delayF: 12 },
          { id: 'A-045', items: '3× Taco · 1× Agua', total: '$88', status: 'LISTO', statusColor: C.green, statusBg: 'rgba(6,193,103,0.1)', statusBorder: 'rgba(6,193,103,0.22)', delayF: 22 },
        ].map((ord, i) => {
          const sp = spring({ frame: Math.max(0, dashRel - ord.delayF), fps, config: { stiffness: 180, damping: 26 } })
          return (
            <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 13, padding: '10px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [10, 0])}px)` }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 13 }}>Pedido #{ord.id}</div>
                <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 2 }}>{ord.items}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{ord.total}</span>
                <div style={{ backgroundColor: ord.statusBg, border: `1px solid ${ord.statusBorder}`, borderRadius: 7, padding: '3px 8px' }}>
                  <span style={{ color: ord.statusColor, fontSize: 9, fontWeight: 700 }}>{ord.status}</span>
                </div>
              </div>
            </div>
          )
        })}

        {/* Delivery notifications */}
        {showOrderReady && (
          <NotifToast
            icon={<CheckCircle size={18} color={C.green} strokeWidth={2} />}
            title="Pedido #A-047 listo"
            subtitle="El cliente sera notificado · ~5 min"
            accent={C.green}
            frame={frame}
            startStep={17}
          />
        )}

        {showRider && (
          <NotifToast
            icon={<Truck size={18} color="#3B82F6" strokeWidth={2} />}
            title="Repartidor en camino"
            subtitle="Carlos M. · ETA ~15 min · ⭐ 4.9"
            accent="#3B82F6"
            frame={frame}
            startStep={18}
          />
        )}
      </div>
    </div>
  )
}

// ── Main RightPhone ───────────────────────────────────────────────────────
export function RightPhone() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const step = getStep(frame)

  const incomingRel = relFrame(frame, 11)
  const flashIntensity = step === 11 ? Math.sin(Math.PI * Math.min(incomingRel, 21) / 21) : 0

  // Order arrived (steps 12–15): show the incoming order + accept button
  const orderRel = relFrame(frame, 12)
  const bannerOp = spring({ frame: orderRel, fps, config: { stiffness: 300, damping: 26 } })
  const bannerY = interpolate(bannerOp, [0, 1], [-40, 0])
  const cardOp = spring({ frame: Math.max(0, orderRel - 8), fps, config: { stiffness: 280, damping: 26 } })
  const cardY = interpolate(cardOp, [0, 1], [16, 0])
  const btnOp = spring({ frame: Math.max(0, orderRel - 20), fps, config: { stiffness: 260, damping: 24 } })

  // Accept button becomes "Accepted" at step 15 (payment confirmed)
  const paymentDone = step >= 15
  const acceptedSp = spring({ frame: relFrame(frame, 15), fps, config: { stiffness: 320, damping: 26 } })

  // Dashboard slides in at step 16
  const dashRel = relFrame(frame, 16)
  const dashSp = spring({ frame: dashRel, fps, config: { stiffness: 200, damping: 26 } })
  const dashY = interpolate(dashSp, [0, 1], [500, 0])
  const showDash = step >= 16

  // Slogan
  const sloganRel = relFrame(frame, 19)
  const sloganOp = spring({ frame: Math.max(0, sloganRel - 6), fps, config: { stiffness: 180, damping: 26 } })
  const sloganY = interpolate(sloganOp, [0, 1], [20, 0])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: C.dark }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>

        {/* DI spacer */}
        <div style={{ height: 59, flexShrink: 0 }} />

        {/* Nav bar */}
        <div style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              backgroundColor: step >= 12 ? C.green : flashIntensity > 0.5 ? C.green : 'rgba(255,255,255,0.18)',
              boxShadow: step >= 12 || flashIntensity > 0.5 ? `0 0 10px ${C.green}` : 'none',
            }} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em' }}>CEATS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {step >= 16 && (
              <div style={{ backgroundColor: 'rgba(6,193,103,0.1)', border: '1px solid rgba(6,193,103,0.2)', borderRadius: 20, padding: '3px 9px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: C.green }} />
                <span style={{ color: C.green, fontSize: 10, fontWeight: 700 }}>Dashboard</span>
              </div>
            )}
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>8:43 p.m.</span>
          </div>
        </div>

        {/* ── Idle state (steps 0–11) ── */}
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

        {/* ── Order arrived: steps 12–15 ── */}
        {step >= 12 && step < 16 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Notification banner */}
            <div style={{ margin: '12px 14px 0', backgroundColor: 'rgba(6,193,103,0.1)', border: '1px solid rgba(6,193,103,0.22)', borderRadius: 13, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 11, flexShrink: 0, opacity: bannerOp, transform: `translateY(${bannerY}px)` }}>
              <PingDot frame={frame} />
              <div style={{ flex: 1 }}>
                <div style={{ color: C.green, fontWeight: 700, fontSize: 14 }}>¡Nuevo pedido!</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>
                  {paymentDone ? 'Pago confirmado · Apple Pay' : 'Recibido ahora · WhatsApp'}
                </div>
              </div>
              <Bell size={20} color={C.green} strokeWidth={1.8} />
            </div>

            {/* Order card */}
            <div style={{ margin: '10px 14px 0', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden', flexShrink: 0, opacity: cardOp, transform: `translateY(${cardY}px)` }}>
              <div style={{ padding: '11px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Pedido #A-047</div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2 }}>Tacos El Güero · WA</div>
                </div>
                <div style={{ backgroundColor: paymentDone ? 'rgba(6,193,103,0.12)' : 'rgba(251,191,36,0.13)', border: `1px solid ${paymentDone ? 'rgba(6,193,103,0.28)' : 'rgba(251,191,36,0.28)'}`, borderRadius: 8, padding: '4px 10px' }}>
                  <span style={{ color: paymentDone ? C.green : '#fbbf24', fontSize: 10, fontWeight: 700 }}>
                    {paymentDone ? 'PAGADO' : 'PENDIENTE'}
                  </span>
                </div>
              </div>
              <div style={{ padding: '11px 14px' }}>
                {[
                  { qty: 2, name: 'Taco al Pastor', price: '$45', delay: 18 },
                  { qty: 1, name: 'Agua de Jamaica', price: '$20', delay: 28 },
                ].map((item, i) => {
                  const iOp = spring({ frame: Math.max(0, orderRel - item.delay), fps, config: { stiffness: 320, damping: 26 } })
                  const iX = interpolate(iOp, [0, 1], [-10, 0])
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i === 0 ? 7 : 0, opacity: iOp, transform: `translateX(${iX}px)` }}>
                      <div style={{ display: 'flex', gap: 9 }}>
                        <span style={{ color: C.green, fontSize: 12, fontWeight: 700, minWidth: 22 }}>{item.qty}×</span>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{item.name}</span>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>{item.price}</span>
                    </div>
                  )
                })}
                {(() => {
                  const totalOp = spring({ frame: Math.max(0, orderRel - 40), fps })
                  return (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 9, paddingTop: 9, display: 'flex', justifyContent: 'space-between', opacity: totalOp }}>
                      <span style={{ color: 'rgba(255,255,255,0.32)', fontSize: 12 }}>Total</span>
                      <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>$65 MXN</span>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Accept / Accepted button */}
            <div style={{ padding: '10px 14px 0', flexShrink: 0, opacity: btnOp }}>
              <div style={{
                backgroundColor: paymentDone ? 'rgba(6,193,103,0.1)' : C.green,
                border: paymentDone ? `1.5px solid ${C.green}` : 'none',
                borderRadius: 13, padding: '13px',
                textAlign: 'center' as const,
                boxShadow: paymentDone ? 'none' : '0 4px 22px rgba(6,193,103,0.38)',
                transform: `scale(${paymentDone ? interpolate(acceptedSp, [0, 1], [0.96, 1]) : 1})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {paymentDone && <CheckCircle size={16} color={C.green} strokeWidth={2.5} />}
                <span style={{ color: paymentDone ? C.green : 'white', fontWeight: 700, fontSize: 15 }}>
                  {paymentDone ? 'Pedido aceptado' : 'Aceptar pedido'}
                </span>
              </div>
            </div>
            <div style={{ marginTop: 'auto', padding: '10px', textAlign: 'center' as const, flexShrink: 0 }}>
              <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 11 }}>Powered by cEats</span>
            </div>
          </div>
        )}

        {/* ── Full dashboard: step 16+ ── */}
        {showDash && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 59 + 44, bottom: 0, transform: `translateY(${dashY}px)` }}>
            <Dashboard frame={frame} fps={fps} />
          </div>
        )}
      </div>

      {/* ── Slogan ── */}
      {step >= 19 && (
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
