'use client'

import dynamic from 'next/dynamic'

const AnatomyViewer = dynamic(() => import('@/components/AnatomyViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-4 border-[#1B5E3B] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">3D Anatomi Atlas yükleniyor...</p>
      </div>
    </div>
  ),
})

export default function AtlasPage() {
  return (
    <>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-[#1B5E3B]">Anatomi Atlas</h2>
        <p className="text-sm text-gray-500 mt-1">
          3D interaktif insan anatomisi — Klasik İslam tıbbı perspektifi
        </p>
      </div>
      <AnatomyViewer />
    </>
  )
}
