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

// Typing dots — smooth sine wave
function TypingDot({ index, frame }: { index: number; frame: number }) {
  const phase = (frame * 0.26) + index * (Math.PI * 2 / 3)
  return (
    <div style={{
      width: 7, height: 7, borderRadius: '50%', backgroundColor: '#94a3b8',
      transform: `translateY(${Math.sin(phase) * 3.5 - 1}px)`,
      opacity: 0.3 + 0.7 * ((Math.sin(phase) + 1) / 2),
    }} />
  )
}

// ── SVG check draw-in ─────────────────────────────────────────────────────
function CheckDrawIn({ progress }: { progress: number }) {
  const pathLen = 18
  const dashOffset = pathLen * (1 - Math.min(1, progress))
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ overflow: 'visible' }}>
      <path
        d="M5 13L9 17L19 7"
        stroke={C.green}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLen + 2}
        strokeDashoffset={dashOffset}
      />
    </svg>
  )
}

// ── Address screen (step 11) ──────────────────────────────────────────────
// Mimics a Google Maps delivery address picker.
function AddressScreen({ frame, fps }: { frame: number; fps: number }) {
  const step    = getStep(frame)
  const addrRel = relFrame(frame, 11)

  // Pin drop animation — starts at 0, springs down to rest
  const pinSp    = spring({ frame: Math.max(0, addrRel - 10), fps, config: { stiffness: 240, damping: 16, mass: 0.9 } })
  const pinY     = interpolate(pinSp, [0, 1], [-28, 0])
  const pinScale = interpolate(pinSp, [0, 1], [0.6, 1])

  // Shadow under pin — squishes as pin falls
  const shadowScale = interpolate(pinSp, [0, 1], [0.2, 1])

  // Address row slides up after pin settles
  const addrCardSp = spring({ frame: Math.max(0, addrRel - 22), fps, config: { stiffness: 260, damping: 26 } })

  // "Confirmar dirección" button fades in last
  const btnSp   = spring({ frame: Math.max(0, addrRel - 38), fps, config: { stiffness: 240, damping: 24 } })

  // Confirm tap — triggered near end of step 11
  const confirmTapRel = Math.max(0, relFrame(frame, 11) - 66)
  const confirmTapSp  = spring({ frame: confirmTapRel, fps, config: { stiffness: 480, damping: 28 } })
  const btnPressed    = step >= 12 || confirmTapRel > 0
  const btnScale      = btnPressed ? interpolate(confirmTapSp, [0, 1], [0.95, 1]) : 1

  // Map dots — simulate static map tiles
  const mapRows = 6
  const mapCols = 8

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      backgroundColor: '#F5F5F5',
    }}>
      {/* Status bar */}
      <div style={{ height: 59, flexShrink: 0, backgroundColor: '#1C1C1E' }} />

      {/* Navigation header */}
      <div style={{
        backgroundColor: 'white',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0,
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}>
        <span style={{ color: C.green, fontSize: 20, fontWeight: 400 }}>‹</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>
            Dirección de entrega
          </div>
          <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)', marginTop: 1 }}>
            Mueve el mapa para ajustar
          </div>
        </div>
      </div>

      {/* Map area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Simulated map tiles — subtle grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: '#E8EAE0' }}>
          {/* Street grid lines */}
          {Array.from({ length: mapRows }).map((_, r) => (
            <div key={r} style={{
              position: 'absolute',
              left: 0, right: 0,
              top: `${(r + 1) * (100 / (mapRows + 1))}%`,
              height: 1,
              backgroundColor: 'rgba(255,255,255,0.7)',
            }} />
          ))}
          {Array.from({ length: mapCols }).map((_, c) => (
            <div key={c} style={{
              position: 'absolute',
              top: 0, bottom: 0,
              left: `${(c + 1) * (100 / (mapCols + 1))}%`,
              width: 1,
              backgroundColor: 'rgba(255,255,255,0.7)',
            }} />
          ))}
          {/* Block fills */}
          {[
            { t: 12, l: 14, w: 22, h: 18, c: '#D5D8CE' },
            { t: 36, l: 60, w: 28, h: 20, c: '#D5D8CE' },
            { t: 58, l: 10, w: 34, h: 16, c: '#D5D8CE' },
            { t: 20, l: 38, w: 16, h: 24, c: '#D5D8CE' },
            { t: 70, l: 50, w: 20, h: 18, c: '#C8E6C9' }, // green = park
          ].map((b, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: `${b.t}%`, left: `${b.l}%`,
              width: `${b.w}%`, height: `${b.h}%`,
              backgroundColor: b.c,
              borderRadius: 2,
            }} />
          ))}
          {/* A slightly thicker road for realism */}
          <div style={{ position: 'absolute', top: '47%', left: 0, right: 0, height: 6, backgroundColor: 'rgba(255,255,255,0.85)' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '47%', width: 6, backgroundColor: 'rgba(255,255,255,0.85)' }} />
        </div>

        {/* Semi-transparent overlay rings — crosshair hint */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -70%)',
          width: 60, height: 60,
          borderRadius: '50%',
          border: '1px solid rgba(6,193,103,0.18)',
          pointerEvents: 'none',
        }} />

        {/* Pin */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: `translate(-50%, calc(-100% + ${pinY}px)) scale(${pinScale})`,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          pointerEvents: 'none',
        }}>
          {/* Pin head */}
          <div style={{
            width: 36, height: 36, borderRadius: '50% 50% 50% 0',
            backgroundColor: C.green,
            transform: 'rotate(-45deg)',
            boxShadow: `0 4px 18px rgba(6,193,103,0.5)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 13, height: 13,
              borderRadius: '50%',
              backgroundColor: 'white',
              transform: 'rotate(45deg)',
            }} />
          </div>
          {/* Pin tail */}
          <div style={{ width: 2, height: 8, backgroundColor: C.green, marginTop: -1 }} />
          {/* Shadow */}
          <div style={{
            width: 16, height: 5,
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.18)',
            transform: `scaleX(${shadowScale})`,
            marginTop: 2,
          }} />
        </div>
      </div>

      {/* Bottom sheet */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '18px 18px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
        padding: '14px 18px 18px',
        flexShrink: 0,
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 34, height: 4, backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: 2 }} />
        </div>

        {/* Address row */}
        <div style={{
          opacity: addrCardSp,
          transform: `translateY(${interpolate(addrCardSp, [0, 1], [10, 0])}px)`,
          display: 'flex', alignItems: 'flex-start', gap: 12,
          marginBottom: 14,
        }}>
          {/* Location icon */}
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            backgroundColor: 'rgba(6,193,103,0.10)',
            border: '1px solid rgba(6,193,103,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill={C.green} />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>
              Calle Independencia 742
            </div>
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)', marginTop: 2, lineHeight: 1.4 }}>
              Col. Centro, Tlaquepaque, Jalisco
            </div>
          </div>
          {/* Edit icon */}
          <div style={{ opacity: 0.35 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#111" strokeWidth="2" strokeLinecap="round" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#111" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Confirm button */}
        <div style={{
          opacity: btnSp,
          transform: `translateY(${interpolate(btnSp, [0, 1], [8, 0])}px) scale(${btnScale})`,
        }}>
          <div style={{
            backgroundColor: btnPressed ? '#04a054' : C.green,
            borderRadius: 14,
            padding: '14px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: `0 6px 24px rgba(6,193,103,0.32)`,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 12V22H4V12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 7H2v5h20V7z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>
              {btnPressed ? 'Dirección confirmada' : 'Confirmar dirección'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Stripe checkout sheet (step 13+) ─────────────────────────────────────
function StripeCheckout({ frame, fps }: { frame: number; fps: number }) {
  const step = getStep(frame)
  // Step 13: confirm/sheet slides in
  const sheetRel = relFrame(frame, 13)

  const sheetSp = spring({ frame: sheetRel, fps, config: { stiffness: 200, damping: 28, mass: 1.2 } })
  const sheetY  = interpolate(sheetSp, [0, 1], [520, 0])

  const applePayTapped = step >= 15
  const paymentSuccess = step >= 16

  const applePayRel   = relFrame(frame, 15)
  const applePressSp  = spring({ frame: applePayRel, fps, config: { stiffness: 420, damping: 30 } })
  const applePressScale = applePayTapped ? interpolate(applePressSp, [0, 1], [0.95, 1]) : 1

  const successRel     = relFrame(frame, 16)
  const successSp      = spring({ frame: successRel, fps, config: { stiffness: 240, damping: 26 } })
  const checkProgress  = spring({ frame: Math.max(0, successRel - 6), fps, config: { stiffness: 480, damping: 28 } })
  const ringScale      = spring({ frame: Math.max(0, successRel - 2), fps, config: { stiffness: 300, damping: 24 } })
  const receiptSp      = spring({ frame: Math.max(0, successRel - 22), fps, config: { stiffness: 220, damping: 24 } })

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.52)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      {/* Sheet */}
      <div style={{
        transform: `translateY(${sheetY}px)`,
        backgroundColor: '#F5F7FA',
        borderRadius: '22px 22px 0 0',
        overflow: 'hidden',
        boxShadow: '0 -12px 48px rgba(0,0,0,0.22)',
        paddingBottom: 32,
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 13, paddingBottom: 6 }}>
          <div style={{ width: 34, height: 4, backgroundColor: 'rgba(0,0,0,0.16)', borderRadius: 2 }} />
        </div>

        {/* Stripe header */}
        <div style={{ padding: '5px 20px 14px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M5.48 4.68C5.48 4.14 5.94 3.92 6.72 3.92C7.84 3.92 9.24 4.26 10.36 4.88V1.84C9.12 1.36 7.9 1.16 6.72 1.16C3.96 1.16 2.12 2.56 2.12 4.84C2.12 8.42 7.08 7.88 7.08 9.46C7.08 10.1 6.52 10.32 5.7 10.32C4.46 10.32 2.84 9.82 1.6 9.1V12.18C2.96 12.72 4.32 12.96 5.7 12.96C8.52 12.96 10.46 11.6 10.46 9.3C10.44 5.44 5.48 6.1 5.48 4.68Z" fill="white" />
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0F0F14', letterSpacing: '-0.01em' }}>stripe</span>
              <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.28)', fontWeight: 500, marginLeft: 1 }}>· checkout seguro</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: C.green }} />
              <span style={{ fontSize: 10, color: C.green, fontWeight: 600 }}>Encriptado</span>
            </div>
          </div>

          {/* Order summary */}
          <div style={{ marginTop: 13, backgroundColor: 'white', borderRadius: 12, padding: '11px 14px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.36)', fontWeight: 700, marginBottom: 8, letterSpacing: '0.07em', textTransform: 'uppercase' as const }}>Tacos El Guero</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 13, color: '#111', fontWeight: 500 }}>2x Taco al Pastor</span>
                <span style={{ fontSize: 13, color: '#111', fontWeight: 500 }}>1x Agua de Jamaica</span>
              </div>
              <div style={{ textAlign: 'right' as const }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.04em' }}>$65</div>
                <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.34)', fontWeight: 500 }}>MXN</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment section */}
        <div style={{ padding: '15px 20px 0' }}>
          {/* Apple Pay */}
          <div style={{
            backgroundColor: applePayTapped ? '#2a2a2a' : '#000',
            borderRadius: 14,
            padding: '13px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            transform: `scale(${applePressScale})`,
            boxShadow: applePayTapped ? 'none' : '0 4px 20px rgba(0,0,0,0.22)',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <span style={{ color: 'white', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>
              {applePayTapped ? 'Procesando...' : 'Pay'}
            </span>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '11px 0' }}>
            <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.09)' }} />
            <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.28)', fontWeight: 600 }}>o paga con tarjeta</span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.09)' }} />
          </div>

          {/* Card field */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: 11,
            border: '1.5px solid rgba(99,91,255,0.28)',
            padding: '11px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 0, position: 'relative' as const }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#eb001b' }} />
                <div style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#f79e1b', marginLeft: -4 }} />
              </div>
              <span style={{ fontSize: 12, color: '#aaa', letterSpacing: '0.1em' }}>{'•••• •••• •••• ••••'}</span>
            </div>
            <span style={{ fontSize: 10, color: '#ccc' }}>MM/AA</span>
          </div>

          {/* Trust row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg width="9" height="11" viewBox="0 0 10 12" fill="none">
              <path d="M5 0L0 2V6C0 8.76 2.24 11.35 5 12C7.76 11.35 10 8.76 10 6V2L5 0Z" fill="rgba(0,0,0,0.22)" />
            </svg>
            <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.26)', fontWeight: 500 }}>Powered by Stripe · Pago 100% seguro</span>
          </div>
        </div>
      </div>

      {/* Payment success overlay */}
      {paymentSuccess && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: '#06080B',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 22, opacity: successSp,
        }}>
          {/* Animated check ring */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            backgroundColor: 'rgba(6,193,103,0.10)',
            border: `1.5px solid ${C.green}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${interpolate(ringScale, [0, 1], [0.72, 1])})`,
            boxShadow: `0 0 36px rgba(6,193,103,0.22)`,
          }}>
            <CheckDrawIn progress={checkProgress} />
          </div>
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ color: 'white', fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em' }}>
              Pago confirmado
            </div>
            <div style={{ color: 'rgba(255,255,255,0.34)', fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
              Tu pedido fue enviado al restaurante
            </div>
          </div>
          {/* Receipt chip */}
          <div style={{
            backgroundColor: 'rgba(6,193,103,0.07)',
            border: `1px solid rgba(6,193,103,0.22)`,
            borderRadius: 12, padding: '10px 18px',
            display: 'flex', alignItems: 'center', gap: 10,
            opacity: receiptSp,
            transform: `translateY(${interpolate(receiptSp, [0, 1], [10, 0])}px)`,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke={C.green} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div>
              <div style={{ color: C.green, fontSize: 12, fontWeight: 700 }}>Pedido #A-047 · $65 MXN</div>
              <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, marginTop: 1 }}>Apple Pay · Visa ••4242</div>
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

  // Menu enter — slides in from right at step 7
  const menuEnterRel = relFrame(frame, 7)
  const menuEnterX = interpolate(
    spring({ frame: menuEnterRel, fps, config: { stiffness: 260, damping: 30 } }),
    [0, 1], [393, 0]
  )
  // Menu exit — slides out at step 20
  const menuExitRel = relFrame(frame, 20)
  const menuExitX = interpolate(
    spring({ frame: menuExitRel, fps, config: { stiffness: 300, damping: 30 } }),
    [0, 1], [0, 393]
  )
  const menuX    = frame < STEP_STARTS[7] ? 393 : frame < STEP_STARTS[20] ? menuEnterX : menuExitX
  const showMenu = frame >= STEP_STARTS[7]

  // Address screen: visible at step 11 (slides in from right over menu)
  const showAddress = step >= 11 && step < 13
  const addrSlideRel = relFrame(frame, 11)
  const addrSlideX = interpolate(
    spring({ frame: addrSlideRel, fps, config: { stiffness: 280, damping: 30 } }),
    [0, 1], [393, 0]
  )

  // Payment sheet: step 13+
  const showPayment = step >= 13 && step < 20

  // WA chat messages
  const visibleMessages = WA_MESSAGES.filter(m => frame >= STEP_STARTS[m.visibleAtStep])
  const showTyping = (frame >= STEP_STARTS[2] && frame < STEP_STARTS[3]) ||
                     (frame >= STEP_STARTS[5] && frame < STEP_STARTS[6])

  // Confirm message appears at step 13 (was 12)
  const confirmRel = relFrame(frame, 13)
  const confirmOp  = spring({ frame: confirmRel, fps, config: { stiffness: 340, damping: 28 } })
  const confirmY   = interpolate(confirmOp, [0, 1], [14, 0])

  // Cart bar
  const cartCount = frame >= STEP_STARTS[9] ? 2 : frame >= STEP_STARTS[8] ? 1 : 0
  const cartTotal = cartCount === 2 ? '$65 MXN' : '$45 MXN'
  const cartBarRel = relFrame(frame, 8)
  const cartBarY = interpolate(
    spring({ frame: cartBarRel, fps, config: { stiffness: 380, damping: 22 } }),
    [0, 1], [80, 0]
  )
  const orderTapped  = frame >= STEP_STARTS[10]
  const orderSending = frame >= STEP_STARTS[12]  // connection step

  // "+" button rotation when second item added (step 9)
  const plusRel    = relFrame(frame, 9)
  const plusRotate = interpolate(
    spring({ frame: plusRel, fps, config: { stiffness: 500, damping: 24 } }),
    [0, 1], [0, 45]
  )

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: C.waBg }}>

      {/* ── WhatsApp screen ── */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Status bar spacer */}
        <div style={{ height: 59, flexShrink: 0, backgroundColor: C.waHeader }} />
        {/* WA header */}
        <div style={{ backgroundColor: C.waHeader, flexShrink: 0, padding: '10px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 28, lineHeight: 1 }}>{'‹'}</span>
          <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: C.waHeaderLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
            {'🍽'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 16, letterSpacing: '-0.005em' }}>Tacos El Guero</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>
              {step >= 13 ? 'pedido recibido \u2713' : 'en linea'}
            </div>
          </div>
        </div>
        {/* Message area */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', backgroundColor: C.waBg }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '10px 12px 8px', gap: 5 }}>
            {visibleMessages.map(msg => {
              const msgRel = relFrame(frame, msg.visibleAtStep)
              const op = spring({ frame: msgRel, fps, config: { stiffness: 400, damping: 30, mass: 0.8 } })
              const y  = interpolate(op, [0, 1], [12, 0])
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'customer' ? 'flex-start' : 'flex-end', transform: `translateY(${y}px)`, opacity: op }}>
                  <div style={{
                    maxWidth: '78%',
                    backgroundColor: msg.from === 'customer' ? 'white' : C.waBotBubble,
                    borderRadius: msg.from === 'customer' ? '14px 14px 14px 3px' : '14px 14px 3px 14px',
                    padding: '9px 12px 7px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.09)',
                  }}>
                    <div style={{ fontSize: 14, color: '#111', lineHeight: 1.5 }}><WaText text={msg.text} /></div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 3 }}>
                      <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)' }}>{msg.time}</span>
                      {msg.from === 'bot' && <span style={{ fontSize: 12, color: C.waRead }}>{'✓✓'}</span>}
                    </div>
                  </div>
                </div>
              )
            })}

            {showTyping && (() => {
              const typRel = frame >= STEP_STARTS[2] && frame < STEP_STARTS[3]
                ? relFrame(frame, 2) : relFrame(frame, 5)
              const typOp = spring({ frame: typRel, fps, config: { stiffness: 400, damping: 28 } })
              return (
                <div style={{ display: 'flex', justifyContent: 'flex-end', opacity: typOp }}>
                  <div style={{ backgroundColor: C.waBotBubble, borderRadius: '14px 14px 3px 14px', padding: '11px 15px', boxShadow: '0 1px 3px rgba(0,0,0,0.09)', display: 'flex', gap: 5, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => <TypingDot key={i} index={i} frame={frame} />)}
                  </div>
                </div>
              )
            })()}

            {/* Confirm message — step 13+ (was 12) */}
            {step >= 13 && step < 16 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', transform: `translateY(${confirmY}px)`, opacity: confirmOp }}>
                <div style={{ maxWidth: '82%', backgroundColor: C.waBotBubble, borderRadius: '14px 14px 3px 14px', padding: '9px 12px 7px', boxShadow: '0 1px 3px rgba(0,0,0,0.09)' }}>
                  <div style={{ fontSize: 14, color: '#111', lineHeight: 1.5 }}>
                    <span>{'✅ '}</span>
                    {'¡Pedido listo para pago! '}
                    <strong>#A-047</strong>
                    <br />
                    {'Completa tu pago seguro '}
                    <span style={{ color: '#222' }}>{'👇'}</span>
                    <br />
                    <span style={{ color: C.green, fontWeight: 700 }}>$65 MXN</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 3 }}>
                    <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)' }}>8:43 p.m.</span>
                    <span style={{ fontSize: 12, color: C.waRead }}>{'✓✓'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Input bar */}
        <div style={{ backgroundColor: '#F0F2F0', flexShrink: 0, padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, backgroundColor: 'white', borderRadius: 100, padding: '9px 16px', fontSize: 14, color: '#bbb' }}>Escribe un mensaje</div>
          <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{'🎤'}</div>
        </div>
      </div>

      {/* ── Web menu screen ── */}
      {showMenu && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', backgroundColor: '#f7f7f7', transform: `translateX(${menuX}px)` }}>
          {/* Status bar */}
          <div style={{ height: 59, flexShrink: 0, backgroundColor: '#1a1a1e' }} />
          {/* Safari URL bar */}
          <div style={{ backgroundColor: '#1a1a1e', flexShrink: 0, padding: '6px 14px 10px', display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 20 }}>{'‹'}</span>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 9, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 11, color: '#4caf9e' }}>{'🔒'}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>ceats.app/tacos-centro</span>
            </div>
          </div>
          {/* Restaurant header */}
          <div style={{ backgroundColor: '#07080F', padding: '15px 16px 13px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 50, height: 50, borderRadius: 13, backgroundColor: '#128C7E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{'🌮'}</div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 17 }}>Tacos El Guero</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>Centro · Tlaquepaque · Abierto</div>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div style={{ flex: 1, overflowY: 'hidden', backgroundColor: '#f7f7f7', padding: '13px 16px 0' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(0,0,0,0.38)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Tacos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { name: 'Taco al Pastor', desc: 'Piña, cebolla, cilantro', price: '$25', added: cartCount >= 1 },
                { name: 'Taco de Suadero', desc: 'Carne suave, salsa roja', price: '$22', added: cartCount >= 2 },
                { name: 'Taco de Canasta', desc: 'Frijol, papa, chicharron', price: '$18', added: false },
              ].map((item, i) => {
                const itemRel = relFrame(frame, 8)
                const iSp = spring({ frame: Math.max(0, itemRel - i * 14), fps, config: { stiffness: 260, damping: 26 } })
                const isActive = (i === 0 && cartCount >= 1) || (i === 1 && cartCount >= 2)
                const rotAngle = i === 1 && cartCount >= 2 ? plusRotate : 0

                return (
                  <div key={i} style={{ backgroundColor: 'white', borderRadius: 13, padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', opacity: iSp, transform: `translateY(${interpolate(iSp, [0, 1], [12, 0])}px)` }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{item.desc}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginTop: 4 }}>{item.price}</div>
                    </div>
                    <div style={{
                      width: 30, height: 30, borderRadius: 10,
                      backgroundColor: isActive ? C.green : 'rgba(0,0,0,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transform: `rotate(${rotAngle}deg)`,
                      flexShrink: 0,
                    }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 2V12M2 7H12" stroke={isActive ? 'white' : '#666'} strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cart bar */}
          {cartCount > 0 && (
            <div style={{ flexShrink: 0, padding: '10px 16px 14px', backgroundColor: '#f7f7f7', transform: `translateY(${cartBarY}px)` }}>
              <div style={{
                backgroundColor: orderTapped ? (orderSending ? '#04a054' : C.green) : C.green,
                borderRadius: 14,
                padding: '13px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: `0 6px 28px rgba(6,193,103,0.35)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 8, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontSize: 11, fontWeight: 800 }}>{cartCount}</span>
                  </div>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>
                    {orderSending ? 'Enviando...' : orderTapped ? 'Continuar' : 'Ver carrito'}
                  </span>
                </div>
                <span style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>{cartTotal}</span>
              </div>
            </div>
          )}

          {/* Address screen — slides in over menu at step 11 */}
          {showAddress && (
            <div style={{ position: 'absolute', inset: 0, transform: `translateX(${addrSlideX}px)` }}>
              <AddressScreen frame={frame} fps={fps} />
            </div>
          )}

          {/* Payment layer — step 13+ */}
          {showPayment && <StripeCheckout frame={frame} fps={fps} />}
        </div>
      )}
    </div>
  )
}
