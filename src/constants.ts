export const FPS = 60
export const WIDTH = 1920
export const HEIGHT = 1080

// Step durations in frames at 60fps
// steps: 0:idle 1:cust 2:botTyping 3:botGreet 4:cust"1" 5:botTyping
//        6:botLink 7:menuSlide 8:menuItems 9:cartTap 10:orderTap
//        11:connection 12:confirm 13:paymentSheet 14:applePayTap
//        15:paymentSuccess 16:dashboardReveal 17:deliveryNotif
//        18:riderNotif 19:slogan 20:reset
export const STEP_FRAMES = [
  60,   // 0  idle
  48,   // 1  cust greeting
  60,   // 2  bot typing
  132,  // 3  bot greet
  42,   // 4  cust "1"
  54,   // 5  bot typing
  144,  // 6  bot link
  42,   // 7  menu slide
  96,   // 8  menu items
  78,   // 9  cart tap
  42,   // 10 order tap
  21,   // 11 connection
  90,   // 12 confirm / payment sheet slides in (was 228)
  60,   // 13 payment sheet revealed
  36,   // 14 apple pay tap
  90,   // 15 payment success
  120,  // 16 dashboard reveal on right
  90,   // 17 delivery / order ready notif
  90,   // 18 rider on the way notif
  192,  // 19 slogan
  54,   // 20 reset
] as const

export const VIDEO_OFFSET = 990  // frames before demo animation (Acts 1-4 = 16.5s)
export const OUTRO_DURATION = 510  // Acts 6+7+fade after demo (8.5s)

export const STEP_STARTS: number[] = (() => {
  const starts: number[] = []
  let t = VIDEO_OFFSET
  for (const d of STEP_FRAMES) { starts.push(t); t += d }
  return starts
})()

export const ANIMATION_END = STEP_STARTS[STEP_FRAMES.length - 1] + STEP_FRAMES[STEP_FRAMES.length - 1]
export const TOTAL_FRAMES = ANIMATION_END + OUTRO_DURATION

export function getStep(frame: number): number {
  if (frame < VIDEO_OFFSET) return -1
  const rel = frame - VIDEO_OFFSET
  let elapsed = 0
  for (let i = 0; i < STEP_FRAMES.length; i++) {
    elapsed += STEP_FRAMES[i]
    if (rel < elapsed) return i
  }
  return STEP_FRAMES.length // outro
}

export function relFrame(frame: number, step: number): number {
  return Math.max(0, frame - STEP_STARTS[step])
}

// iPhone 15-pro at scale 1: outer 417 × 876
export const PHONE_W = 417
export const PHONE_H = 876

// Layout
export const CONNECTOR_W = 80
export const TOTAL_PHONES_W = PHONE_W + CONNECTOR_W + PHONE_W // 914
export const LEFT_PHONE_X = Math.round((WIDTH - TOTAL_PHONES_W) / 2)  // 503
export const RIGHT_PHONE_X = LEFT_PHONE_X + PHONE_W + CONNECTOR_W    // 1000
export const PHONE_Y_FINAL = 130
export const LABEL_Y = 82

export const C = {
  green: '#06C167',
  dark: '#07080F',
  waHeader: '#075E54',
  waHeaderLight: '#128C7E',
  waBotBubble: '#DCF8C6',
  waBg: '#ECE5DD',
  waRead: '#53bdeb',
  // Premium design tokens
  cardBg: '#0F1117',
  border: 'rgba(255,255,255,0.07)',
  borderGreen: 'rgba(6,193,103,0.22)',
  mutedText: 'rgba(255,255,255,0.4)',
  stripeBlue: '#635BFF',
  applePay: '#000000',
}

export const WA_MESSAGES = [
  { id: 1, from: 'customer' as const, text: 'Buenas noches! 👋', visibleAtStep: 1, time: '8:42 p.m.' },
  { id: 2, from: 'bot' as const, text: '¡Hola! Bienvenido a *cEats* 😊\n¿De qué sucursal quieres ordenar?\n\n1️⃣ Centro\n2️⃣ Zapopan', visibleAtStep: 3, time: '8:42 p.m.' },
  { id: 3, from: 'customer' as const, text: '1', visibleAtStep: 4, time: '8:42 p.m.' },
  { id: 4, from: 'bot' as const, text: '¡Perfecto! 🎉 Aquí tu link:\n\n👉 *ceats.app/tacos-centro*\n\nSelecciona tus platillos ahí 😋', visibleAtStep: 6, time: '8:43 p.m.' },
] as const
