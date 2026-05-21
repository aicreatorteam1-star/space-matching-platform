import { useState, useMemo, useEffect } from 'react'
import {
  MapPin, Package, Home, Bell, Moon, ChevronDown,
  Search, CheckCircle2, BarChart3, Check,
} from 'lucide-react'

/* ── Types ───────────────────────────────────────────────────────────────── */
type LocationId = 'sukhumvit' | 'bangna' | 'rama3'
type ItemId     = 'box' | 'luggage' | 'wardrobe' | 'fridge' | 'sofa'
type SizeId     = 'S' | 'M' | 'L'
type Counts     = Record<ItemId, number>

interface Location {
  id: LocationId
  name: string
  icon: string
  desc: string
  address: string
}

interface Item {
  id: ItemId
  emoji: string
  name: string
  hint: string
  units: number
}

interface Tier {
  id: SizeId
  label: string
  dim: string
  area: string
  price: number
  max: number
  features: string[]
}

interface SubmitData {
  name: string
  phone: string
  note: string
  size: SizeId
  location: LocationId
  totalUnits: number
}

/* ── Data ────────────────────────────────────────────────────────────────── */
const LOCATIONS: Location[] = [
  { id: 'sukhumvit', name: 'สุขุมวิท', icon: '🏙️', desc: 'BTS พร้อมพงษ์ — สถานี 4', address: 'ซ.สุขุมวิท 39, กทม.' },
  { id: 'bangna',    name: 'บางนา',    icon: '🏗️', desc: 'ติด Mega Bangna / Express',  address: 'บางนา-ตราด กม.2, กทม.' },
  { id: 'rama3',     name: 'พระราม 3', icon: '🌊', desc: 'ริมแม่น้ำ — เส้นทางสะดวก', address: 'ถ.พระราม 3, กทม.' },
]

const ITEMS: Item[] = [
  { id: 'box',      emoji: '📦', name: 'กล่องลัง',        hint: 'ขนาดมาตรฐาน 40×40 cm', units: 1 },
  { id: 'luggage',  emoji: '🧳', name: 'กระเป๋าเดินทาง', hint: 'ขนาด 28 นิ้ว',          units: 2 },
  { id: 'wardrobe', emoji: '🪞', name: 'ตู้เสื้อผ้า',    hint: '2 บาน / มาตรฐาน',        units: 5 },
  { id: 'fridge',   emoji: '🧊', name: 'ตู้เย็น',         hint: '1–2 ประตู',              units: 6 },
  { id: 'sofa',     emoji: '🛋️', name: 'โซฟา',           hint: '3–4 ที่นั่ง',             units: 8 },
]

const TIERS: Tier[] = [
  { id: 'S', label: 'Size S', dim: '1 × 2 m', area: '2 ตร.ม.',  price: 1500, max: 8,
    features: ['เหมาะสำหรับกล่องและกระเป๋า', 'ระบบกล้องวงจรปิด 24 ชม.', 'ประกันของสูงสุด ฿10,000'] },
  { id: 'M', label: 'Size M', dim: '2 × 3 m', area: '6 ตร.ม.',  price: 2800, max: 20,
    features: ['เหมาะสำหรับเฟอร์นิเจอร์ขนาดกลาง', 'ควบคุมความชื้น', 'ประกันของสูงสุด ฿30,000'] },
  { id: 'L', label: 'Size L', dim: '3 × 4 m', area: '12 ตร.ม.', price: 4500, max: Infinity,
    features: ['เหมาะสำหรับเฟอร์นิเจอร์ครบชุด', 'ระบบปรับอากาศ', 'ประกันของสูงสุด ฿80,000'] },
]

function getTier(units: number): SizeId | null {
  if (!units) return null
  if (units <= 8)  return 'S'
  if (units <= 20) return 'M'
  return 'L'
}

const EMPTY_COUNTS: Counts = { box: 0, luggage: 0, wardrobe: 0, fridge: 0, sofa: 0 }

/* ── Topbar ──────────────────────────────────────────────────────────────── */
function Topbar() {
  return (
    <header style={{
      height: 'var(--topbar-height)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 var(--space-6)',
      borderBottom: '1px solid var(--color-border-subtle)',
      position: 'sticky', top: 0, zIndex: 10,
      background: 'var(--color-bg-topbar)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          background: '#F8FAFC', border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)', padding: '0 var(--space-3)',
          height: 36, width: 300, color: 'var(--color-text-muted)', fontSize: 13,
        }}>
          <Search size={15} />
          <span>ค้นหาทำเล สาขา หรือบริการ…</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button className="io-interactive" style={{
          width: 36, height: 36, borderRadius: '50%', border: 'none',
          background: 'transparent', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'var(--color-text-secondary)',
        }}>
          <Moon size={17} />
        </button>
        <div style={{ position: 'relative' }}>
          <button className="io-interactive" style={{
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: 'transparent', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'var(--color-text-secondary)',
          }}>
            <Bell size={17} />
          </button>
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--color-electric-purple)',
            border: '2px solid white',
          }} />
        </div>
        <div className="io-interactive" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--gradient-aurora)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 600, fontSize: 13,
          }}>AM</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>Alex Morgan</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Admin</div>
          </div>
          <ChevronDown size={14} color="var(--color-text-muted)" />
        </div>
      </div>
    </header>
  )
}

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
function Sidebar({ step }: { step: number }) {
  const nav = [
    { icon: <BarChart3 size={16} />, label: 'Dashboard' },
    { icon: <Package    size={16} />, label: 'Space Matching', active: true },
    { icon: <Home       size={16} />, label: 'รายการจอง' },
    { icon: <MapPin     size={16} />, label: 'จัดการสาขา' },
  ]
  const steps = ['เลือกทำเล', 'ระบุสิ่งของ', 'ผลการจับคู่']

  return (
    <aside style={{
      width: 'var(--sidebar-width)', flexShrink: 0,
      background: 'var(--gradient-galaxy)',
      display: 'flex', flexDirection: 'column', height: '100vh',
    }}>
      {/* Logo */}
      <div style={{
        height: 'var(--topbar-height)',
        display: 'flex', alignItems: 'center',
        padding: '0 var(--space-6)', gap: 'var(--space-3)',
        borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 'var(--radius-md)',
          background: 'var(--gradient-aurora)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13, color: 'white',
        }}>SM</div>
        <div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>SpaceMatch</div>
          <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 11, marginTop: 1 }}>InnOlistic Platform</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: 'var(--space-4) var(--space-3)', overflowY: 'auto' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.35)', letterSpacing: '.08em', textTransform: 'uppercase', padding: 'var(--space-3) var(--space-3) var(--space-2)' }}>
          Main Menu
        </div>
        {nav.map((n, i) => (
          <div key={i} className="io-interactive" style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            padding: '9px var(--space-3)', borderRadius: 'var(--radius-md)',
            color: n.active ? 'white' : 'rgba(255,255,255,.55)',
            fontSize: 13.5, fontWeight: 500, marginBottom: 2,
            background: n.active ? 'var(--gradient-aurora)' : 'transparent',
            boxShadow: n.active ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
          }}>
            {n.icon}
            <span>{n.label}</span>
          </div>
        ))}

        <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.35)', letterSpacing: '.08em', textTransform: 'uppercase', padding: 'var(--space-5) var(--space-3) var(--space-2)' }}>
          Progress
        </div>
        {steps.map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            padding: '8px var(--space-3)', borderRadius: 'var(--radius-md)',
            color: step === i ? 'white' : 'rgba(255,255,255,.45)',
            fontSize: 12, fontWeight: step === i ? 600 : 400, marginBottom: 2,
            background: step === i ? 'rgba(255,255,255,.08)' : 'transparent',
          }}>
            <span style={{ fontSize: 13 }}>{step > i ? '✅' : step === i ? '▶️' : '⭕'}</span>
            <span>Step {i + 1}: {s}</span>
          </div>
        ))}
      </nav>

      {/* Footer badge */}
      <div style={{ padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(0,229,255,.12)', color: 'var(--color-neon-cyan)',
          fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 'var(--radius-pill)',
        }}>✦ Preview Build</span>
      </div>
    </aside>
  )
}

/* ── StatCard ────────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon, accent = 'plain' }: {
  label: string; value: string; icon: string; accent?: 'aurora' | 'galaxy' | 'plain'
}) {
  const bg = accent === 'aurora' ? 'var(--gradient-aurora)' : accent === 'galaxy' ? 'var(--gradient-galaxy)' : 'var(--color-bg-surface)'
  const isDark = accent !== 'plain'
  return (
    <div className="io-card-hover" style={{
      padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)',
      border: isDark ? 'none' : '1px solid var(--color-border-subtle)',
      background: bg,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: isDark ? 'rgba(255,255,255,.7)' : 'var(--color-text-muted)' }}>{label}</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: isDark ? 'white' : 'var(--color-text-primary)', marginTop: 6 }}>{value}</div>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-md)',
          background: isDark ? 'rgba(255,255,255,.12)' : 'var(--color-accent-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>{icon}</div>
      </div>
    </div>
  )
}

/* ── StepBar ─────────────────────────────────────────────────────────────── */
function StepBar({ step }: { step: number }) {
  const steps = ['เลือกทำเล', 'ระบุสิ่งของ', 'ผลการจับคู่']
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 600,
              background: step === i ? 'var(--gradient-aurora)' : step > i ? '#10B981' : 'var(--color-bg-surface)',
              border: step === i ? 'none' : step > i ? 'none' : '2px solid var(--color-border)',
              color: step >= i ? 'white' : 'var(--color-text-muted)',
              boxShadow: step === i ? '0 4px 14px rgba(124,58,237,.3)' : 'none',
              transition: 'var(--transition-base)',
            }}>
              {step > i ? <Check size={14} /> : i + 1}
            </div>
            <span style={{
              fontSize: 13, fontWeight: step === i ? 600 : 500,
              color: step === i ? 'var(--color-electric-purple)' : step > i ? '#10B981' : 'var(--color-text-muted)',
              whiteSpace: 'nowrap',
            }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: 2, margin: '0 var(--space-3)',
              background: step > i ? '#10B981' : 'var(--color-border)',
              transition: 'var(--transition-base)',
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Surface card ────────────────────────────────────────────────────────── */
function Surface({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border-subtle)', padding: 'var(--space-6) var(--space-8)',
      boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--space-5)',
      transition: 'var(--transition-base)', ...style,
    }}>
      {children}
    </div>
  )
}

/* ── PrimaryButton ───────────────────────────────────────────────────────── */
function PrimaryButton({ children, onClick, disabled, large }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; large?: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: large ? 48 : 40, padding: large ? '0 32px' : '0 20px',
        background: 'var(--gradient-aurora)', border: 'none',
        borderRadius: 'var(--radius-md)', color: 'white',
        fontSize: large ? 15 : 14, fontWeight: 500, fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        boxShadow: hover && !disabled ? '0 8px 22px rgba(124,58,237,0.38)' : '0 4px 14px rgba(124,58,237,0.28)',
        transform: hover && !disabled ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'var(--transition-base)',
        opacity: disabled ? 0.45 : 1,
        whiteSpace: 'nowrap',
      }}>
      {children}
    </button>
  )
}

/* ── SecondaryButton ─────────────────────────────────────────────────────── */
function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: 40, padding: '0 20px',
        background: 'transparent',
        border: hover ? '1.5px solid var(--color-electric-purple)' : '1.5px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        color: hover ? 'var(--color-electric-purple)' : 'var(--color-text-secondary)',
        background: hover ? 'var(--color-accent-soft)' : 'transparent',
        fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
        transition: 'var(--transition-base)',
      } as React.CSSProperties}>
      {children}
    </button>
  )
}

/* ── Step 1: Location ────────────────────────────────────────────────────── */
function Step1({ location, setLocation, onNext }: {
  location: LocationId | null; setLocation: (l: LocationId) => void; onNext: () => void
}) {
  return (
    <div className="fade-in">
      <Surface>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--color-accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={15} color="var(--color-electric-purple)" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 600 }}>เลือกทำเล / สาขา</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)', paddingLeft: 44 }}>
          เลือกสาขาที่ต้องการฝากเก็บของ — ให้บริการ 3 ทำเลกลางกรุงเทพฯ
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
          {LOCATIONS.map(loc => {
            const selected = location === loc.id
            return (
              <div key={loc.id} className="io-card-hover" onClick={() => setLocation(loc.id)}
                style={{
                  border: selected ? '1.5px solid var(--color-electric-purple)' : '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', padding: 'var(--space-5) var(--space-4)',
                  cursor: 'pointer', textAlign: 'center',
                  background: selected ? 'var(--color-accent-soft)' : 'var(--color-bg-surface)',
                  boxShadow: selected ? '0 0 0 3px rgba(124,58,237,.12)' : 'none',
                  position: 'relative',
                }}>
                {selected && (
                  <div style={{
                    position: 'absolute', top: 10, right: 10, width: 20, height: 20,
                    borderRadius: '50%', background: 'var(--gradient-aurora)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Check size={10} color="white" strokeWidth={3} />
                  </div>
                )}
                <div style={{ fontSize: 28, marginBottom: 'var(--space-2)' }}>{loc.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: selected ? 'var(--color-electric-purple)' : 'var(--color-text-primary)' }}>{loc.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>{loc.desc}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3 }}>{loc.address}</div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
          <PrimaryButton large onClick={onNext} disabled={!location}>
            ถัดไป — ระบุสิ่งของ →
          </PrimaryButton>
        </div>
      </Surface>
    </div>
  )
}

/* ── Step 2: Items ───────────────────────────────────────────────────────── */
function Step2({ counts, setCount, onNext, onBack }: {
  counts: Counts; setCount: (id: ItemId, val: number) => void; onNext: () => void; onBack: () => void
}) {
  const totalUnits = useMemo(() => ITEMS.reduce((s, i) => s + i.units * counts[i.id], 0), [counts])
  const tier = getTier(totalUnits)
  const barPct = Math.min((totalUnits / 30) * 100, 100)

  return (
    <div className="fade-in">
      <Surface>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--color-accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={15} color="var(--color-electric-purple)" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 600 }}>ระบุรายละเอียดสิ่งของ</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)', paddingLeft: 44 }}>
          กด + เพื่อเพิ่มจำนวน — ระบบคำนวณขนาดห้องให้อัตโนมัติ
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {ITEMS.map(item => {
            const c = counts[item.id]
            return (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center',
                background: c > 0 ? 'var(--color-accent-soft)' : '#F8FAFC',
                border: c > 0 ? '1px solid rgba(124,58,237,.3)' : '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)', padding: '13px var(--space-5)',
                transition: 'var(--transition-base)',
              }}>
                <span style={{ fontSize: 22, marginRight: 'var(--space-4)', flexShrink: 0 }}>{item.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>
                    {item.name}
                    <span style={{
                      fontSize: 10, fontWeight: 600, marginLeft: 8,
                      background: c > 0 ? 'var(--color-electric-purple)' : 'var(--color-accent-soft)',
                      color: c > 0 ? 'white' : 'var(--color-electric-purple)',
                      padding: '2px 8px', borderRadius: 'var(--radius-pill)',
                    }}>{item.units} unit{item.units > 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{item.hint}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <CounterBtn minus disabled={c === 0} onClick={() => setCount(item.id, c - 1)} />
                  <span style={{ width: 32, textAlign: 'center', fontSize: 16, fontWeight: 600 }}>{c}</span>
                  <CounterBtn onClick={() => setCount(item.id, c + 1)} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Volume bar */}
        <div style={{
          marginTop: 'var(--space-5)', background: '#F8FAFC',
          border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4) var(--space-5)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
            <span>Volume สะสม</span>
            <span style={{ fontWeight: 600, color: 'var(--color-electric-purple)' }}>
              {totalUnits} units {tier ? `→ แนะนำ Size ${tier}` : ''}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 'var(--radius-pill)', background: 'var(--color-border)', overflow: 'hidden', marginBottom: 'var(--space-3)' }}>
            <div style={{ height: '100%', borderRadius: 'var(--radius-pill)', background: 'var(--gradient-aurora)', width: `${barPct}%`, transition: 'width .4s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {TIERS.map(t => (
              <div key={t.id} style={{
                flex: 1, textAlign: 'center', fontSize: 11, fontWeight: 500,
                padding: '4px 6px', borderRadius: 'var(--radius-sm)',
                border: tier === t.id ? 'none' : '1px solid var(--color-border)',
                background: tier === t.id ? 'var(--gradient-aurora)' : 'var(--color-bg-surface)',
                color: tier === t.id ? 'white' : 'var(--color-text-muted)',
                boxShadow: tier === t.id ? '0 2px 8px rgba(124,58,237,.25)' : 'none',
                transition: 'var(--transition-base)',
              }}>
                {t.label} ≤{t.max === Infinity ? '∞' : t.max}u
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
          <SecondaryButton onClick={onBack}>← กลับ</SecondaryButton>
          <PrimaryButton large onClick={onNext} disabled={totalUnits === 0}>ดูผลการจับคู่ →</PrimaryButton>
        </div>
      </Surface>
    </div>
  )
}

/* ── CounterBtn ──────────────────────────────────────────────────────────── */
function CounterBtn({ onClick, disabled, minus }: { onClick: () => void; disabled?: boolean; minus?: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: 32, height: 32, borderRadius: 'var(--radius-md)',
        border: hover && !disabled ? (minus ? '1.5px solid var(--color-electric-purple)' : 'none') : '1.5px solid var(--color-border)',
        background: hover && !disabled ? (minus ? 'var(--color-accent-soft)' : 'var(--gradient-aurora)') : 'var(--color-bg-surface)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 16, color: hover && !disabled ? (minus ? 'var(--color-electric-purple)' : 'white') : 'var(--color-text-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: hover && !disabled && !minus ? '0 4px 14px rgba(124,58,237,.28)' : 'none',
        transform: hover && !disabled ? 'translateY(-2px)' : 'none',
        opacity: disabled ? 0.3 : 1,
        transition: 'var(--transition-base)',
        fontFamily: 'inherit',
      }}>
      {minus ? '−' : '+'}
    </button>
  )
}

/* ── Step 3: Match + Contact ─────────────────────────────────────────────── */
function Step3({ counts, location, onBack, onSubmit }: {
  counts: Counts; location: LocationId; onBack: () => void; onSubmit: (d: SubmitData) => void
}) {
  const totalUnits = useMemo(() => ITEMS.reduce((s, i) => s + i.units * counts[i.id], 0), [counts])
  const recTier = getTier(totalUnits)!
  const [selSize, setSelSize] = useState<SizeId>(recTier)
  const [form, setForm] = useState({ name: '', phone: '', note: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => { setSelSize(recTier) }, [recTier])

  const selTier = TIERS.find(t => t.id === selSize)!
  const loc = LOCATIONS.find(l => l.id === location)!
  const itemSummary = ITEMS.filter(i => counts[i.id] > 0).map(i => `${i.name} ×${counts[i.id]}`).join(' • ')

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'กรุณาระบุชื่อ-นามสกุล'
    if (!form.phone.trim()) e.phone = 'กรุณาระบุเบอร์โทร'
    else if (!/^[0-9]{9,10}$/.test(form.phone.replace(/[-\s]/g, ''))) e.phone = 'รูปแบบเบอร์ไม่ถูกต้อง'
    return e
  }

  function submit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSubmit({ ...form, size: selSize, location, totalUnits })
  }

  return (
    <div className="fade-in">
      {/* Match cards */}
      <Surface>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--color-accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Home size={15} color="var(--color-electric-purple)" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 600 }}>ผลการจับคู่ขนาดห้อง</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)', paddingLeft: 44 }}>
          ระบบเลือกห้องให้อัตโนมัติ — คุณสามารถเปลี่ยนขนาดเองได้
        </p>

        {/* Summary bar */}
        <div style={{
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)',
          background: '#F8FAFC', border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)',
          marginBottom: 'var(--space-5)', fontSize: 13, color: 'var(--color-text-secondary)',
        }}>
          {[`ทำเล: ${loc.name}`, `รวม ${totalUnits} units`, itemSummary].map((t, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-electric-purple)', flexShrink: 0, display: 'inline-block' }} />
              <span dangerouslySetInnerHTML={{ __html: t.replace(/ทำเล:|รวม /g, m => `<strong style="color:var(--color-text-primary)">${m}</strong>`) }} />
            </span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
          {TIERS.map(tier => {
            const isRec = tier.id === recTier
            const isSel = tier.id === selSize
            return (
              <div key={tier.id} className={isSel ? '' : 'io-card-hover'} onClick={() => setSelSize(tier.id)}
                style={{
                  border: isSel ? '1.5px solid var(--color-electric-purple)' : isRec ? '1.5px solid var(--color-electric-purple)' : '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', padding: isRec ? '28px 16px 20px' : '20px 16px',
                  textAlign: 'center', cursor: 'pointer', position: 'relative',
                  background: isSel ? 'var(--color-accent-soft)' : 'var(--color-bg-surface)',
                  boxShadow: isSel ? '0 0 0 3px rgba(124,58,237,.15)' : 'none',
                  transition: 'var(--transition-base)',
                }}>
                {isRec && (
                  <div style={{
                    position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--gradient-aurora)', color: 'white',
                    fontSize: 10, fontWeight: 600, padding: '3px 12px',
                    borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(124,58,237,.3)',
                  }}>⭐ แนะนำสำหรับคุณ</div>
                )}
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-electric-purple)', marginBottom: 2 }}>{tier.label}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>{tier.dim} • {tier.area}</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>฿{tier.price.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>ต่อเดือน</div>
                <div style={{ marginTop: 'var(--space-3)', fontSize: 11.5, color: 'var(--color-text-secondary)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {tier.features.map((f, i) => (
                    <span key={i}><span style={{ color: '#10B981', fontWeight: 700 }}>✓ </span>{f}</span>
                  ))}
                </div>
                {isSel && (
                  <div style={{ marginTop: 'var(--space-3)', fontSize: 12, fontWeight: 600, color: 'var(--color-electric-purple)', background: 'var(--color-accent-soft)', borderRadius: 'var(--radius-sm)', padding: '3px 8px', display: 'inline-block' }}>
                    ✓ เลือกขนาดนี้
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Surface>

      {/* Contact form */}
      <Surface>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--color-accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>📞</div>
          <span style={{ fontSize: 16, fontWeight: 600 }}>กรอกข้อมูลเพื่อให้เจ้าหน้าที่ติดต่อกลับ</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)', paddingLeft: 44 }}>
          ไม่มีค่าใช้จ่ายใดๆ เจ้าหน้าที่จะนัดวันเวลาฝากของกับคุณโดยตรง
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
              ชื่อ-นามสกุล <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <FormInput placeholder="สมชาย ใจดี" value={form.name} onChange={v => { setForm({ ...form, name: v }); setErrors({ ...errors, name: '' }) }} error={errors.name} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
              เบอร์โทรศัพท์ <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <FormInput placeholder="0812345678" value={form.phone} type="tel" onChange={v => { setForm({ ...form, phone: v }); setErrors({ ...errors, phone: '' }) }} error={errors.phone} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>หมายเหตุ (ไม่บังคับ)</label>
            <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
              placeholder="เช่น วันที่ต้องการนำของเข้า หรือข้อมูลพิเศษ"
              style={{
                width: '100%', minHeight: 80, padding: '10px 14px',
                border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                fontFamily: 'inherit', fontSize: 14, resize: 'vertical', outline: 'none',
              }} />
          </div>
        </div>

        {/* Selected summary */}
        <div style={{
          marginTop: 'var(--space-4)', background: 'var(--color-accent-soft)',
          border: '1px solid rgba(124,58,237,.25)', borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-4)', fontSize: 13, color: 'var(--color-electric-purple)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          🏠 สาขา <strong>{loc.name}</strong> — <strong>{selTier.label} ({selTier.dim})</strong>&nbsp;&nbsp;ราคา <strong>฿{selTier.price.toLocaleString()}/เดือน</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
          <SecondaryButton onClick={onBack}>← กลับแก้ไข</SecondaryButton>
          <PrimaryButton large onClick={submit}>📩 ส่งข้อมูลให้เจ้าหน้าที่</PrimaryButton>
        </div>
      </Surface>
    </div>
  )
}

/* ── FormInput ───────────────────────────────────────────────────────────── */
function FormInput({ placeholder, value, onChange, error, type = 'text' }: {
  placeholder: string; value: string; onChange: (v: string) => void; error?: string; type?: string
}) {
  const [focus, setFocus] = useState(false)
  return (
    <div>
      <input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          height: 40, width: '100%', padding: '0 14px',
          border: error ? '1.5px solid #EF4444' : focus ? '1.5px solid var(--color-electric-purple)' : '1.5px solid var(--color-border)',
          borderRadius: 'var(--radius-md)', fontFamily: 'inherit', fontSize: 14,
          outline: 'none',
          boxShadow: focus ? (error ? '0 0 0 3px rgba(239,68,68,.15)' : '0 0 0 3px var(--color-accent-soft)') : 'none',
          transition: 'var(--transition-base)',
        }} />
      {error && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{error}</div>}
    </div>
  )
}

/* ── Success Screen ──────────────────────────────────────────────────────── */
function SuccessScreen({ data, onReset }: { data: SubmitData; onReset: () => void }) {
  const ref = 'SPM-' + Date.now().toString(36).toUpperCase().slice(-6)
  const loc = LOCATIONS.find(l => l.id === data.location)!
  return (
    <Surface style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        animation: 'popIn .4s cubic-bezier(.34,1.56,.64,1)',
      }}>
        <div style={{
          width: 54, height: 54, borderRadius: '50%',
          background: 'linear-gradient(135deg,#10B981,#34D399)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckCircle2 size={28} color="white" />
        </div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>ส่งข้อมูลเรียบร้อยแล้ว!</div>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', maxWidth: 360, margin: '0 auto 24px', lineHeight: 1.7 }}>
        ขอบคุณ <strong>{data.name}</strong> เจ้าหน้าที่จะโทรติดต่อคุณที่ <strong>{data.phone}</strong> ภายใน 1 วันทำการ
      </p>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'var(--color-accent-soft)', border: '1px solid rgba(124,58,237,.3)',
        borderRadius: 'var(--radius-pill)', padding: '8px 20px',
        fontSize: 14, fontWeight: 600, color: 'var(--color-electric-purple)', marginBottom: 12,
      }}>🔖 รหัสอ้างอิง: {ref}</div>
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24 }}>
        สาขา {loc.name} · Size {data.size} · {data.totalUnits} units
      </div>
      <SecondaryButton onClick={onReset}>← เริ่มต้นใหม่</SecondaryButton>
      <style>{`@keyframes popIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }`}</style>
    </Surface>
  )
}

/* ── SpaceMatching Page ──────────────────────────────────────────────────── */
export default function SpaceMatching() {
  const [step, setStep]         = useState(0)
  const [location, setLocation] = useState<LocationId | null>(null)
  const [counts, setCounts]     = useState<Counts>({ ...EMPTY_COUNTS })
  const [done, setDone]         = useState(false)
  const [result, setResult]     = useState<SubmitData | null>(null)

  function setCount(id: ItemId, val: number) {
    setCounts(p => ({ ...p, [id]: Math.max(0, val) }))
  }

  function reset() {
    setStep(0); setLocation(null); setCounts({ ...EMPTY_COUNTS }); setDone(false); setResult(null)
  }

  const totalItems = ITEMS.reduce((s, i) => s + counts[i.id], 0)
  const totalUnits = ITEMS.reduce((s, i) => s + i.units * counts[i.id], 0)
  const tier = getTier(totalUnits)
  const tierData = TIERS.find(t => t.id === tier)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar step={step} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar />
        <main style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-8)', background: '#F8FAFC' }}>
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            {!done && (
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>ระบบฝากเก็บของ — Space Matching</div>
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>เลือกทำเล ระบุสิ่งของ และรับการจับคู่ขนาดห้องที่เหมาะสมภายใน 3 ขั้นตอน</div>
              </div>
            )}

            {!done && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                <StatCard label="ทำเลที่เลือก" value={location ? LOCATIONS.find(l => l.id === location)?.name ?? '—' : '—'} icon="📍" accent="aurora" />
                <StatCard label="จำนวนสิ่งของ" value={`${totalItems} ชิ้น`} icon="📦" />
                <StatCard label="ขนาดแนะนำ" value={tier ? `Size ${tier} — ฿${tierData?.price.toLocaleString()}/เดือน` : '—'} icon="🏠" accent="galaxy" />
              </div>
            )}

            {!done && <StepBar step={step} />}

            {!done && step === 0 && <Step1 location={location} setLocation={l => setLocation(l)} onNext={() => setStep(1)} />}
            {!done && step === 1 && <Step2 counts={counts} setCount={setCount} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
            {!done && step === 2 && location && (
              <Step3 counts={counts} location={location} onBack={() => setStep(1)}
                onSubmit={d => { setResult(d); setDone(true) }} />
            )}
            {done && result && <SuccessScreen data={result} onReset={reset} />}
          </div>
        </main>
      </div>
    </div>
  )
}
