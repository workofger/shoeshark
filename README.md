# 🦈 ShoeShark

**Complete baccarat shoe tracking PWA with real-time Expected Value engine.**

Built with Next.js 14+, TypeScript, and powered by Monte Carlo simulation (50,000 iterations) for precise probability calculations.

## ✅ What's Built

### 🧠 Engine (`src/engine/`)
- **Pure TypeScript baccarat engine** with complete rule implementation
- **Monte Carlo simulation** - 50,000 iterations for ±0.2% precision
- **EV calculation** for all bet types: Player, Banker, Tie, Pairs, Dragon Bonus
- **Shoe state management** - tracks 416 cards across 8 decks
- **Complete baccarat drawing rules** - naturals, player/banker tableau

### 🎮 UI Components
- **Dark-mode only** casino-optimized interface
- **Single-hand usable** - minimum 48px touch targets
- **Card input grid** with remaining count display
- **EV dashboard** with traffic light signals (🟢 positive, 🔴 negative, 🟡 neutral)
- **Shoe progress meter** - visual progress through 416 cards
- **Distribution chart** - real-time card count visualization
- **Bead road** - traditional baccarat outcome tracking

### 🔄 Card Input Flow
**Automatic phase progression**: P1 → B1 → P2 → B2 → [P3?] → [B3?]
- App determines if 3rd cards needed (user doesn't choose)
- Undo/reset functionality
- Real-time EV updates after each card

### 📱 PWA Features
- **Offline-first** - works 100% without internet
- **Service worker** for caching
- **Installable** on mobile devices
- **Responsive** design optimized for portrait mode

### 💾 Data Persistence
- **Zustand store** for real-time state management
- **localStorage** for immediate hand/session storage
- **Supabase integration** (optional) for cloud sync
- **Offline sync queue** with retry logic

### ⚡ Performance
- **Web Worker** for non-blocking Monte Carlo calculations
- **<50ms calculation target** for real-time updates
- **Optimized rendering** with minimal re-renders

## 🏗 Architecture

```
shoeshark/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── play/             # Main game interface
│   │   ├── history/          # Session history
│   │   ├── settings/         # Payout configuration
│   │   └── session/[id]/     # Session details
│   ├── engine/               # Core baccarat logic
│   │   ├── constants.ts      # Game constants & payouts
│   │   ├── shoe.ts          # Shoe state management
│   │   ├── baccarat-rules.ts # Drawing rules & hand evaluation
│   │   ├── probability.ts    # Monte Carlo simulation
│   │   └── ev.ts            # Expected value calculations
│   ├── components/           # React UI components
│   ├── store/               # Zustand state management
│   ├── workers/             # Web Worker for calculations
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utilities (Supabase, sync)
└── tests/engine/            # Comprehensive engine tests
```

## 🧪 Test Results

**✅ All tests passing** - 60/60 tests across 4 test files:
- **Shoe management**: Card counting, probability calculations
- **Baccarat rules**: Drawing logic, hand evaluation, naturals
- **Probability engine**: Monte Carlo simulation accuracy
- **EV calculations**: Expected value for all bet types

## 🚀 Tech Stack

- **Next.js 16.2** with App Router
- **React 18** with TypeScript 5
- **Tailwind CSS 3** for styling
- **Zustand 4** for state management
- **@ducanh2912/next-pwa** for PWA functionality
- **Supabase** (optional) for cloud persistence
- **Vitest** for testing

## 🎯 Key Features

### Engine Accuracy (#1 Priority)
- **Fixed baccarat tableau** - industry-standard drawing rules
- **8-deck shoe simulation** - 128 tens, 32 each 1-9
- **Validated probabilities** - matches theoretical baccarat odds
- **Precision targeting** - ±0.2% accuracy from 50K iterations

### Casino-Optimized UX
- **Dark theme only** - reduces eye strain in casino environment
- **Large touch targets** - 48px minimum, "0" button 1.5x wider
- **One-handed operation** - all controls within thumb reach
- **Professional fonts** - SF Mono for numbers, Inter for text

### Real-time Insights
- **Live EV updates** - recalculates after each card
- **Visual signals** - instant positive/negative/neutral indicators
- **Best bet recommendation** - highlights highest EV option
- **Shoe depletion tracking** - progress through 416 cards

## 🛠 Build Status

- ✅ **Next.js build successful** - no TypeScript errors
- ✅ **All tests passing** - comprehensive engine validation
- ✅ **PWA ready** - manifest, service worker configured
- ✅ **GitHub deployed** - https://github.com/workofger/shoeshark

## 🎨 Color Scheme

- **Background**: `#0A0A0F` (near-black)
- **Surface**: `#13131A` (dark gray)
- **Cards**: `#1A1A25` (medium gray)
- **Player**: `#4FC3F7` (blue)
- **Banker**: `#EF5350` (red)
- **Tie**: `#66BB6A` (green)
- **EV Positive**: `#00E676` (bright green)
- **EV Negative**: `#FF5252` (bright red)
- **EV Neutral**: `#FFD740` (amber)

## 📋 Configuration

### Payout Settings (Configurable)
- **Player**: 1:1
- **Banker**: 0.95:1 (5% commission)
- **Tie**: 8:1
- **Player/Banker Pair**: 11:1
- **Either Pair**: 5:1
- **Dragon Bonus**: Variable by margin (4+ pays, 1-3 push)

### Environment Variables (Optional)
```env
# Supabase (app works 100% offline without these)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🎮 Usage

1. **Start Session**: Open `/play` - shoe automatically initializes
2. **Input Cards**: Tap card values in order (P1→B1→P2→B2→P3?→B3?)
3. **Track EV**: Watch real-time expected value calculations
4. **Monitor Progress**: See shoe depletion and distribution changes
5. **Review History**: Check past sessions in `/history`

## 🔮 Future Enhancements

- **Supabase schema** for session/hand storage
- **Custom paytables** for different casino rules
- **Advanced statistics** - win rates, streaks, patterns
- **Export functionality** - CSV/PDF session reports
- **Multiple shoe tracking** - parallel game monitoring

---

**Repository**: https://github.com/workofger/shoeshark  
**Built**: March 19, 2026  
**License**: MIT