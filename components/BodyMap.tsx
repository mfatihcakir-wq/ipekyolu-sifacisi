'use client'

import { useState } from 'react'

export interface OrganAnaliz {
  isim: string
  durum: 'kritik' | 'dikkat' | 'normal'
  renk: 'red' | 'yellow' | 'green'
  yorum: string
  bitkiler: string[]
  mizac: string
}

interface BodyMapProps {
  organlar: OrganAnaliz[]
}

const DURUM_RENK = {
  red: { fill: '#ef4444', pulse: '#fca5a5', label: 'Kritik', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
  yellow: { fill: '#eab308', pulse: '#fde047', label: 'Dikkat', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
  green: { fill: '#22c55e', pulse: '#86efac', label: 'Normal', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
}

const ORGAN_PATHS: Record<string, { front: string; label: string; cx: number; cy: number }> = {
  beyin: {
    front: 'M140,28 C140,14 152,4 168,4 C184,4 196,14 196,28 L196,48 C196,56 190,62 182,64 L154,64 C146,62 140,56 140,48 Z',
    label: 'Beyin', cx: 168, cy: 34,
  },
  lenf: {
    front: 'M152,68 C152,66 158,64 168,64 C178,64 184,66 184,68 L184,82 C184,88 178,92 168,92 C158,92 152,88 152,82 Z',
    label: 'Boyun/Lenf', cx: 168, cy: 78,
  },
  akciger: {
    front: 'M124,96 L156,96 L156,150 C156,158 146,164 136,164 L124,164 C116,164 110,158 110,150 L110,110 C110,102 116,96 124,96 Z M180,96 L212,96 C220,96 226,102 226,110 L226,150 C226,158 220,164 212,164 L200,164 C190,164 180,158 180,150 Z',
    label: 'Akciğer', cx: 168, cy: 130,
  },
  kalp: {
    front: 'M158,108 C158,102 162,98 168,98 C174,98 178,102 178,108 L178,132 C178,138 174,142 168,142 C162,142 158,138 158,132 Z',
    label: 'Kalp', cx: 168, cy: 120,
  },
  karaciger: {
    front: 'M180,148 L220,148 C226,148 230,154 230,160 L230,186 C230,194 224,200 216,200 L188,200 C182,200 180,196 180,190 Z',
    label: 'Karaciğer', cx: 205, cy: 174,
  },
  mide: {
    front: 'M142,168 L168,168 C176,168 182,174 182,182 L182,204 C182,212 176,218 168,218 L150,218 C142,218 136,212 136,204 L136,182 C136,174 138,168 142,168 Z',
    label: 'Mide', cx: 158, cy: 193,
  },
  bobrek: {
    front: 'M116,178 C116,172 120,168 126,168 L134,168 C138,168 140,172 140,178 L140,200 C140,206 138,210 134,210 L126,210 C120,210 116,206 116,200 Z M196,178 C196,172 200,168 206,168 L214,168 C218,168 220,172 220,178 L220,200 C220,206 218,210 214,210 L206,210 C200,210 196,206 196,200 Z',
    label: 'Böbrek', cx: 168, cy: 189,
  },
  bagirsak: {
    front: 'M136,222 L200,222 C208,222 214,228 214,236 L214,268 C214,276 208,282 200,282 L136,282 C128,282 122,276 122,268 L122,236 C122,228 128,222 136,222 Z',
    label: 'Bağırsak', cx: 168, cy: 252,
  },
  ureme: {
    front: 'M148,286 L188,286 C194,286 198,290 198,296 L198,312 C198,318 194,322 188,322 L148,322 C142,322 138,318 138,312 L138,296 C138,290 142,286 148,286 Z',
    label: 'Üreme', cx: 168, cy: 304,
  },
}

export default function BodyMap({ organlar }: BodyMapProps) {
  const [selected, setSelected] = useState<OrganAnaliz | null>(null)

  function getOrganData(isim: string): OrganAnaliz | undefined {
    return organlar.find((o) => o.isim.toLowerCase() === isim.toLowerCase())
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* SVG Body */}
      <div className="flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4 text-center">Organ Haritası</h3>
          <svg viewBox="60 0 216 380" className="w-[280px] h-[500px] mx-auto">
            {/* Body silhouette */}
            <path
              d="M168,4 C184,4 196,16 196,32 L196,48 C196,56 192,62 186,66 L190,70 L218,92 C228,98 234,110 234,122 L234,170 L240,170 L240,180 L234,180 L234,200 C234,208 228,214 220,218 L226,220 L226,290 C226,310 216,326 200,334 L200,370 L190,370 L190,334 L168,338 L146,334 L146,370 L136,370 L136,334 C120,326 110,310 110,290 L110,220 L116,218 C108,214 102,208 102,200 L102,180 L96,180 L96,170 L102,170 L102,122 C102,110 108,98 118,92 L146,70 L150,66 C144,62 140,56 140,48 L140,32 C140,16 152,4 168,4 Z"
              fill="#e8f5e9"
              stroke="#1B5E3B"
              strokeWidth="1.5"
              opacity="0.4"
            />

            {/* Organs */}
            {Object.entries(ORGAN_PATHS).map(([key, organ]) => {
              const data = getOrganData(key) || getOrganData(organ.label)
              const renk = data ? DURUM_RENK[data.renk] : null
              const isSelected = selected?.isim.toLowerCase() === key || selected?.isim.toLowerCase() === organ.label.toLowerCase()

              return (
                <g key={key} className="cursor-pointer" onClick={() => data && setSelected(data)}>
                  {/* Pulse animation for affected organs */}
                  {renk && (
                    <path
                      d={organ.front}
                      fill={renk.pulse}
                      opacity="0.4"
                    >
                      <animate
                        attributeName="opacity"
                        values="0.4;0.1;0.4"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </path>
                  )}
                  <path
                    d={organ.front}
                    fill={renk ? renk.fill : '#a7f3d0'}
                    stroke={isSelected ? '#1B5E3B' : renk ? renk.fill : '#059669'}
                    strokeWidth={isSelected ? 3 : 1.5}
                    opacity={renk ? 0.85 : 0.3}
                    className="transition-all duration-300 hover:opacity-100"
                  />
                  {/* Label */}
                  {renk && (
                    <text
                      x={organ.cx}
                      y={organ.cy}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[8px] font-bold fill-white pointer-events-none"
                    >
                      {data?.durum === 'kritik' ? '!' : data?.durum === 'dikkat' ? '?' : '✓'}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Legend */}
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" /> Kritik
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-500" /> Dikkat
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-500" /> Normal
            </span>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 min-w-0">
        {selected ? (
          <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${DURUM_RENK[selected.renk].border}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#1B5E3B]">{selected.isim}</h3>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${DURUM_RENK[selected.renk].badge}`}>
                  {DURUM_RENK[selected.renk].label}
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Yorum */}
            <div className="mb-5">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Klasik İslam Tıbbı Yorumu</h4>
              <p className="text-gray-700 text-sm leading-relaxed">{selected.yorum}</p>
            </div>

            {/* Mizaç */}
            <div className="mb-5">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Mizaç Analizi</h4>
              <div className={`p-3 rounded-lg ${DURUM_RENK[selected.renk].bg}`}>
                <p className={`text-sm ${DURUM_RENK[selected.renk].text}`}>{selected.mizac}</p>
              </div>
            </div>

            {/* Bitkiler */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Önerilen Bitkiler</h4>
              <div className="flex flex-wrap gap-2">
                {selected.bitkiler.map((bitki, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-[#1B5E3B]/10 text-[#1B5E3B] rounded-lg text-sm font-medium"
                  >
                    🌿 {bitki}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-400 text-sm">Detay görmek için bir organa tıklayın</p>
          </div>
        )}

        {/* Tüm Organlar Listesi */}
        {organlar.length > 0 && (
          <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Tüm Organlar</h4>
            <div className="space-y-2">
              {organlar.map((organ, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(organ)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-all hover:bg-gray-50 ${
                    selected?.isim === organ.isim ? 'bg-gray-50 ring-1 ring-[#1B5E3B]' : ''
                  }`}
                >
                  <span className="font-medium text-gray-800">{organ.isim}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DURUM_RENK[organ.renk].badge}`}>
                    {DURUM_RENK[organ.renk].label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
