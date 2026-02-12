# İlaç Takip - Elderly Medication Reminder App

## ⚠️ CONTEXT: 2-Hour Hackathon Build
This is a hackathon project. Prioritize working features over perfection. Skip tests, skip edge cases, focus on a demoable product. Use inline styles with Tailwind where faster. Don't over-engineer.

## Overview
A medication reminder PWA with two interfaces:
1. **Elder View** — Ultra-simple, large UI. Daily checklist: "İçtim ✅" / "Atladım ❌"
2. **Caretaker Panel** — Full management: add/edit medications, set schedules, monitor compliance

**Pairing System:** Elder opens app → gets a 6-digit code → Caretaker enters code → linked. Caretaker manages everything remotely, elder just confirms medication intake.

## Technical Stack

| Category | Technology | Notes |
|----------|------------|-------|
| Framework | React 19 | with TypeScript |
| Build Tool | Vite (latest) | Fast dev server |
| Styling | Tailwind CSS v4 | Utility-first |
| Routing | React Router v7 | Simple SPA routing |
| Backend | Firebase | Auth + Firestore + Cloud Messaging |
| PWA | vite-plugin-pwa | Service worker, installable |
| Icons | Lucide React | Clean, accessible |
| Date/Time | date-fns | Lightweight |
| Notifications | Firebase Cloud Messaging | Push notifications |
| State | React Context + useState | Keep it simple for hackathon |

## Firebase Structure

```
Firestore Collections:

users/{userId}
  ├── role: "elder" | "caretaker"
  ├── pairingCode: string (6-digit, only for elders)
  ├── linkedTo: string[] (userId references)
  ├── displayName: string
  └── createdAt: timestamp

elders/{elderId}
  ├── name: string
  ├── caretakers: string[] (caretaker userIds)
  └── pairingCode: string

medications/{medicationId}
  ├── elderId: string
  ├── name: string (e.g., "Aspirin 100mg")
  ├── dosage: string (e.g., "1 tablet")
  ├── times: string[] (e.g., ["08:00", "20:00"])
  ├── notes: string (e.g., "Yemekten sonra")
  ├── pill: {
  │     shape: "round" | "oval" | "square" | "capsule" | "triangle"
  │     color: "white" | "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "brown" | "black"
  │     size: "small" | "medium" | "large"
  │   }
  ├── active: boolean
  ├── createdBy: string (caretaker userId)
  └── createdAt: timestamp

logs/{logId}
  ├── elderId: string
  ├── medicationId: string
  ├── scheduledTime: string (e.g., "08:00")
  ├── scheduledDate: string (e.g., "2025-02-12")
  ├── status: "taken" | "skipped" | "pending"
  ├── actionTime: timestamp | null
  └── createdAt: timestamp
```

## Firebase Security Rules (Basic)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // For hackathon, keep rules simple but functional
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    match /elders/{elderId} {
      allow read, write: if request.auth != null;
    }
    match /medications/{medId} {
      allow read, write: if request.auth != null;
    }
    match /logs/{logId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Route Architecture

| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| `/` | `LandingPage` | No | Choose role: "Ben yaşlıyım" / "Ben refakatçiyim" |
| `/elder` | `ElderSetup` | Anon | Anonymous auth → generate pairing code |
| `/elder/home` | `ElderHome` | Anon | Daily medication checklist (MAIN SCREEN) |
| `/caretaker/login` | `CaretakerLogin` | No | Email/password or Google login (skipped if already logged in) |
| `/caretaker/pair` | `PairElder` | Yes | Enter 6-digit code to link |
| `/caretaker/dashboard` | `CaretakerDashboard` | Yes | List of linked elders |
| `/caretaker/elder/:id` | `ElderDetail` | Yes | Medications & compliance for one elder |
| `/caretaker/elder/:id/add-med` | `AddMedication` | Yes | Add/edit medication form |

**Auth-Aware Routing Logic:**
- App opens → check `onAuthStateChanged` (show loading spinner)
- If logged in as **caretaker** → skip landing, go straight to `/caretaker/dashboard`
- If logged in as **elder** (anonymous) → skip landing, go straight to `/elder/home`
- If not logged in → show landing page (`/`)
- All `/caretaker/*` routes (except login) are protected → redirect to `/caretaker/login` if unauthenticated
- Elder routes use anonymous auth → auto-created on first visit, persisted

## Screen Specifications

### 1. Landing Page (`/`)
- App logo + name "İlaç Takip"
- Two large buttons filling the screen:
  - 🧓 "Ben Yaşlıyım" → `/elder` (green, very large)
  - 👨‍👩‍👧 "Refakatçiyim" → `/caretaker/login` (blue, large)
- Minimal text, maximum clarity
- Font size: minimum 24px for all text on this page

### 2. Elder Setup (`/elder`)
- Auto-creates anonymous Firebase auth
- Generates random 6-digit numeric code
- Shows code in HUGE text (72px+): "Kodunuz: 847291"
- Below: "Bu kodu refakatçinize verin"
- Button: "Devam Et" → `/elder/home`
- Also show code on elder home screen in settings/info area

### 3. Elder Home (`/elder/home`) ⭐ MOST IMPORTANT SCREEN
**Design Principles:**
- Minimum font size: 20px, preferred 24-28px
- Buttons: minimum 64px height, preferred 80px
- High contrast: dark text on light backgrounds
- No small icons or subtle UI elements
- Maximum 2 tap actions to do anything

**Layout:**
```
┌─────────────────────────────┐
│  📅 Bugün: 12 Şubat Çarşamba │  (large, top bar)
│  🕐 Saat: 14:30              │
├─────────────────────────────┤
│                             │
│  ☀️ SABAH (08:00)            │  (section header)
│  ┌─────────────────────────┐│
│  │ [🔴💊]  Aspirin 100mg   ││  (PillIcon SVG + medication name)
│  │          1 tablet        ││  (dosage)
│  │          Yemekten sonra  ││  (notes, smaller gray text)
│  │                         ││
│  │  [✅ İÇTİM]  [❌ ATLADIM] ││  (two huge buttons)
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ [⚪💊]  Tansiyon İlacı  ││  (white round pill icon)
│  │          1 tablet        ││
│  │                         ││
│  │  [✅ İÇTİM]  [❌ ATLADIM] ││
│  └─────────────────────────┘│
│                             │
│  🌙 AKŞAM (20:00)           │
│  ┌─────────────────────────┐│
│  │ [🟡💊]  Şeker İlacı     ││  (yellow oval pill icon)
│  │          Bekliyor...     ││
│  └─────────────────────────┘│
│                             │
├─────────────────────────────┤
│  Kodunuz: 847291            │  (small, bottom)
└─────────────────────────────┘
```

**Interaction:**
- Tap "İÇTİM" → card turns green, shows "✅ 14:32'de alındı"
- Tap "ATLADIM" → card turns orange/red, shows "❌ Atlandı"
- Cards grouped by time of day (Sabah/Öğle/Akşam/Gece)
- Already completed cards stay but are visually muted
- Time groups: Sabah (06-11), Öğle (11-14), Akşam (14-20), Gece (20-06)

**Colors for status:**
- Pending: white/light gray card
- Taken: soft green background (#E8F5E9)
- Skipped: soft red/orange background (#FFF3E0)
- Upcoming (future time): light blue (#E3F2FD), no action buttons yet

### 4. Caretaker Login (`/caretaker/login`)
**Auth Flow:**
- Firebase Auth with `browserLocalPersistence` (default) — user stays logged in forever until explicit logout
- PWA installed on phone → acts like native app, session persists across restarts
- On app load: check `onAuthStateChanged` → if logged in, skip to dashboard automatically
- NO re-login required unless user explicitly logs out

**Login Screen (only shown if not authenticated):**
- **Google Sign-in button** (top, prominent — "Google ile Giriş Yap")
- Divider: "── veya ──"
- **Email + password form** (standard inputs)
  - Email input
  - Password input (min 6 chars)
  - "Giriş Yap" button
- **Register toggle:** "Hesabın yok mu? Kayıt Ol" — switches form to:
  - Ad Soyad input
  - Email input
  - Password input
  - Password confirm input
  - "Kayıt Ol" button
- Use same component with a `isRegister` state toggle, don't create separate pages

**Post-Login Flow:**
1. Check if caretaker has any linked elders
2. If yes → redirect to `/caretaker/dashboard`
3. If no → redirect to `/caretaker/pair` (first-time experience)

**Important:** Caretaker can pair with multiple elders (e.g., anne + baba). Dashboard shows all linked elders.

### 5. Pair Elder (`/caretaker/pair`)
- Input field: "6 haneli kodu girin"
- Large numeric keypad style input or standard input
- "Eşleştir" button
- On success: show elder name, redirect to dashboard

### 6. Caretaker Dashboard (`/caretaker/dashboard`)
**Layout:**
```
┌─────────────────────────────┐
│  İlaç Takip - Refakatçi     │
├─────────────────────────────┤
│                             │
│  👴 Ahmet Dede              │
│  ✅ 3/4 ilaç alındı bugün   │
│  Son aktivite: 14:32        │
│  [Detay →]                  │
│                             │
│  👵 Ayşe Nine               │
│  ⚠️ 1/3 ilaç alındı bugün   │
│  Son aktivite: 08:15        │
│  [Detay →]                  │
│                             │
├─────────────────────────────┤
│  [+ Yeni Yaşlı Ekle]       │
└─────────────────────────────┘
```

Each elder card shows:
- Name
- Today's compliance: X/Y medications taken
- Warning indicator if medications missed
- Last activity time

### 7. Elder Detail (`/caretaker/elder/:id`)
**Two Tabs:**

**Tab 1: Bugün (Today's Status)**
- Same medication list as elder sees, but read-only
- Shows taken/skipped/pending status for each
- Timeline view of today's medications

**Tab 2: İlaçlar (Medications Management)**
- List of all medications
- Each with edit/delete buttons
- "+ Yeni İlaç Ekle" button
- Toggle active/inactive

**Tab 3: Geçmiş (History)** (if time permits)
- Last 7 days compliance chart (simple)
- Day-by-day log

### 8. Add/Edit Medication (`/caretaker/elder/:id/add-med`)
**Form Fields:**
```
İlaç Adı: [________________] (text input)
Doz:      [________________] (text input, e.g., "1 tablet")
Notlar:   [________________] (text input, e.g., "Yemekten sonra")

Saatler:  (time picker, can add multiple)
  [08:00] [x]
  [20:00] [x]
  [+ Saat Ekle]

Şekil:    (pill shape selector — visual SVG buttons)
  ● Yuvarlak   ◆ Oval   █ Kare   ▬ Kapsül   △ Üçgen

Renk:     (color palette — large tappable circles)
  ⚪ Beyaz  🔴 Kırmızı  🟠 Turuncu  🟡 Sarı
  🟢 Yeşil  🔵 Mavi  🟣 Mor  🟤 Kahverengi  ⚫ Siyah

Boyut:    ○ Küçük   ◎ Orta   ◉ Büyük

[Kaydet]  [İptal]
```

**Pill Visual Preview:** Form'da şekil + renk + boyut seçildikçe canlı önizleme göster. Bu SVG component aynı zamanda elder checklist'teki medication card'larda da kullanılacak — yaşlı ilaç ismini okumasa bile şeklinden tanıyacak.

## Pill Visual Component (PillIcon)

**This is a critical component — used in both elder checklist cards AND caretaker medication form.**

```typescript
// components/common/PillIcon.tsx
// Props: shape, color, size, className?
//
// Renders an inline SVG of a pill based on shape + color + size.
// The SVG should have a subtle border/stroke and a small highlight/gradient for realism.
//
// Shape SVG paths:
//   round    → <circle>
//   oval     → <ellipse> (rx > ry)
//   square   → <rect> with rounded corners (rx=4)
//   capsule  → <rect> with very rounded ends (rx=height/2), two-tone (left/right halves slightly different shade)
//   triangle → <polygon> with rounded appearance
//
// Size maps to SVG dimensions:
//   small  → 32x32 (in caretaker form picker) / 40x40 (in elder card)
//   medium → 40x40 (in caretaker form picker) / 52x52 (in elder card)
//   large  → 48x48 (in caretaker form picker) / 64x64 (in elder card)
//
// Color hex map:
const PILL_COLORS: Record<PillColor, { fill: string; stroke: string; highlight: string }> = {
  white:  { fill: '#F5F5F5', stroke: '#BDBDBD', highlight: '#FFFFFF' },
  red:    { fill: '#EF5350', stroke: '#C62828', highlight: '#EF9A9A' },
  orange: { fill: '#FFA726', stroke: '#E65100', highlight: '#FFCC80' },
  yellow: { fill: '#FFEE58', stroke: '#F9A825', highlight: '#FFF9C4' },
  green:  { fill: '#66BB6A', stroke: '#2E7D32', highlight: '#A5D6A7' },
  blue:   { fill: '#42A5F5', stroke: '#1565C0', highlight: '#90CAF9' },
  purple: { fill: '#AB47BC', stroke: '#6A1B9A', highlight: '#CE93D8' },
  brown:  { fill: '#8D6E63', stroke: '#4E342E', highlight: '#BCAAA4' },
  black:  { fill: '#424242', stroke: '#212121', highlight: '#757575' },
};
//
// Each SVG includes:
// 1. Main shape with fill color
// 2. Subtle stroke (1-2px)
// 3. Small elliptical highlight (white/light, ~30% opacity) in upper-left for 3D effect
// 4. Drop shadow via filter or CSS shadow
//
// Usage in elder card: <PillIcon shape="capsule" color="red" size="large" />
// Usage in form picker: <PillIcon shape="round" color="blue" size="small" />
```

### PillShapePicker Component (Caretaker Form)
```typescript
// components/caretaker/PillShapePicker.tsx
// Interactive picker with 3 sections stacked vertically:
//
// 1. SHAPE SELECTOR — Row of 5 clickable SVG shapes (all in gray/neutral)
//    Selected shape gets a blue ring/border
//    Labels below each: Yuvarlak, Oval, Kare, Kapsül, Üçgen
//
// 2. COLOR PALETTE — Grid of 9 color circles (3x3 or single row)
//    Each circle is 44px (accessible tap target)
//    Selected color gets a checkmark overlay + ring
//    Labels optional (can use tooltip)
//
// 3. SIZE SELECTOR — 3 radio-style buttons
//    ○ Küçük   ◎ Orta   ◉ Büyük
//    Show relative size visually (actual different sized circles)
//
// 4. LIVE PREVIEW — Bottom of picker shows the combined result
//    Large (80x80) PillIcon with selected shape + color + size
//    Text below: "Önizleme"
//    Updates instantly as user changes any selection
//
// Default selection: round + white + medium
```

### Updated Elder Medication Card
The elder home medication card should prominently display the pill visual:

```
┌─────────────────────────────────────┐
│  [🔴 PILL SVG]   Aspirin 100mg     │  ← PillIcon (64px) + name (24px bold)
│    (capsule)     1 tablet           │  ← shape label + dosage
│                  Yemekten sonra     │  ← notes (20px, gray)
│                                     │
│   [  ✅ İÇTİM  ]  [  ❌ ATLADIM  ] │  ← action buttons (72px height)
└─────────────────────────────────────┘
```

The PillIcon sits on the left side of the card, vertically centered, giving the elder an instant visual cue — they don't even need to read the text to know which medication this is.

## Component Architecture

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Router setup + Firebase provider
├── firebase.ts                 # Firebase config & initialization
├── contexts/
│   └── AuthContext.tsx          # Auth state provider
├── components/
│   ├── common/
│   │   ├── LoadingSpinner.tsx   # Full-screen loading
│   │   ├── ProtectedRoute.tsx   # Auth guard
│   │   └── PillIcon.tsx         # SVG pill shape renderer (shape + color + size)
│   ├── elder/
│   │   ├── ElderSetup.tsx       # Pairing code generation
│   │   ├── ElderHome.tsx        # Daily checklist
│   │   ├── MedicationCard.tsx   # Single medication with PillIcon + action buttons
│   │   └── TimeGroup.tsx        # Group medications by time of day
│   ├── caretaker/
│   │   ├── CaretakerLogin.tsx   # Login/register
│   │   ├── PairElder.tsx        # Enter pairing code
│   │   ├── Dashboard.tsx        # Elder list overview
│   │   ├── ElderCard.tsx        # Summary card for each elder
│   │   ├── ElderDetail.tsx      # Detailed view + tabs
│   │   ├── MedicationList.tsx   # Manage medications
│   │   ├── MedicationForm.tsx   # Add/edit medication
│   │   ├── PillShapePicker.tsx  # Shape + color + size picker with live preview
│   │   ├── TodayStatus.tsx      # Today's compliance view
│   │   └── HistoryView.tsx      # Past days (bonus)
│   └── landing/
│       └── LandingPage.tsx      # Role selection
├── hooks/
│   ├── useElderData.ts          # Fetch elder medications & logs
│   ├── useMedications.ts        # CRUD for medications
│   └── useLogs.ts               # Log medication intake
├── utils/
│   ├── pairingCode.ts           # Generate/validate 6-digit codes
│   ├── timeGroups.ts            # Group medications by time of day
│   └── dateUtils.ts             # Date formatting helpers
├── types/
│   └── index.ts                 # TypeScript interfaces
└── styles/
    └── index.css                # Tailwind imports + custom elder styles
```

## Key Implementation Details

### Pairing Code System
```typescript
// Generate a random 6-digit code
function generatePairingCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// When elder opens app:
// 1. Create anonymous auth
// 2. Generate code
// 3. Store in Firestore: elders/{uid} = { pairingCode: "847291", name: "Yaşlı" }

// When caretaker enters code:
// 1. Query: elders where pairingCode == inputCode
// 2. If found: add caretaker userId to elder's caretakers array
// 3. Add elder to caretaker's linkedTo array
```

### Daily Log Generation
```typescript
// On elder home load, check today's logs
// For each active medication + each scheduled time:
//   - Check if log exists for today + that time
//   - If not, create a "pending" log
// This ensures the checklist is always populated

function getTodayLogs(elderId: string, medications: Medication[]) {
  const today = format(new Date(), 'yyyy-MM-dd');
  // Query logs where elderId == elderId && scheduledDate == today
  // Cross-reference with medications to find missing logs
  // Create pending logs for any missing
}
```

### Time Grouping
```typescript
type TimeGroup = 'sabah' | 'ogle' | 'aksam' | 'gece';

function getTimeGroup(time: string): TimeGroup {
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 6 && hour < 11) return 'sabah';
  if (hour >= 11 && hour < 14) return 'ogle';
  if (hour >= 14 && hour < 20) return 'aksam';
  return 'gece';
}

const groupLabels: Record<TimeGroup, string> = {
  sabah: '☀️ Sabah',
  ogle: '🌤️ Öğle',
  aksam: '🌅 Akşam',
  gece: '🌙 Gece',
};
```

### Elder UI Styling Constants
```typescript
// Apply these to ALL elder-facing components
const ELDER_STYLES = {
  fontSize: {
    body: 'text-xl md:text-2xl',        // 20-24px
    heading: 'text-3xl md:text-4xl',     // 30-36px
    large: 'text-5xl md:text-6xl',       // 48-60px (pairing code)
  },
  button: {
    primary: 'min-h-[72px] text-2xl font-bold rounded-2xl px-8',
    action: 'min-h-[64px] text-xl font-semibold rounded-xl px-6',
  },
  card: 'rounded-2xl shadow-lg p-6 mb-4',
  spacing: 'p-4 md:p-6',
};
```

## Firebase Configuration

Create a Firebase project with:
1. **Authentication**: Enable Anonymous + Email/Password + Google
2. **Firestore**: Create database in production mode
3. **Cloud Messaging** (bonus): For push notifications

```typescript
// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // User fills in their own config
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Ensure persistence is LOCAL — survives browser/PWA restarts
setPersistence(auth, browserLocalPersistence);
```

### AuthContext Implementation Notes

```typescript
// contexts/AuthContext.tsx
// Key behaviors:
// 1. onAuthStateChanged listener on mount
// 2. While checking auth → show full-screen loading spinner (not a flash of login page)
// 3. If user exists → set user + fetch role from Firestore users collection
// 4. If no user → show login/landing page
// 5. Provide: user, role, loading, login, register, loginWithGoogle, logout functions
//
// CRITICAL: Show a loading state while Firebase checks persisted session.
// Without this, user sees login page for a split second before redirect.
//
// Auth state flow:
// App opens → loading=true → onAuthStateChanged fires → 
//   → if user: loading=false, redirect to appropriate dashboard
//   → if null: loading=false, show landing/login page
```

## PWA Configuration
```typescript
// vite.config.ts - add VitePWA plugin
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'İlaç Takip',
        short_name: 'İlaçTakip',
        description: 'Yaşlılar için ilaç hatırlatma uygulaması',
        theme_color: '#4CAF50',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
});
```

## TypeScript Types

```typescript
// types/index.ts
export interface User {
  id: string;
  role: 'elder' | 'caretaker';
  displayName: string;
  linkedTo: string[];
  createdAt: Date;
}

export interface Elder {
  id: string;
  name: string;
  pairingCode: string;
  caretakers: string[];
}

export interface Medication {
  id: string;
  elderId: string;
  name: string;
  dosage: string;
  times: string[];
  notes: string;
  pill: {
    shape: PillShape;
    color: PillColor;
    size: PillSize;
  };
  active: boolean;
  createdBy: string;
  createdAt: Date;
}

export type PillShape = 'round' | 'oval' | 'square' | 'capsule' | 'triangle';
export type PillColor = 'white' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'brown' | 'black';
export type PillSize = 'small' | 'medium' | 'large';

export interface MedicationLog {
  id: string;
  elderId: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: string;
  scheduledDate: string;
  status: 'taken' | 'skipped' | 'pending';
  actionTime: Date | null;
  createdAt: Date;
}

export type TimeGroup = 'sabah' | 'ogle' | 'aksam' | 'gece';

export interface GroupedMedications {
  group: TimeGroup;
  label: string;
  emoji: string;
  medications: (Medication & { log: MedicationLog })[];
}
```

## Implementation Priority (2-Hour Timeline)

### Hour 1: Core Setup + Elder Flow (0:00 - 1:00)
1. **0:00-0:15** — Vite + React + Tailwind + Firebase setup, env vars
2. **0:15-0:30** — Landing page + routing + Auth context
3. **0:30-0:45** — Elder setup (anonymous auth + pairing code generation)
4. **0:45-1:00** — Elder home screen (medication cards + İçtim/Atladım buttons)

### Hour 2: Caretaker Flow + Polish (1:00 - 2:00)
5. **1:00-1:15** — Caretaker login (email/password)
6. **1:15-1:30** — Pair elder (enter code + link accounts)
7. **1:30-1:45** — Caretaker dashboard + elder detail view
8. **1:45-2:00** — Add medication form + PWA manifest + final polish

### Bonus (if time):
- Push notifications via FCM
- History view with simple compliance chart
- Sound/vibration on notification
- Caretaker gets alert when elder skips medication

## Color Palette

```css
/* Main Colors */
--primary-green: #4CAF50;      /* İçtim button, success */
--primary-red: #FF5722;        /* Atladım button, warning */
--primary-blue: #2196F3;       /* Caretaker theme */
--elder-bg: #FAFAFA;           /* Elder background, easy on eyes */
--card-bg: #FFFFFF;

/* Status Colors */
--status-taken: #E8F5E9;       /* Light green */
--status-skipped: #FFF3E0;     /* Light orange */
--status-pending: #FFFFFF;     /* White */
--status-upcoming: #E3F2FD;    /* Light blue */

/* Elder UI */
--elder-text: #212121;         /* High contrast text */
--elder-subtext: #616161;      /* Secondary text */
```

## Critical UX Rules for Elder Interface

1. **NO small text anywhere** — Minimum 20px, headers 28px+
2. **NO swipe gestures** — Only taps
3. **NO nested menus** — Everything visible on screen
4. **NO confirmation dialogs** — Actions are reversible (can re-tap)
5. **HIGH contrast** — Dark text on light backgrounds
6. **BIG touch targets** — Minimum 64px height for all interactive elements
7. **CLEAR feedback** — Color change + text change on action
8. **SIMPLE language** — "İçtim" not "İlacı aldığınızı onaylayın"
9. **CURRENT time prominent** — Always show big clock + date
10. **NO login for elder** — Anonymous auth, zero friction

## Commands to Start

```bash
# Create project
npm create vite@latest ilac-takip -- --template react-ts
cd ilac-takip

# Install dependencies
npm install firebase react-router-dom lucide-react date-fns
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa

# Create env file
cat > .env << 'EOF'
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
EOF

# Start dev
npm run dev
```

## Demo Script (For Hackathon Judges)

1. Open app on phone → Show landing page → Tap "Ben Yaşlıyım"
2. Show pairing code: "847291"
3. On laptop, open caretaker view → Login → Enter code → Paired!
4. On laptop, add 3 medications with different shapes/colors:
   - "Aspirin 100mg" → red capsule, small
   - "Tansiyon İlacı" → white round, medium
   - "Şeker İlacı" → yellow oval, large
5. Show phone automatically updates — each medication has its unique pill icon
6. Point out: **"Yaşlı okumasa bile kırmızı kapsülü, beyaz yuvarlağı tanıyor"**
7. On phone, tap "İçtim" for one medication → Card turns green with timestamp
8. On laptop, show real-time update: "✅ Aspirin alındı - 14:32"
9. Highlight: "Yaşlı sadece 1 butona basar, gerisini biz yönetiyoruz"
