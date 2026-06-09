import React from 'react'
import { spring, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { ClipboardList, Bell, CheckCircle, Truck } from 'lucide-react'
import { C, STEP_STARTS, relFrame, getStep } from './constants'

// ── Animated ping dot ─────────────────────────────────────────────────────
function PingDot({ frame }: { frame: number }) {
  // Slower, more organic pulse
  const t = (frame % 80) / 80
  const scale = 1 + Math.sin(t * Math.PI) * 1.8
  const op    = 1 - t
  return (
    <div style={{ position: 'relative', width: 10, height: 10, flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: C.green, transform: `scale(${scale})`, opacity: op * 0.6 }} />
      <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', backgroundColor: C.green }} />
    </div>
  )
}

// ── Notification toast ────────────────────────────────────────────────────
// Uses a 2px left accent border instead of icon background boxes.
function NotifToast({
  icon, title, subtitle, accent, frame, startStep, delay = 0,
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
  const sp  = spring({ frame: rel, fps, config: { stiffness: 280, damping: 28 } })
  const y   = interpolate(sp, [0, 1], [-56, 0])
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      backgroundColor: 'rgba(255,255,255,0.04)',
      // Accent left border — the key visual diff from the old version
      borderLeft: `2px solid ${accent}`,
      borderTop: '1px solid rgba(255,255,255,0.07)',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12, padding: '11px 14px',
      opacity: sp, transform: `translateY(${y}px)`,
    }}>
      <div style={{ flexShrink: 0, opacity: 0.9 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: 'white', fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        <div style={{ color: 'rgba(255,255,255,0.36)', fontSize: 11, marginTop: 2, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</div>
      </div>
      <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: accent, flexShrink: 0 }} />
    </div>
  )
}

// ── KPI card ───────────────────────────────────────────────────────────────
function KpiCard({
  label, value, meta, sp,
}: {
  label: string
  value: React.ReactNode
  meta: React.ReactNode
  sp: number
}) {
  return (
    <div style={{
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 13, padding: '10px 12px',
      opacity: sp,
      transform: `translateY(${interpolate(sp, [0, 1], [14, 0])}px)`,
    }}>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const, marginBottom: 5 }}>{label}</div>
      <div style={{ color: 'white', fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1 }}>{value}</div>
      <div style={{ marginTop: 5 }}>{meta}</div>
    </div>
  )
}

// ── Dashboard view ─────────────────────────────────────────────────────────
function Dashboard({ frame, fps }: { frame: number; fps: number }) {
  const step    = getStep(frame)
  const dashRel = relFrame(frame, 16)

  // Staggered card entrances
  const revSp    = spring({ frame: dashRel,                     fps, config: { stiffness: 190, damping: 26 } })
  const orderSp  = spring({ frame: Math.max(0, dashRel - 12),   fps, config: { stiffness: 190, damping: 26 } })
  const ratingSp = spring({ frame: Math.max(0, dashRel - 24),   fps, config: { stiffness: 190, damping: 26 } })
  const activeSp = spring({ frame: Math.max(0, dashRel - 34),   fps, config: { stiffness: 190, damping: 26 } })

  const showOrderReady = step >= 17
  const showRider      = step >= 18

  const orderReadyRel = relFrame(frame, 17)
  const riderRel      = relFrame(frame, 18)

  // Status badge
  const orderStatus      = step >= 18 ? 'EN CAMINO' : step >= 17 ? 'LISTO' : 'PENDIENTE'
  const orderStatusColor = step >= 18 ? '#60A5FA' : step >= 17 ? C.green : '#FBBF24'
  const orderStatusBg    = step >= 18 ? 'rgba(96,165,250,0.10)' : step >= 17 ? 'rgba(6,193,103,0.10)' : 'rgba(251,191,36,0.09)'
  const orderStatusBd    = step >= 18 ? 'rgba(96,165,250,0.24)' : step >= 17 ? 'rgba(6,193,103,0.24)' : 'rgba(251,191,36,0.24)'

  const statusSp = spring({ frame: step >= 18 ? riderRel : orderReadyRel, fps, config: { stiffness: 420, damping: 26 } })

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* KPI row — revenue hero + stacked (pedidos / rating) */}
      <div style={{ padding: '10px 14px 0', display: 'flex', gap: 9, flexShrink: 0 }}>

        {/* Revenue — hero card */}
        <div style={{
          flex: '0 0 auto', width: 120,
          backgroundColor: 'rgba(6,193,103,0.06)',
          border: '1px solid rgba(6,193,103,0.16)',
          borderRadius: 13, padding: '10px 12px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          opacity: revSp,
          transform: `translateY(${interpolate(revSp, [0, 1], [14, 0])}px)`,
        }}>
          <div style={{ color: 'rgba(6,193,103,0.6)', fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const, marginBottom: 6 }}>Ventas hoy</div>
          <div style={{ color: 'white', fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>$1,840</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 7 }}>
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <path d="M5 1L9 5H6V9H4V5H1L5 1Z" fill={C.green} />
            </svg>
            <span style={{ color: C.green, fontSize: 10, fontWeight: 700 }}>+12% hoy</span>
          </div>
        </div>

        {/* Pedidos + Rating stacked */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <KpiCard
            label="Pedidos"
            value={<span>28</span>}
            meta={
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: C.green }} />
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>4 activos</span>
              </div>
            }
            sp={orderSp}
          />
          <KpiCard
            label="Rating"
            value={<span>4.9</span>}
            meta={
              <div style={{ display: 'flex', gap: 1 }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <svg key={i} width="7" height="7" viewBox="0 0 24 24" fill="#fbbf24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            }
            sp={ratingSp}
          />
        </div>
      </div>

      {/* Section divider */}
      <div style={{ margin: '11px 14px 0', height: 1, backgroundColor: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />

      {/* Active orders label */}
      <div style={{ padding: '9px 14px 7px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, opacity: activeSp }}>
        <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Pedidos activos</span>
        <div style={{ backgroundColor: 'rgba(6,193,103,0.10)', border: '1px solid rgba(6,193,103,0.20)', borderRadius: 20, padding: '2px 8px' }}>
          <span style={{ color: C.green, fontSize: 9, fontWeight: 700 }}>4 activos</span>
        </div>
      </div>

      {/* Order list */}
      <div style={{ flex: 1, padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 7, overflow: 'hidden' }}>

        {/* Highlighted order #A-047 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: `1px solid ${step >= 16 ? 'rgba(6,193,103,0.16)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 13, overflow: 'hidden',
          opacity: activeSp, transform: `translateY(${interpolate(activeSp, [0, 1], [10, 0])}px)`,
          boxShadow: step >= 16 ? '0 0 22px rgba(6,193,103,0.07)' : 'none',
        }}>
          <div style={{ padding: '10px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>Pedido #A-047</div>
              <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, marginTop: 2 }}>Tacos El Guero · WA · Apple Pay</div>
            </div>
            <div style={{
              backgroundColor: orderStatusBg,
              border: `1px solid ${orderStatusBd}`,
              borderRadius: 7, padding: '3px 9px',
              transform: `scale(${statusSp > 0.01 ? interpolate(statusSp, [0, 0.5, 1], [0.88, 1.06, 1]) : 1})`,
            }}>
              <span style={{ color: orderStatusColor, fontSize: 9, fontWeight: 700 }}>{orderStatus}</span>
            </div>
          </div>
          <div style={{ padding: '0 13px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.34)', fontSize: 11 }}>2x Taco al Pastor · 1x Jamaica</span>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>$65</span>
          </div>
        </div>

        {/* Decorative orders */}
        {[
          { id: 'A-046', items: '1x Torta · 2x Refresco', total: '$85', status: 'EN PREP', sc: '#F59E0B', sbg: 'rgba(245,158,11,0.09)', sbd: 'rgba(245,158,11,0.22)', delayF: 10 },
          { id: 'A-045', items: '3x Taco · 1x Agua',     total: '$88', status: 'LISTO',   sc: C.green,   sbg: 'rgba(6,193,103,0.09)',  sbd: 'rgba(6,193,103,0.20)',   delayF: 20 },
        ].map((ord, i) => {
          const sp = spring({ frame: Math.max(0, dashRel - ord.delayF), fps, config: { stiffness: 180, damping: 26 } })
          return (
            <div key={i} style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 12, padding: '9px 13px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [8, 0])}px)`,
            }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: 12 }}>Pedido #{ord.id}</div>
                <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 10, marginTop: 2 }}>{ord.items}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.36)', fontSize: 11 }}>{ord.total}</span>
                <div style={{ backgroundColor: ord.sbg, border: `1px solid ${ord.sbd}`, borderRadius: 7, padding: '2px 7px' }}>
                  <span style={{ color: ord.sc, fontSize: 8, fontWeight: 700 }}>{ord.status}</span>
                </div>
              </div>
            </div>
          )
        })}

        {/* Delivery notifications */}
        {showOrderReady && (
          <NotifToast
            icon={<CheckCircle size={16} color={C.green} strokeWidth={2} />}
            title="Pedido #A-047 listo"
            subtitle="El cliente sera notificado · ~5 min"
            accent={C.green}
            frame={frame}
            startStep={17}
          />
        )}
        {showRider && (
          <NotifToast
            icon={<Truck size={16} color="#60A5FA" strokeWidth={2} />}
            title="Repartidor en camino"
            subtitle="Carlos M. · ETA ~15 min · 4.9"
            accent="#60A5FA"
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

  const incomingRel   = relFrame(frame, 11)
  const flashIntensity = step === 11 ? Math.sin(Math.PI * Math.min(incomingRel, 21) / 21) : 0

  // Persistent low-opacity idle pulse ring
  const idlePulseT = (frame % 120) / 120
  const idlePulseScale = 1 + Math.sin(idlePulseT * Math.PI) * 1.4
  const idlePulseOp   = (1 - idlePulseT) * 0.15

  // Order arrived (steps 12–15)
  const orderRel  = relFrame(frame, 12)
  const bannerOp  = spring({ frame: orderRel, fps, config: { stiffness: 300, damping: 26 } })
  const bannerY   = interpolate(bannerOp, [0, 1], [-40, 0])
  const cardOp    = spring({ frame: Math.max(0, orderRel - 8),  fps, config: { stiffness: 280, damping: 26 } })
  const cardY     = interpolate(cardOp, [0, 1], [14, 0])
  const btnOp     = spring({ frame: Math.max(0, orderRel - 22), fps, config: { stiffness: 260, damping: 24 } })

  const paymentDone = step >= 15
  const acceptedSp  = spring({ frame: relFrame(frame, 15), fps, config: { stiffness: 340, damping: 26 } })

  // Dashboard slides in at step 16
  const dashRel = relFrame(frame, 16)
  const dashSp  = spring({ frame: dashRel, fps, config: { stiffness: 190, damping: 26, mass: 1.2 } })
  const dashY   = interpolate(dashSp, [0, 1], [520, 0])
  const showDash = step >= 16

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: C.dark }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Status bar spacer */}
        <div style={{ height: 59, flexShrink: 0 }} />

        {/* Nav bar */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: step >= 12 ? C.green : flashIntensity > 0.5 ? C.green : 'rgba(255,255,255,0.15)',
              boxShadow: step >= 12 || flashIntensity > 0.5 ? `0 0 8px ${C.green}` : 'none',
            }} />
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em' }}>CEATS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {step >= 16 && (
              <div style={{ backgroundColor: 'rgba(6,193,103,0.08)', border: '1px solid rgba(6,193,103,0.18)', borderRadius: 20, padding: '3px 9px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: C.green }} />
                <span style={{ color: C.green, fontSize: 9, fontWeight: 700 }}>Dashboard</span>
              </div>
            )}
            <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11 }}>8:43 p.m.</span>
          </div>
        </div>

        {/* ── Idle (steps 0–11) ── */}
        {step < 12 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
            {/* Flash overlay on order arrival */}
            {flashIntensity > 0.01 && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(6,193,103,${flashIntensity * 0.07})` }} />
            )}
            {/* Persistent low-opacity pulse ring */}
            {step < 11 && (
              <div style={{ position: 'absolute', width: 72, height: 72, borderRadius: '50%', border: `1px solid rgba(6,193,103,0.28)`, opacity: idlePulseOp, transform: `scale(${idlePulseScale})` }} />
            )}
            {/* Active pulse ring on flash */}
            {flashIntensity > 0.3 && (
              <div style={{ position: 'absolute', width: 72, height: 72, borderRadius: '50%', border: `2px solid ${C.green}`, opacity: 1 - flashIntensity, transform: `scale(${1 + flashIntensity * 0.9})` }} />
            )}
            <div style={{ marginBottom: 14, transform: `scale(${1 + flashIntensity * 0.14})`, zIndex: 1 }}>
              <ClipboardList size={40} color={flashIntensity > 0.5 ? C.green : 'rgba(255,255,255,0.18)'} strokeWidth={1.4} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center' as const, color: flashIntensity > 0.5 ? C.green : 'rgba(255,255,255,0.18)', zIndex: 1 }}>
              {flashIntensity > 0.5 ? '¡Pedido entrante!' : 'Sin pedidos activos'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.12)', fontSize: 11, marginTop: 5, textAlign: 'center' as const, zIndex: 1 }}>
              {flashIntensity > 0.5 ? 'Procesando...' : 'Esperando pedidos via WhatsApp'}
            </div>
          </div>
        )}

        {/* ── Order arrived (steps 12–15) ── */}
        {step >= 12 && step < 16 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Notification banner */}
            <div style={{ margin: '12px 14px 0', backgroundColor: 'rgba(6,193,103,0.08)', border: '1px solid rgba(6,193,103,0.20)', borderRadius: 13, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, opacity: bannerOp, transform: `translateY(${bannerY}px)` }}>
              <PingDot frame={frame} />
              <div style={{ flex: 1 }}>
                <div style={{ color: C.green, fontWeight: 700, fontSize: 13 }}>¡Nuevo pedido!</div>
                <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 10, marginTop: 2 }}>
                  {paymentDone ? 'Pago confirmado · Apple Pay' : 'Recibido ahora · WhatsApp'}
                </div>
              </div>
              <Bell size={18} color={C.green} strokeWidth={1.8} />
            </div>

            {/* Order card */}
            <div style={{ margin: '9px 14px 0', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 13, overflow: 'hidden', flexShrink: 0, opacity: cardOp, transform: `translateY(${cardY}px)` }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>Pedido #A-047</div>
                  <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, marginTop: 2 }}>Tacos El Guero · WhatsApp</div>
                </div>
                <div style={{ backgroundColor: paymentDone ? 'rgba(6,193,103,0.10)' : 'rgba(251,191,36,0.10)', border: `1px solid ${paymentDone ? 'rgba(6,193,103,0.24)' : 'rgba(251,191,36,0.24)'}`, borderRadius: 7, padding: '4px 9px' }}>
                  <span style={{ color: paymentDone ? C.green : '#FBBF24', fontSize: 9, fontWeight: 700 }}>
                    {paymentDone ? 'PAGADO' : 'PENDIENTE'}
                  </span>
                </div>
              </div>
              <div style={{ padding: '10px 14px' }}>
                {[
                  { qty: 2, name: 'Taco al Pastor', price: '$45', delay: 16 },
                  { qty: 1, name: 'Agua de Jamaica', price: '$20', delay: 28 },
                ].map((item, i) => {
                  const iOp = spring({ frame: Math.max(0, orderRel - item.delay), fps, config: { stiffness: 320, damping: 26 } })
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i === 0 ? 7 : 0, opacity: iOp, transform: `translateX(${interpolate(iOp, [0, 1], [-8, 0])}px)` }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ color: C.green, fontSize: 11, fontWeight: 700, minWidth: 20 }}>{item.qty}×</span>
                        <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>{item.name}</span>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.34)', fontSize: 11 }}>{item.price}</span>
                    </div>
                  )
                })}
                {(() => {
                  const totalOp = spring({ frame: Math.max(0, orderRel - 38), fps })
                  return (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', opacity: totalOp }}>
                      <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11 }}>Total</span>
                      <span style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>$65 MXN</span>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Accept button */}
            <div style={{ margin: '10px 14px 0', opacity: btnOp, transform: `translateY(${interpolate(btnOp, [0, 1], [10, 0])}px)` }}>
              {paymentDone ? (
                // Accepted state — green outline
                <div style={{
                  border: `1.5px solid rgba(6,193,103,0.5)`,
                  borderRadius: 12, padding: '12px 18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transform: `scale(${interpolate(acceptedSp, [0, 1], [0.96, 1])})`,
                  opacity: acceptedSp,
                }}>
                  <CheckCircle size={15} color={C.green} strokeWidth={2} />
                  <span style={{ color: C.green, fontWeight: 700, fontSize: 13, letterSpacing: '-0.005em' }}>Pedido aceptado</span>
                </div>
              ) : (
                <div style={{ backgroundColor: C.green, borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 22px rgba(6,193,103,0.28)` }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Aceptar pedido</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Dashboard (steps 16+) ── */}
        {showDash && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 59 + 48, bottom: 0, transform: `translateY(${dashY}px)` }}>
            <Dashboard frame={frame} fps={fps} />
          </div>
        )}
      </div>
    </div>
  )
}
