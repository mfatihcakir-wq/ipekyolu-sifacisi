'use client'

import { useState, useRef } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei'
import * as THREE from 'three'

// Hılt (Humoral) renk sistemi
const HILT_COLORS = {
  dem: { color: '#dc2626', label: 'Dem (Kan)', mizac: 'Demevî' },        // Kırmızı
  safra: { color: '#eab308', label: 'Safra', mizac: 'Safravî' },          // Sarı
  balgam: { color: '#3b82f6', label: 'Balgam', mizac: 'Balgamî' },        // Mavi
  sevda: { color: '#6b7280', label: 'Sevda (Kara Safra)', mizac: 'Sevdavî' }, // Gri
}

type Katman = 'organ' | 'kas' | 'kemik' | 'sinir'

export interface OrganBilgi {
  id: string
  isim: string
  hilt: keyof typeof HILT_COLORS
  pozisyon: [number, number, number]
  boyut: [number, number, number] | number
  sekil: 'sphere' | 'box' | 'cylinder'
  katman: Katman
  tahbiz: string
  tedavi: string[]
  mizacYorum: string
}

const ORGANLAR: OrganBilgi[] = [
  // ORGAN KATMANI
  { id: 'beyin', isim: 'Beyin (Dimâğ)', hilt: 'balgam', pozisyon: [0, 3.8, 0], boyut: 0.45, sekil: 'sphere', katman: 'organ',
    tahbiz: 'İbn Sina\'ya göre dimâğ (beyin), ruhun merkezi ve tüm duyuların toplandığı yerdir. Balgamî mizaca sahip olup, soğuk ve nemli tabiatı ile aklı ve hafızayı idare eder.',
    tedavi: ['Misk', 'Amber', 'Akıl Otu', 'Biberiye'],
    mizacYorum: 'Soğuk-nemli mizaç baskın. Balgamî dengesizlik halinde unutkanlık ve uyuşukluk görülür.' },
  { id: 'kalp', isim: 'Kalp (Kalb)', hilt: 'dem', pozisyon: [0.25, 1.6, 0.15], boyut: [0.35, 0.4, 0.3], sekil: 'sphere', katman: 'organ',
    tahbiz: 'Kalp, İslam tıbbında hayatî ruhun (ruh-ı hayvanî) kaynağıdır. Hararet-i garîziyye (doğal ısı) buradan tüm vücuda yayılır. Demevî mizaçlıdır.',
    tedavi: ['Safran', 'Gül Suyu', 'Müşk', 'Sandal'],
    mizacYorum: 'Sıcak-nemli merkez. Dem (kan) üretiminin asıl kaynağı. Kalp hararet ile çalışır.' },
  { id: 'akciger', isim: 'Akciğer (Rie)', hilt: 'balgam', pozisyon: [-0.3, 1.8, 0], boyut: [0.55, 0.5, 0.35], sekil: 'box', katman: 'organ',
    tahbiz: 'Akciğer, nefes (hevâ) ile kalbi serinletir ve fazla harâreti dışarı atar. Balgamî organ olup nemli tabiatı ile solunum fonksiyonunu yürütür.',
    tedavi: ['Oğul Otu', 'Kekik', 'Çörek Otu', 'Ihlamur'],
    mizacYorum: 'Soğuk-nemli yapı. Hava ile doğrudan temas eden organ. Balgam birikmesine en yatkın yapı.' },
  { id: 'akciger_sag', isim: 'Akciğer Sağ', hilt: 'balgam', pozisyon: [0.35, 1.8, 0], boyut: [0.55, 0.5, 0.35], sekil: 'box', katman: 'organ',
    tahbiz: 'Sağ akciğer, sol akciğerle birlikte nefes alışverişini sağlar.',
    tedavi: ['Kekik', 'Ihlamur', 'Adaçayı'],
    mizacYorum: 'Balgamî yapı.' },
  { id: 'karaciger', isim: 'Karaciğer (Kebed)', hilt: 'dem', pozisyon: [0.4, 1.1, 0.1], boyut: [0.5, 0.3, 0.3], sekil: 'box', katman: 'organ',
    tahbiz: 'İbn Sina\'nın el-Kānûn\'unda karaciğer, tabiî ruhun (ruh-ı tabîî) merkezi olarak tanımlanır. Gıdayı kana dönüştüren (hâzıme) asıl organdır.',
    tedavi: ['Deve Dikeni', 'Zerdeçal', 'Karahindiba', 'Enginar'],
    mizacYorum: 'Sıcak-nemli. Kan üretim merkezi. Safra ve dem dengesi burada kurulur.' },
  { id: 'mide', isim: 'Mide (Mi\'de)', hilt: 'safra', pozisyon: [-0.15, 1.0, 0.15], boyut: [0.4, 0.35, 0.3], sekil: 'sphere', katman: 'organ',
    tahbiz: 'Mide, birinci hazım (el-hazm) merkezidir. Gıdayı pişirerek (nüzc) kıvama getirir. Safravî organ olup sıcak tabiatı ile sindirim ateşini barındırır.',
    tedavi: ['Nane', 'Zencefil', 'Rezene', 'Kimyon'],
    mizacYorum: 'Sıcak-kuru. Sindirim ateşi (nâr-ı mi\'de) burada yanar. Safra fazlalığı mide yanmasına neden olur.' },
  { id: 'bobrek_sol', isim: 'Böbrek Sol (Külye)', hilt: 'balgam', pozisyon: [-0.45, 0.8, -0.1], boyut: [0.2, 0.3, 0.18], sekil: 'sphere', katman: 'organ',
    tahbiz: 'Böbrekler, kanı süzerek fazla suyu ve atıkları idrar yoluyla dışarı atar. Balgamî mizaçlıdır.',
    tedavi: ['Maydanoz', 'Civanperçemi', 'Altın Otu'],
    mizacYorum: 'Soğuk-nemli. Su metabolizmasının düzenleyicisi.' },
  { id: 'bobrek_sag', isim: 'Böbrek Sağ', hilt: 'balgam', pozisyon: [0.45, 0.8, -0.1], boyut: [0.2, 0.3, 0.18], sekil: 'sphere', katman: 'organ',
    tahbiz: 'Sağ böbrek, sol böbrekle birlikte çalışır.',
    tedavi: ['Maydanoz', 'Altın Otu'],
    mizacYorum: 'Soğuk-nemli.' },
  { id: 'bagirsak', isim: 'Bağırsak (Em\'â)', hilt: 'sevda', pozisyon: [0, 0.5, 0.1], boyut: [0.55, 0.35, 0.3], sekil: 'box', katman: 'organ',
    tahbiz: 'Bağırsaklar, ikinci ve üçüncü hazım aşamalarını gerçekleştirir. Besinlerin özünü (kîlüs) emer ve atıkları ayrıştırır. Sevdavî yapıdadır.',
    tedavi: ['Sinameki', 'Rezene', 'Papatya', 'Keten Tohumu'],
    mizacYorum: 'Soğuk-kuru. Sevda (kara safra) birikimi kabızlık ve melankoliye yol açar.' },

  // KAS KATMANI
  { id: 'gogus_kasi', isim: 'Göğüs Kası', hilt: 'dem', pozisyon: [0, 1.7, 0.3], boyut: [0.8, 0.4, 0.15], sekil: 'box', katman: 'kas',
    tahbiz: 'Göğüs adaleleri, nefes alışverişinde diyafram ile birlikte çalışır.',
    tedavi: ['Masaj Yağı', 'Okaliptüs'], mizacYorum: 'Sıcak-nemli kas yapısı.' },
  { id: 'karin_kasi', isim: 'Karın Kası', hilt: 'dem', pozisyon: [0, 0.9, 0.3], boyut: [0.7, 0.6, 0.12], sekil: 'box', katman: 'kas',
    tahbiz: 'Karın adaleleri, iç organları korur ve sindirim hareketlerini destekler.',
    tedavi: ['Egzersiz', 'Zencefil Yağı'], mizacYorum: 'Demevî yapı.' },
  { id: 'kol_kasi', isim: 'Kol Kasları', hilt: 'safra', pozisyon: [0.85, 1.5, 0], boyut: [0.18, 0.5, 0.18], sekil: 'cylinder', katman: 'kas',
    tahbiz: 'Kol adaleleri, hareket ve kuvvetin ifadesidir.',
    tedavi: ['Masaj', 'Hareket'], mizacYorum: 'Safravî güç.' },
  { id: 'bacak_kasi', isim: 'Bacak Kasları', hilt: 'safra', pozisyon: [0.25, -0.8, 0], boyut: [0.22, 0.7, 0.22], sekil: 'cylinder', katman: 'kas',
    tahbiz: 'Bacak adaleleri, taşıma ve yürüme fonksiyonunu sağlar.',
    tedavi: ['Yürüyüş', 'Lavanta Yağı'], mizacYorum: 'Safravî yapı.' },

  // KEMİK KATMANI
  { id: 'kafatasi', isim: 'Kafatası', hilt: 'sevda', pozisyon: [0, 3.8, 0], boyut: 0.5, sekil: 'sphere', katman: 'kemik',
    tahbiz: 'Kafatası, beyni dış etkilerden koruyan kemik yapıdır. Sevdavî (soğuk-kuru) tabiatı ile sert ve dayanıklıdır.',
    tedavi: ['Kalsiyum', 'D Vitamini'], mizacYorum: 'Soğuk-kuru. En sert kemik yapı.' },
  { id: 'omurga', isim: 'Omurga (Fıkra)', hilt: 'sevda', pozisyon: [0, 1.5, -0.25], boyut: [0.15, 2.5, 0.15], sekil: 'cylinder', katman: 'kemik',
    tahbiz: 'Omurga, vücudun direği (amûd) olup, omurilik (nuhâ) kanalını barındırır.',
    tedavi: ['Yüzme', 'Çörek Otu Yağı'], mizacYorum: 'Sevdavî. Yapısal sağlamlık.' },
  { id: 'kaburga', isim: 'Kaburgalar', hilt: 'sevda', pozisyon: [0, 1.5, 0], boyut: [0.7, 0.8, 0.4], sekil: 'box', katman: 'kemik',
    tahbiz: 'Kaburgalar, kalp ve akciğerleri çevreleyen koruyucu kafestir.',
    tedavi: ['Kalsiyum', 'Hareket'], mizacYorum: 'Sevdavî koruma yapısı.' },

  // SİNİR KATMANI
  { id: 'sinir_merkezi', isim: 'Merkezi Sinir', hilt: 'balgam', pozisyon: [0, 3.8, 0], boyut: 0.4, sekil: 'sphere', katman: 'sinir',
    tahbiz: 'Nefsânî ruh (ruh-ı nefsânî), beyinden çıkarak sinirler yoluyla tüm vücuda yayılır.',
    tedavi: ['Valerian', 'Pasiflora', 'Melisa'], mizacYorum: 'Balgamî. Sinir iletimi soğuk-nemli ortamda çalışır.' },
  { id: 'sinir_omurga', isim: 'Omurilik Sinirleri', hilt: 'balgam', pozisyon: [0, 1.5, -0.2], boyut: [0.08, 2.2, 0.08], sekil: 'cylinder', katman: 'sinir',
    tahbiz: 'Omurilik sinirleri, beyinden gelen emirleri organlara taşır.',
    tedavi: ['B Vitamini', 'Omega-3'], mizacYorum: 'Balgamî iletim hattı.' },
]

function Organ({ organ, isActive, isHovered, onHover, onClick }: {
  organ: OrganBilgi
  isActive: boolean
  isHovered: boolean
  onHover: (id: string | null) => void
  onClick: (organ: OrganBilgi) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const baseColor = HILT_COLORS[organ.hilt].color

  useFrame((_, delta) => {
    if (!meshRef.current) return
    if (isActive || isHovered) {
      meshRef.current.scale.lerp(new THREE.Vector3(1.08, 1.08, 1.08), delta * 5)
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 5)
    }
  })

  const handleClick = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(organ) }
  const handleOver = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(organ.id); document.body.style.cursor = 'pointer' }
  const handleOut = () => { onHover(null); document.body.style.cursor = 'default' }

  const opacity = isActive ? 1 : isHovered ? 0.9 : 0.7
  const emissiveIntensity = isActive ? 0.4 : isHovered ? 0.25 : 0.05

  return (
    <mesh
      ref={meshRef}
      position={organ.pozisyon}
      onClick={handleClick}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    >
      {organ.sekil === 'sphere' && (
        <sphereGeometry args={[typeof organ.boyut === 'number' ? organ.boyut : organ.boyut[0], 32, 32]} />
      )}
      {organ.sekil === 'box' && (
        <boxGeometry args={organ.boyut as [number, number, number]} />
      )}
      {organ.sekil === 'cylinder' && (
        <cylinderGeometry args={[
          typeof organ.boyut === 'number' ? organ.boyut : organ.boyut[0],
          typeof organ.boyut === 'number' ? organ.boyut : organ.boyut[0],
          typeof organ.boyut === 'number' ? organ.boyut * 2 : organ.boyut[1],
          16
        ]} />
      )}
      <meshStandardMaterial
        color={baseColor}
        transparent
        opacity={opacity}
        emissive={baseColor}
        emissiveIntensity={emissiveIntensity}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  )
}

function BodyFrame() {
  return (
    <group>
      {/* Baş */}
      <mesh position={[0, 3.8, 0]}>
        <sphereGeometry args={[0.48, 32, 32]} />
        <meshStandardMaterial color="#e8f5e9" transparent opacity={0.15} wireframe />
      </mesh>
      {/* Boyun */}
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.3, 16]} />
        <meshStandardMaterial color="#e8f5e9" transparent opacity={0.1} wireframe />
      </mesh>
      {/* Gövde */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.55, 0.45, 2.8, 16]} />
        <meshStandardMaterial color="#e8f5e9" transparent opacity={0.08} wireframe />
      </mesh>
      {/* Kollar */}
      <mesh position={[-0.85, 1.5, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.12, 0.1, 1.8, 12]} />
        <meshStandardMaterial color="#e8f5e9" transparent opacity={0.08} wireframe />
      </mesh>
      <mesh position={[0.85, 1.5, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.12, 0.1, 1.8, 12]} />
        <meshStandardMaterial color="#e8f5e9" transparent opacity={0.08} wireframe />
      </mesh>
      {/* Bacaklar */}
      <mesh position={[-0.25, -0.8, 0]}>
        <cylinderGeometry args={[0.18, 0.14, 2, 12]} />
        <meshStandardMaterial color="#e8f5e9" transparent opacity={0.08} wireframe />
      </mesh>
      <mesh position={[0.25, -0.8, 0]}>
        <cylinderGeometry args={[0.18, 0.14, 2, 12]} />
        <meshStandardMaterial color="#e8f5e9" transparent opacity={0.08} wireframe />
      </mesh>
    </group>
  )
}

function Scene({ katman, onSelect, selectedId }: {
  katman: Katman
  onSelect: (organ: OrganBilgi) => void
  selectedId: string | null
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const filtered = ORGANLAR.filter(o => o.katman === katman)

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} />
      <Environment preset="studio" />
      <BodyFrame />
      {filtered.map(organ => (
        <Organ
          key={organ.id}
          organ={organ}
          isActive={selectedId === organ.id}
          isHovered={hoveredId === organ.id}
          onHover={setHoveredId}
          onClick={onSelect}
        />
      ))}
      <ContactShadows position={[0, -1.9, 0]} opacity={0.3} blur={2} />
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={12}
        target={[0, 1.5, 0]}
      />
      {/* Hovered label */}
      {hoveredId && (() => {
        const organ = ORGANLAR.find(o => o.id === hoveredId)
        if (!organ) return null
        return (
          <Text
            position={[organ.pozisyon[0], organ.pozisyon[1] + 0.5, organ.pozisyon[2]]}
            fontSize={0.15}
            color="#1B5E3B"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.02}
            outlineColor="white"
          >
            {organ.isim}
          </Text>
        )
      })()}
    </>
  )
}

const KATMANLAR: { id: Katman; label: string; icon: string }[] = [
  { id: 'organ', label: 'Organlar', icon: '🫀' },
  { id: 'kas', label: 'Kaslar', icon: '💪' },
  { id: 'kemik', label: 'Kemikler', icon: '🦴' },
  { id: 'sinir', label: 'Sinirler', icon: '🧠' },
]

export default function AnatomyViewer() {
  const [katman, setKatman] = useState<Katman>('organ')
  const [selected, setSelected] = useState<OrganBilgi | null>(null)

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      {/* Sol Panel — Katman Seçici */}
      <div className="lg:w-48 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Katmanlar</h3>
          <div className="space-y-1">
            {KATMANLAR.map(k => (
              <button
                key={k.id}
                onClick={() => { setKatman(k.id); setSelected(null) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  katman === k.id
                    ? 'bg-[#1B5E3B] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{k.icon}</span>
                {k.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hılt Renk Kodları */}
        <div className="bg-white rounded-xl shadow-sm p-4 mt-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Hılt Sistemi</h3>
          <div className="space-y-2">
            {Object.entries(HILT_COLORS).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: val.color }} />
                <span className="text-gray-700">{val.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orta — 3D Viewer */}
      <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        <Canvas camera={{ position: [0, 2, 6], fov: 45 }}>
          <Scene katman={katman} onSelect={setSelected} selectedId={selected?.id || null} />
        </Canvas>
      </div>

      {/* Sağ Panel — Detay */}
      <div className="lg:w-80 flex-shrink-0">
        {selected ? (
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1B5E3B]">{selected.isim}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: HILT_COLORS[selected.hilt].color }} />
              <span className="text-sm font-medium" style={{ color: HILT_COLORS[selected.hilt].color }}>
                {HILT_COLORS[selected.hilt].label} — {HILT_COLORS[selected.hilt].mizac}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{"Tahbîzü'l-Mathûn"}</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{selected.tahbiz}</p>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Mizaç Yorumu</h4>
              <div className="p-3 rounded-lg" style={{ backgroundColor: HILT_COLORS[selected.hilt].color + '15' }}>
                <p className="text-sm" style={{ color: HILT_COLORS[selected.hilt].color }}>{selected.mizacYorum}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Tedavi Bitkileri</h4>
              <div className="flex flex-wrap gap-1.5">
                {selected.tedavi.map((bitki, i) => (
                  <span key={i} className="px-2.5 py-1 bg-[#1B5E3B]/10 text-[#1B5E3B] rounded-md text-xs font-medium">
                    🌿 {bitki}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-3xl mb-3">🔬</p>
            <p className="text-gray-500 text-sm">Detay görmek için bir organa tıklayın</p>
            <p className="text-gray-400 text-xs mt-2">Fareyi sürükleyerek modeli döndürebilirsiniz</p>
          </div>
        )}
      </div>
    </div>
  )
}
