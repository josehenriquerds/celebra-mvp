'use client'

import Image from 'next/image'

export default function Header() {
  return (
    <header className="fixed left-64 right-0 top-0 z-10 flex h-20 items-center justify-between border-b border-[#EDE6DE] bg-[#FFF9F6] px-8">
      <div>{/* Espaço para título da página, se necessário */}</div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-[#6B5E57]">Ana & João</span>
        <div className="h-10 w-10 overflow-hidden rounded-full border border-[#E0D4C9]">
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
