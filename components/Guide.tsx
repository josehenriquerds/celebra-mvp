import Image from 'next/image'
import React from 'react'
import ChecklistJourney from './ChecklistJourney'

const Guide = () => {
  return (
    <section className="flexCenter flex-col">
      <div className="padding-container max-container w-full pb-24">
        <p className="uppercase regular-18 -mt-1 mb-3 text-[#AFCFA3]">
          Nós estamos aqui para te ajudar
        </p>
        <div className="flex flex-wrap justify-between gap-5 lg:gap-10">
          <h2 className="bold-40 lg:bold-64 xl:max-w-[500px] text-[#F2B7B6]">Guiamos seu evento passo a passo</h2>
          <p className="regular-16 text-gray-30 xl:max-w-[600px]">    O Celebre nasceu da vontade de tornar cada evento inesquecível — não só para quem organiza, mas para todos que participam.
    Criado por pessoas apaixonadas por tecnologia e por celebrar a vida, desenvolvemos uma plataforma que une praticidade, beleza e emoção.

    Com inteligência artificial, o Celebre ajuda você a planejar, lembrar e até sugerir ideias com base nas suas escolhas. 
    Tudo isso com integração total ao WhatsApp, para que você se comunique de forma natural.

    O Celebre é feito para todos os públicos — simples de usar, completo em recursos, e sempre com o objetivo de tornar o seu evento mais leve, organizado e inesquecível.</p>
        </div>
      </div>

      <div className="flexCenter max-container relative w-full">

       <ChecklistJourney />
      </div>
    </section>
  )
}

export default Guide