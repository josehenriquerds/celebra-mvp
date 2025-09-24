'use client'

import {
  HandCoins,
  Diamond,
  Sparkle,
  Martini,
  PartyPopper,
  Cake,
} from 'lucide-react'

const PRICING = [
  {
    title: 'Plano Gratuito',
    icon: PartyPopper,
    price: 'R$ 0',
    features: [
      'Acesso limitado',
      'Convites básicos',
      'Suporte comunitário',
    ],
    highlight: false,
  },
  {
    title: 'Plano Essencial',
    icon: Cake,
    price: 'R$ 29/mês',
    features: [
      'Acesso completo aos convites',
      'Designs personalizados',
      'Suporte por e-mail',
    ],
    highlight: true,
  },
  {
    title: 'Plano Premium',
    icon: Martini,
    price: 'R$ 59/mês',
    features: [
      'Tudo no plano Essencial',
      'Página de evento personalizada',
      'Suporte prioritário',
    ],
    highlight: false,
  },
]

const Pricing = () => {
  return (
    <section className="flex-col flexCenter overflow-hidden  py-24">
      <div className="max-container padding-container relative w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-semibold text-[#F2B7B6]">Planos e Benefícios</h1>
          <p className="mt-4 text-gray-500">Escolha o plano ideal para o seu evento</p>
        </div>

        <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {PRICING.map((plan, index) => (
            <PricingCard key={index} {...plan} />
          ))}
        </ul>
      </div>
    </section>
  )
}

type PricingItemProps = {
  title: string
  icon: React.ElementType
  price: string
  features: string[]
  highlight?: boolean
}

const PricingCard = ({ title, icon: Icon, price, features, highlight }: PricingItemProps) => {
  return (
    <li
      className={`flex flex-col justify-between rounded-3xl p-8 shadow-sm transition-all ${
        highlight
          ? 'border-4 border-[#F2B7B6] shadow-lg scale-105 '
          : 'bg-white border border-[#F2F2F2]'
      }`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="rounded-full p-4 bg-[#F2B7B6]">
          <Icon size={28} className="text-white" />
        </div>
        <h3 className="text-xl font-semibold text-[#F2B7B6]">{title}</h3>
      </div>

      <p className="text-2xl font-bold text-[#DFB9B6] mb-6">{price}</p>

      <ul className="text-gray-600 text-sm space-y-2 mb-6">
        {features.map((feature, idx) => (
          <li key={idx}>• {feature}</li>
        ))}
      </ul>

      <button
        className={`mt-auto w-full py-3 rounded-lg font-medium text-sm transition ${
          highlight
            ? 'bg-[#F2B7B6] text-white hover:bg-[#e39b9a]'
            : 'border border-[#DFB9B6] text-[#DFB9B6] hover:bg-[#fef2f2]'
        }`}
      >
        {highlight ? 'Começar agora' : 'Selecionar plano'}
      </button>
    </li>
  )
}

export default Pricing
