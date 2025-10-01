'use client'
import FAQAccordion from '@/app/components/landing2/FAQSection'
import { motion } from 'framer-motion'
import Head from 'next/head'
import { MessageCircle, Gift, BookText, CheckCircle, Infinity, LayoutDashboard } from 'lucide-react'
import Image from 'next/image'

const features = [
  {
    icon: MessageCircle,
    title: 'Convites pelo WhatsApp',
    desc: 'Crie e envie convites sofisticados diretamente pelo WhatsApp com respostas instantâneas.',
  },
  {
    icon: Gift,
    title: 'Lista de Presentes Integrada',
    desc: 'Permita que seus convidados escolham presentes com facilidade (taxa de 3%).',
  },
  {
    icon: BookText,
    title: 'Mural de Recados e Fotos',
    desc: 'Capture memórias com mensagens e fotos compartilhadas pelos convidados.',
  },
  {
    icon: CheckCircle,
    title: 'RSVP Automático',
    desc: 'Gerencie confirmações em tempo real com lembretes automáticos.',
  },
  {
    icon: Infinity,
    title: 'Convidados Ilimitados',
    desc: 'Convide quantas pessoas desejar, sem custos adicionais.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard Centralizado',
    desc: 'Organize todos os detalhes do evento em uma interface elegante.',
  },
]

export default function Home() {
  return (
    <>
      <Head>
        <title>Celebre: Planeje Eventos com Sofisticação</title>
        <meta
          name="description"
          content="Planeje casamentos e eventos com convites pelo WhatsApp, RSVP automático, lista de presentes integrada e mural de memórias. Comece grátis com a Celebre!"
        />
        <meta
          name="keywords"
          content="planejamento de eventos, casamentos, convites WhatsApp, RSVP automático, lista de presentes, mural de fotos, celebrações"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://www.ecelebre.com.br/" />
        <meta property="og:title" content="Celebre: Planeje Eventos com Sofisticação" />
        <meta
          property="og:description"
          content="Crie convites pelo WhatsApp, gerencie RSVPs, listas de presentes e memórias com a Celebre. Ideal para casamentos e eventos. Comece grátis!"
        />
        <meta property="og:image" content="https://www.ecelebre.com.br/images/og-image.jpg" />
        <meta property="og:url" content="https://www.ecelebre.com.br/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Celebre: Planeje Eventos com Sofisticação" />
        <meta
          name="twitter:description"
          content="Crie convites pelo WhatsApp, gerencie RSVPs, listas de presentes e memórias com a Celebre. Ideal para casamentos e eventos. Comece grátis!"
        />
        <meta name="twitter:image" content="https://www.ecelebre.com.br/images/og-image.jpg" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Celebre',
            url: 'https://www.ecelebre.com.br',
            description:
              'Plataforma para planejar eventos com convites pelo WhatsApp, RSVP automático, lista de presentes e mural de fotos.',
          })}
        </script>
      </Head>
      <main className="font-inter min-h-screen bg-white text-gray-900">
        {/* Header */}
        <header className="fixed left-0 top-0 z-50 w-full bg-white/95 shadow-sm backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 md:py-6 lg:px-8">
            <h1 className="font-[Playfair Display] text-2xl font-bold tracking-tight text-[#FCDAC9] sm:text-3xl">
              <a href="/">Celebre</a>
            </h1>
            <nav className="hidden gap-6 text-base font-medium md:flex lg:gap-8 lg:text-lg">
              <a href="/" className="transition-colors hover:text-[#FCDAC9]">
                Home
              </a>
              <a href="#features" className="transition-colors hover:text-[#FCDAC9]">
                Funcionalidades
              </a>
              <a href="#pricing" className="transition-colors hover:text-[#FCDAC9]">
                Planos
              </a>
              <a href="#faq" className="transition-colors hover:text-[#FCDAC9]">
                Contato
              </a>
            </nav>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden rounded-full bg-[#DAC9FB] px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#C9FBDA] sm:block sm:px-6 sm:text-base"
            >
              Entrar
            </motion.button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#FCDAC9] via-[#DAC9FB] to-[#C9FBDA] px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-24 lg:px-8 lg:pb-32">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 lg:flex-row lg:gap-12">
            <motion.div
              className="w-full text-center lg:w-1/2 lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <h1 className="font-[Playfair Display] mb-4 text-3xl font-bold leading-tight text-gray-900 sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
                Celebre,
              </h1>
              <p className="mx-auto mb-6 max-w-2xl text-base text-gray-700 sm:mb-8 sm:text-lg lg:mx-0 lg:text-xl">
                Planeje eventos memoráveis com convites pelo WhatsApp, RSVP automático, listas de
                presentes e um mural interativo, tudo em um só lugar.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full bg-[#C9FBDA] px-6 py-3 text-sm font-semibold text-gray-900 shadow-lg transition-all duration-300 hover:bg-[#FCDAC9] sm:px-8 sm:py-4 sm:text-base"
              >
                Comece Grátis
              </motion.button>
            </motion.div>
            <motion.div
              className="mt-8 flex w-full justify-center lg:mt-0 lg:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl">
                <Image
                  src="/illustrations/celebrecasamento.png"
                  width={800}
                  height={700}
                  alt="Convite elegante pelo WhatsApp com Celebre"
                  className="h-auto w-full rounded-lg object-cover"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Metrics */}
        <section className="bg-[#FCDAC9]/20 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <h2 className="font-[Playfair Display] mb-8 text-center text-2xl font-bold text-gray-900 sm:mb-12 sm:text-3xl lg:text-4xl">
            Nossa História
          </h2>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {[
              { value: '17+', label: 'Clientes Ativos' },
              { value: 'Junte-se', label: 'À nossa comunidade de eventos incríveis' },
              { value: '100%', label: 'Eventos Memoráveis' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="rounded-xl border border-[#DAC9FB]/30 bg-white p-6 shadow-md sm:p-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: 'easeOut' }}
                viewport={{ once: true }}
              >
                <div className="text-2xl font-bold text-[#DAC9FB] sm:text-3xl lg:text-4xl">
                  {item.value}
                </div>
                <div className="mt-2 text-sm text-gray-700 sm:mt-3 sm:text-base">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Como Funciona */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="font-[Playfair Display] mb-12 text-center text-4xl font-bold text-gray-900">
            Como a Celebre Transforma seus Eventos
          </h2>
          <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <h3 className="mb-6 text-2xl font-semibold text-[#DAC9FB]">
                Para Anfitriões: Tudo Simplificado
              </h3>
              <ol className="space-y-6 text-lg text-gray-700">
                {[
                  'Crie eventos em minutos com um dashboard intuitivo.',
                  'Envie convites elegantes pelo WhatsApp com um clique.',
                  'Gerencie RSVPs e listas de presentes em tempo real.',
                  'Crie memórias com um mural de fotos e recados.',
                ].map((text, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-4 mt-1 inline-block h-8 w-8 rounded-full bg-[#C9FBDA] text-center font-bold text-gray-900">
                      {i + 1}
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col items-center rounded-xl bg-[#FCDAC9]/20 p-8 shadow-lg">
                <div className="mb-6 h-40 w-64 rounded-md bg-gray-200" />
                <p className="text-center text-base font-medium text-gray-700">
                  Organize com sofisticação e praticidade
                </p>
              </div>
            </motion.div>
          </div>
          <div className="mt-12 text-center">
            <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-700">
              Para convidados, é simples: receba convites, confirme presença e escolha presentes
              diretamente no WhatsApp.
            </p>
            {/* <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#DAC9FB] text-white px-8 py-3 rounded-full font-semibold shadow-md hover:bg-[#C9FBDA] transition-all duration-300"
            >
              Saiba Mais
            </motion.button> */}
          </div>
        </section>

        {/* Benefícios Principais */}
        <section id="features" className="bg-[#C9FBDA]/20 px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="font-[Playfair Display] mb-12 text-center text-4xl font-bold text-gray-900">
            Ferramentas para Eventos Memoráveis
          </h2>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                className="rounded-xl border border-[#FCDAC9]/30 bg-white p-6 text-center shadow-md"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
                viewport={{ once: true }}
              >
                <feat.icon className="mx-auto mb-4 h-8 w-8 text-[#DAC9FB]" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">{feat.title}</h3>
                <p className="text-sm text-gray-600">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Market Opportunity */}
        <section className="bg-[#FCDAC9]/20 px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="font-[Playfair Display] mb-12 text-center text-4xl font-bold text-gray-900">
            Uma Nova Era para Eventos
          </h2>
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-8 text-lg leading-relaxed text-gray-700">
              Com 17 clientes ativos e milhares de eventos realizados anualmente no Brasil (IBGE), a
              Celebre está revolucionando o planejamento de eventos. Expandimos para aniversários,
              formaturas e eventos corporativos, com templates multiculturais e personalização
              white-label para cerimonialistas.
            </p>
            {/* <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#C9FBDA] text-gray-900 px-8 py-3 rounded-full font-semibold shadow-md hover:bg-[#DAC9FB] transition-all duration-300"
            >
              Junte-se a Nós
            </motion.button> */}
          </div>
        </section>

        {/* Partnerships and Gift List */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="font-[Playfair Display] mb-12 text-center text-4xl font-bold text-gray-900">
            Parcerias e Benefícios
          </h2>
          <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <h3 className="mb-4 text-2xl font-semibold text-[#DAC9FB]">Lista de Presentes</h3>
              <p className="mb-6 text-base text-gray-700">
                Ofereça uma lista de presentes integrada diretamente no WhatsApp, com uma taxa de
                apenas 3% para presentes digitais.
              </p>
              <p className="text-base font-medium text-gray-700">
                Ideal para casamentos, chás de bebê e eventos especiais.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <h3 className="mb-4 text-2xl font-semibold text-[#DAC9FB]">
                Parcerias com Cerimonialistas
              </h3>
              <p className="mb-6 text-base text-gray-700">
                Colabore com nossa plataforma white-label para oferecer uma experiência
                personalizada aos seus clientes.
              </p>
              <p className="text-base font-medium text-gray-700">
                Eleve seus eventos com a Celebre.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ & Lead Magnet */}
        <section className="bg-[#C9FBDA]/20 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2">
            <FAQAccordion />
            <motion.div
              className="flex flex-col items-center rounded-xl border border-[#FCDAC9]/30 bg-white p-8 shadow-md"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <h2 className="font-[Playfair Display] mb-6 text-center text-2xl font-bold text-[#DAC9FB]">
                Baixe o Checklist Perfeito
              </h2>
              <input
                id="email"
                className="mb-4 w-full rounded-lg border border-[#FCDAC9]/50 p-4 outline-none focus:ring-2 focus:ring-[#DAC9FB]"
                placeholder="Seu e-mail"
                type="email"
                autoComplete="email"
              />
              {/* <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#DAC9FB] text-white py-3 w-full rounded-full font-semibold shadow-md hover:bg-[#C9FBDA] transition-all duration-300"
              >
                Baixe Grátis
              </motion.button> */}
            </motion.div>
          </div>
        </section>

        {/* Planos & Preços */}
        <section id="pricing" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="font-[Playfair Display] mb-12 text-center text-4xl font-bold text-gray-900">
            Escolha seu Plano
          </h2>
          <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                name: 'Gratuito',
                price: 'R$ 0',
                bullets: [
                  '50 convites',
                  'Funcionalidades básicas',
                  'Taxa de 3% na lista de presentes',
                ],
              },
              {
                name: 'Profissional',
                price: 'R$ 69/mês',
                bullets: [
                  'Convidados ilimitados',
                  'Templates premium',
                  'Taxa de 3% na lista de presentes',
                  'Suporte prioritário',
                ],
              },
              {
                name: 'Enterprise',
                price: 'R$ 149/mês',
                bullets: [
                  'Convidados ilimitados',
                  'White-label para marcas',
                  'Parcerias com cerimonialistas',
                  'Suporte 24/7',
                ],
              },
            ].map((plan, idx) => (
              <motion.div
                key={plan.name}
                className={`rounded-xl border border-[#DAC9FB]/30 bg-[#FCDAC9]/20 p-8 shadow-md transition-shadow duration-300 hover:shadow-lg ${
                  idx === 1 ? 'border-2 border-[#C9FBDA]' : ''
                }`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: 'easeOut' }}
                viewport={{ once: true }}
              >
                <h3 className="mb-3 text-xl font-semibold text-[#DAC9FB]">{plan.name}</h3>
                <div className="mb-4 text-3xl font-bold text-gray-900">{plan.price}</div>
                <ul className="mb-6 space-y-3 text-center text-base text-gray-700">
                  {plan.bullets.map((b, i) => (
                    <li key={i} className="flex items-center justify-center">
                      <span className="mr-2 text-[#C9FBDA]">✓</span> {b}
                    </li>
                  ))}
                </ul>
                {/* <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#C9FBDA] text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-[#DAC9FB] transition-all duration-300"
                >
                  Assinar
                </motion.button> */}
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section className="bg-[#DAC9FB]/20 px-4 py-24 text-center sm:px-6 lg:px-8">
          <motion.h2
            className="font-[Playfair Display] mb-8 text-4xl font-bold text-gray-900"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            Crie Eventos Inesquecíveis
          </motion.h2>
          <motion.p
            className="mx-auto mb-8 max-w-2xl text-lg text-gray-700"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            Transforme suas celebrações com a simplicidade e elegância da Celebre. Comece agora!
          </motion.p>
          {/* <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#C9FBDA] text-gray-900 py-4 px-10 text-xl rounded-full font-semibold hover:bg-[#FCDAC9] transition-all duration-300 shadow-md"
          >
            Comece Grátis
          </motion.button> */}
        </section>

        {/* Footer */}
        <footer className="border-t border-[#FCDAC9]/30 bg-white/95 px-4 py-12 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-4">
            <div className="flex flex-col items-center md:items-start">
              <div className="mb-2 flex items-center gap-3">
                <span className="font-[Playfair Display] text-2xl font-bold text-[#DAC9FB]">
                  Celebre
                </span>
                <span className="text-2xl text-[#C9FBDA]">●</span>
                <span className="text-lg text-[#FCDAC9]">●</span>
              </div>
              <p className="text-sm font-semibold text-[#DAC9FB] opacity-80">
                Simplifique. Celebre. Conecte.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 md:items-start">
              <span className="mb-2 font-semibold text-[#DAC9FB]">Navegação</span>
              <a href="/sobre" className="transition-colors hover:text-[#C9FBDA]">
                Sobre
              </a>
              <a href="/blog" className="transition-colors hover:text-[#C9FBDA]">
                Blog
              </a>
              <a href="#faq" className="transition-colors hover:text-[#C9FBDA]">
                Contato
              </a>
              <a href="/termos" className="transition-colors hover:text-[#C9FBDA]">
                Termos
              </a>
              <a href="/privacidade" className="transition-colors hover:text-[#C9FBDA]">
                Privacidade
              </a>
            </div>
            <div className="flex flex-col items-center gap-2 md:items-start">
              <span className="mb-2 font-semibold text-[#DAC9FB]">Contato</span>
              <a href="tel:+5527996843742" className="transition-colors hover:text-[#C9FBDA]">
                +55 27 99684-3742
              </a>
              <a href="tel:+5527997109712" className="transition-colors hover:text-[#C9FBDA]">
                +55 27 99710-9712
              </a>
              <a
                href="https://www.ecelebre.com.br"
                className="transition-colors hover:text-[#C9FBDA]"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.ecelebre.com.br
              </a>
            </div>
            {/* <div className="flex flex-col items-center md:items-start gap-2">
              <span className="font-semibold text-[#DAC9FB] mb-2">Redes Sociais</span>
              <div className="flex gap-4">
                <a
                  href="https://x.com/celebreapp"
                  aria-label="Celebre no X"
                  className="hover:text-[#C9FBDA] text-xl"
                >
                  X
                </a>
                <a
                  href="https://instagram.com/celebreapp"
                  aria-label="Celebre no Instagram"
                  className="hover:text-[#C9FBDA] text-xl"
                >
                  Instagram
                </a>
                <a
                  href="https://facebook.com/celebreapp"
                  aria-label="Celebre no Facebook"
                  className="hover:text-[#C9FBDA] text-xl"
                >
                  Facebook
                </a>
              </div>
            </div> */}
          </div>
          <div className="mt-10 text-center text-sm text-[#DAC9FB]/60">
            © 2025 Celebre Eventos. Todos os direitos reservados.
          </div>
        </footer>
      </main>
    </>
  )
}
