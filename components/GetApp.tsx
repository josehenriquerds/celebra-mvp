import React from 'react'
import Button from './Button'
import Image from 'next/image'
import CelebrateButton from './CelebrateButton'

const GetApp = () => {
  return (
    <section className="flexCenter w-full flex-col pb-[100px]">
      <div className="get-app">
        <div className="z-20 flex w-full flex-1 flex-col items-start justify-center gap-12">
          <h2 className="bold-40 lg:bold-64 xl:max-w-[500px]">Começe a Celebrar agora mesmo!</h2>
          {/* <p className="regular-16 text-gray-10">Entre em contato conosco</p> */}
          <div className="flex w-full flex-col gap-3 whitespace-nowrap xl:flex-row">
            <CelebrateButton/>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end">
          <Image src="/phones1.png" alt="phones" width={450} height={700} />
        </div>
      </div>
    </section>
  )
}

export default GetApp