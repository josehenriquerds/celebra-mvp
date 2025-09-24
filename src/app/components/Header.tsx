'use client'

import Image from 'next/image'

export default function Header() {
  return (
    <header className="fixed top-0 left-64 right-0 h-20 px-8 flex items-center justify-between bg-[#FFF9F6] border-b border-[#EDE6DE] z-10">
      <div>
        {/* Espaço para título da página, se necessário */}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-[#6B5E57]">Ana & João</span>
        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E0D4C9]">
          <Image
            src="/avatars/noiva-noivo.png"
            alt="Avatar do casal"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
      </div>
    </header>
  )
}
