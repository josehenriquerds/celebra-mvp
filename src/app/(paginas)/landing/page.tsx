"use client";
import FAQAccordion from "@/app/components/landing2/FAQSection";
import { motion } from "framer-motion";
import Head from "next/head";
import {
  MessageCircle,
  Gift,
  BookText,
  CheckCircle,
  Infinity,
  LayoutDashboard,
} from "lucide-react";
import Image from 'next/image';


const features = [
  {
    icon: MessageCircle,
    title: "Convites pelo WhatsApp",
    desc: "Crie e envie convites sofisticados diretamente pelo WhatsApp com respostas instantâneas.",
  },
  {
    icon: Gift,
    title: "Lista de Presentes Integrada",
    desc: "Permita que seus convidados escolham presentes com facilidade (taxa de 3%).",
  },
  {
    icon: BookText,
    title: "Mural de Recados e Fotos",
    desc: "Capture memórias com mensagens e fotos compartilhadas pelos convidados.",
  },
  {
    icon: CheckCircle,
    title: "RSVP Automático",
    desc: "Gerencie confirmações em tempo real com lembretes automáticos.",
  },
  {
    icon: Infinity,
    title: "Convidados Ilimitados",
    desc: "Convide quantas pessoas desejar, sem custos adicionais.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Centralizado",
    desc: "Organize todos os detalhes do evento em uma interface elegante.",
  },
];

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
        <meta
          property="og:title"
          content="Celebre: Planeje Eventos com Sofisticação"
        />
        <meta
          property="og:description"
          content="Crie convites pelo WhatsApp, gerencie RSVPs, listas de presentes e memórias com a Celebre. Ideal para casamentos e eventos. Comece grátis!"
        />
        <meta
          property="og:image"
          content="https://www.ecelebre.com.br/images/og-image.jpg"
        />
        <meta property="og:url" content="https://www.ecelebre.com.br/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Celebre: Planeje Eventos com Sofisticação"
        />
        <meta
          name="twitter:description"
          content="Crie convites pelo WhatsApp, gerencie RSVPs, listas de presentes e memórias com a Celebre. Ideal para casamentos e eventos. Comece grátis!"
        />
        <meta
          name="twitter:image"
          content="https://www.ecelebre.com.br/images/og-image.jpg"
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Celebre",
            url: "https://www.ecelebre.com.br",
            description:
              "Plataforma para planejar eventos com convites pelo WhatsApp, RSVP automático, lista de presentes e mural de fotos.",
          })}
        </script>
      </Head>
      <main className="font-inter bg-white min-h-screen text-gray-900">
        {/* Header */}
        <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 flex items-center justify-between">
            <h1 className="font-[Playfair Display] text-2xl sm:text-3xl font-bold text-[#FCDAC9] tracking-tight">
              <a href="/">Celebre</a>
            </h1>
            <nav className="hidden md:flex gap-6 lg:gap-8 text-base lg:text-lg font-medium">
              <a href="/" className="hover:text-[#FCDAC9] transition-colors">
                Home
              </a>
              <a href="#features" className="hover:text-[#FCDAC9] transition-colors">
                Funcionalidades
              </a>
              <a href="#pricing" className="hover:text-[#FCDAC9] transition-colors">
                Planos
              </a>
              <a href="#faq" className="hover:text-[#FCDAC9] transition-colors">
                Contato
              </a>
            </nav>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:block bg-[#DAC9FB] text-white px-4 sm:px-6 py-2 rounded-full font-semibold shadow-md hover:bg-[#C9FBDA] transition-all duration-300 text-sm sm:text-base"
            >
              Entrar
            </motion.button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-20 sm:pt-24 pb-16 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FCDAC9] via-[#DAC9FB] to-[#C9FBDA]">
  <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
    <motion.div
      className="w-full lg:w-1/2 text-center lg:text-left"
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[Playfair Display] font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
        Celebre,
      </h1>
      <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
        Planeje eventos memoráveis com convites pelo WhatsApp, RSVP automático, listas de presentes e um mural interativo, tudo em um só lugar.
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-[#C9FBDA] text-gray-900 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full shadow-lg hover:bg-[#FCDAC9] transition-all duration-300 text-sm sm:text-base"
      >
        Comece Grátis
      </motion.button>
    </motion.div>
    <motion.div
      className="w-full lg:w-1/2 flex justify-center mt-8 lg:mt-0"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl">
        <Image
          src="/illustrations/celebrecasamento.png"
          width={800}
          height={700}
          alt="Convite elegante pelo WhatsApp com Celebre"
          className="w-full h-auto object-cover rounded-lg"
          priority
        />
      </div>
    </motion.div>
  </div>
</section>


        {/* Metrics */}
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#FCDAC9]/20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-[Playfair Display] font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Nossa História
          </h2>
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { value: "17+", label: "Clientes Ativos" },
              { value: "Junte-se", label: "À nossa comunidade de eventos incríveis" },
              { value: "100%", label: "Eventos Memoráveis" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-[#DAC9FB]/30"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#DAC9FB]">{item.value}</div>
                <div className="text-sm sm:text-base text-gray-700 mt-2 sm:mt-3">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Como Funciona */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <h2 className="text-4xl font-[Playfair Display] font-bold text-center text-gray-900 mb-12">
            Como a Celebre Transforma seus Eventos
          </h2>
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold text-[#DAC9FB] mb-6">
                Para Anfitriões: Tudo Simplificado
              </h3>
              <ol className="space-y-6 text-lg text-gray-700">
                {[
                  "Crie eventos em minutos com um dashboard intuitivo.",
                  "Envie convites elegantes pelo WhatsApp com um clique.",
                  "Gerencie RSVPs e listas de presentes em tempo real.",
                  "Crie memórias com um mural de fotos e recados.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start">
                    <span className="inline-block bg-[#C9FBDA] text-gray-900 w-8 h-8 text-center font-bold rounded-full mr-4 mt-1">
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
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="bg-[#FCDAC9]/20 rounded-xl shadow-lg p-8 flex flex-col items-center">
                <div className="w-64 h-40 bg-gray-200 rounded-md mb-6" />
                <p className="text-center text-base font-medium text-gray-700">
                  Organize com sofisticação e praticidade
                </p>
              </div>
            </motion.div>
          </div>
          <div className="mt-12 text-center">
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
              Para convidados, é simples: receba convites, confirme presença e escolha presentes diretamente no WhatsApp.
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
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#C9FBDA]/20">
          <h2 className="text-4xl font-[Playfair Display] font-bold text-center text-gray-900 mb-12">
            Ferramentas para Eventos Memoráveis
          </h2>
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                className="bg-white p-6 rounded-xl shadow-md border border-[#FCDAC9]/30 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <feat.icon className="w-8 h-8 text-[#DAC9FB] mx-auto mb-4" />
                <h3 className="font-semibold text-xl text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-600">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Market Opportunity */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FCDAC9]/20">
          <h2 className="text-4xl font-[Playfair Display] font-bold text-center text-gray-900 mb-12">
            Uma Nova Era para Eventos
          </h2>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Com 17 clientes ativos e milhares de eventos realizados anualmente no Brasil (IBGE), a Celebre está revolucionando o planejamento de eventos. Expandimos para aniversários, formaturas e eventos corporativos, com templates multiculturais e personalização white-label para cerimonialistas.
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
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <h2 className="text-4xl font-[Playfair Display] font-bold text-center text-gray-900 mb-12">
            Parcerias e Benefícios
          </h2>
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold text-[#DAC9FB] mb-4">
                Lista de Presentes
              </h3>
              <p className="text-base text-gray-700 mb-6">
                Ofereça uma lista de presentes integrada diretamente no WhatsApp, com uma taxa de apenas 3% para presentes digitais.
              </p>
              <p className="text-base font-medium text-gray-700">
                Ideal para casamentos, chás de bebê e eventos especiais.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold text-[#DAC9FB] mb-4">
                Parcerias com Cerimonialistas
              </h3>
              <p className="text-base text-gray-700 mb-6">
                Colabore com nossa plataforma white-label para oferecer uma experiência personalizada aos seus clientes.
              </p>
              <p className="text-base font-medium text-gray-700">
                Eleve seus eventos com a Celebre.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ & Lead Magnet */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#C9FBDA]/20">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
            <FAQAccordion />
            <motion.div
              className="bg-white p-8 rounded-xl shadow-md border border-[#FCDAC9]/30 flex flex-col items-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h2 className="font-[Playfair Display] text-2xl font-bold text-[#DAC9FB] mb-6 text-center">
                Baixe o Checklist Perfeito
              </h2>
              <input
                id="email"
                className="w-full p-4 mb-4 rounded-lg border border-[#FCDAC9]/50 focus:ring-2 focus:ring-[#DAC9FB] outline-none"
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
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <h2 className="text-4xl font-[Playfair Display] font-bold text-center text-gray-900 mb-12">
            Escolha seu Plano
          </h2>
          <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                name: "Gratuito",
                price: "R$ 0",
                bullets: [
                  "50 convites",
                  "Funcionalidades básicas",
                  "Taxa de 3% na lista de presentes",
                ],
              },
              {
                name: "Profissional",
                price: "R$ 69/mês",
                bullets: [
                  "Convidados ilimitados",
                  "Templates premium",
                  "Taxa de 3% na lista de presentes",
                  "Suporte prioritário",
                ],
              },
              {
                name: "Enterprise",
                price: "R$ 149/mês",
                bullets: [
                  "Convidados ilimitados",
                  "White-label para marcas",
                  "Parcerias com cerimonialistas",
                  "Suporte 24/7",
                ],
              },
            ].map((plan, idx) => (
              <motion.div
                key={plan.name}
                className={`bg-[#FCDAC9]/20 p-8 rounded-xl shadow-md border border-[#DAC9FB]/30 hover:shadow-lg transition-shadow duration-300 ${
                  idx === 1 ? "border-2 border-[#C9FBDA]" : ""
                }`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <h3 className="font-semibold text-xl text-[#DAC9FB] mb-3">{plan.name}</h3>
                <div className="text-3xl font-bold text-gray-900 mb-4">{plan.price}</div>
                <ul className="text-base text-gray-700 mb-6 text-center space-y-3">
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
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#DAC9FB]/20 text-center">
          <motion.h2
            className="text-4xl font-[Playfair Display] font-bold text-gray-900 mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            Crie Eventos Inesquecíveis
          </motion.h2>
          <motion.p
            className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
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
        <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white/95 backdrop-blur-md border-t border-[#FCDAC9]/30">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-[Playfair Display] text-2xl font-bold text-[#DAC9FB]">
                  Celebre
                </span>
                <span className="text-[#C9FBDA] text-2xl">●</span>
                <span className="text-[#FCDAC9] text-lg">●</span>
              </div>
              <p className="text-[#DAC9FB] font-semibold text-sm opacity-80">
                Simplifique. Celebre. Conecte.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start gap-2">
              <span className="font-semibold text-[#DAC9FB] mb-2">Navegação</span>
              <a href="/sobre" className="hover:text-[#C9FBDA] transition-colors">
                Sobre
              </a>
              <a href="/blog" className="hover:text-[#C9FBDA] transition-colors">
                Blog
              </a>
              <a href="#faq" className="hover:text-[#C9FBDA] transition-colors">
                Contato
              </a>
              <a href="/termos" className="hover:text-[#C9FBDA] transition-colors">
                Termos
              </a>
              <a href="/privacidade" className="hover:text-[#C9FBDA] transition-colors">
                Privacidade
              </a>
            </div>
            <div className="flex flex-col items-center md:items-start gap-2">
              <span className="font-semibold text-[#DAC9FB] mb-2">Contato</span>
              <a href="tel:+5527996843742" className="hover:text-[#C9FBDA] transition-colors">
                +55 27 99684-3742
              </a>
              <a href="tel:+5527997109712" className="hover:text-[#C9FBDA] transition-colors">
                +55 27 99710-9712
              </a>
              <a
                href="https://www.ecelebre.com.br"
                className="hover:text-[#C9FBDA] transition-colors"
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
          <div className="mt-10 text-center text-[#DAC9FB]/60 text-sm">
            © 2025 Celebre Eventos. Todos os direitos reservados.
          </div>
        </footer>
      </main>
    </>
  );
}