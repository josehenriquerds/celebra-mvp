"use client";
import FAQAccordion from "@/app/components/landing2/FAQSection";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion";
import { motion } from "framer-motion";
import Head from "next/head";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Head>
        <title>
          Celebre: Planeje Eventos com Elegância e Simplicidade
        </title>
        <meta
          name="description"
          content="Organize casamentos e eventos com a Celebre: convites pelo WhatsApp, RSVP automático, lista de presentes integrada e mural de fotos. Comece grátis agora!"
        />
        <meta
          name="keywords"
          content="planejamento de eventos, casamentos, convites WhatsApp, RSVP automático, lista de presentes, mural de fotos, plataforma de celebração"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://www.ecelebre.com.br/" />
        <meta
          property="og:title"
          content="Celebre: Planeje Eventos com Elegância e Simplicidade"
        />
        <meta
          property="og:description"
          content="Crie convites pelo WhatsApp, gerencie RSVPs, listas de presentes e memórias com a Celebre. Perfeito para casamentos, festas e mais. Comece grátis!"
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
          content="Celebre: Planeje Eventos com Elegância e Simplicidade"
        />
        <meta
          name="twitter:description"
          content="Crie convites pelo WhatsApp, gerencie RSVPs, listas de presentes e memórias com a Celebre. Perfeito para casamentos, festas e mais. Comece grátis!"
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
      <main className="font-inter bg-gradient-to-b from-[#FAF5F0] to-white text-[#2B2B2B] min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-6 sm:px-12 py-8 bg-white/80 backdrop-blur-lg shadow-sm fixed w-full z-50 top-0 left-0">
          <h1 className="font-[Playfair Display] text-3xl font-bold text-[#863F44] tracking-tight">
            <a href="/">Celebre</a>
          </h1>
          <nav className="hidden md:flex gap-10 font-medium text-lg">
            <a href="/" className="hover:text-[#863F44] transition-colors">
              Home
            </a>
            <a
              href="#features"
              className="hover:text-[#863F44] transition-colors"
            >
              Funcionalidades
            </a>
            <a
              href="#team"
              className="hover:text-[#863F44] transition-colors"
            >
              Equipe
            </a>
            <a
              href="#pricing"
              className="hover:text-[#863F44] transition-colors"
            >
              Planos
            </a>
            <a href="#faq" className="hover:text-[#863F44] transition-colors">
              Contato
            </a>
          </nav>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#F7D794" }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#F5C6CB] text-[#863F44] px-8 py-3 rounded-full font-semibold shadow-md hover:bg-[#F7D794] transition-all duration-300 text-sm sm:text-base"
          >
            Planeje seu Evento
          </motion.button>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between px-6 sm:px-12 md:px-20 py-24 md:py-36 bg-white/70 backdrop-blur-lg bg-[url('/images/floral-pattern.png')] bg-opacity-10">
          <motion.div
            className="md:w-1/2 text-center md:text-left"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-[Playfair Display] font-bold mb-6 leading-tight text-[#863F44]">
              Celebre sem Estresse
            </h1>
            <p className="text-lg sm:text-xl mb-8 max-w-md mx-auto md:mx-0 leading-relaxed">
              Planeje casamentos e eventos com convites pelo WhatsApp, RSVP automático, listas de presentes integradas e um mural de memórias. Tudo em um dashboard elegante.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#F7D794" }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#F5C6CB] text-[#863F44] font-semibold py-4 px-10 rounded-full shadow-lg hover:bg-[#F7D794] transition-all duration-300 text-lg"
            >
              Comece Grátis
            </motion.button>
          </motion.div>
          <motion.div
            className="md:w-1/2 flex justify-center mt-12 md:mt-0"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <Image
              src="/images/wedding-whatsapp.jpg"
              width={500}
              height={400}
              alt="Convite elegante pelo WhatsApp com Celebre"
              className="rounded-3xl object-cover shadow-2xl"
              priority
            />
          </motion.div>
        </section>

        {/* Metrics */}
        <section className="py-20 bg-[#FAF5F0] text-center">
          <h2 className="text-4xl font-[Playfair Display] font-bold mb-12 text-[#863F44]">
            Nossa Jornada
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
            {[
              { value: "17+", label: "Clientes Ativos" },
              { value: "Milhares", label: "Casamentos Anuais no Brasil (IBGE)" },
              { value: "100%", label: "Eventos Memoráveis" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-[#F7D794]/30"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <div className="text-5xl font-bold text-[#863F44]">{item.value}</div>
                <div className="text-base mt-3 text-[#2B2B2B]">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Como funciona */}
        <section className="bg-white py-20 px-6 sm:px-12 md:px-20">
          <h2 className="text-4xl font-[Playfair Display] font-bold mb-12 text-center text-[#863F44]">
            Como a Celebre Transforma seus Eventos
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-6 text-[#863F44]">
                Para Anfitriões: Tudo em um Só Lugar
              </h3>
              <ol className="space-y-6 text-lg">
                {[
                  "Crie seu evento em minutos com nosso dashboard intuitivo.",
                  "Envie convites pelo WhatsApp com um clique, sem sites ou QR codes.",
                  "Gerencie RSVPs, listas de presentes e lembretes em tempo real.",
                  "Capture memórias com um mural de fotos e recados dos convidados.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start">
                    <span className="inline-block bg-[#F5C6CB] text-[#863F44] w-10 h-10 text-center font-bold rounded-full mr-4 mt-1">
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
              <div className="bg-[#FAF5F0] rounded-3xl shadow-xl p-8 flex flex-col items-center">
                <Image
                  src="/images/dashboard-preview.jpg"
                  width={300}
                  height={180}
                  alt="Dashboard Celebre para anfitriões"
                  className="rounded-xl mb-6 shadow-md"
                />
                <p className="text-center text-base font-medium">
                  Organize tudo com elegância e simplicidade
                </p>
              </div>
            </motion.div>
          </div>
          <div className="mt-12 text-center">
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Para convidados, é ainda mais fácil: receba convites, confirme presença e escolha presentes diretamente no WhatsApp, sem complicações.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#F7D794" }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#F5C6CB] text-[#863F44] px-8 py-3 rounded-full font-semibold shadow-md hover:bg-[#F7D794] transition-all duration-300"
            >
              Veja Como Funciona
            </motion.button>
          </div>
        </section>

        {/* Benefícios principais */}
        <section
          id="features"
          className="py-20 bg-[#FAF5F0] px-6 sm:px-12 md:px-20 bg-[url('/images/confetti-pattern.png')] bg-opacity-10"
        >
          <h2 className="text-4xl font-[Playfair Display] font-bold mb-12 text-center text-[#863F44]">
            Ferramentas para Celebrar com Estilo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: "/icons/whatsapp.svg",
                title: "Convites pelo WhatsApp",
                desc: "Envie convites elegantes e receba respostas instantâneas no WhatsApp, sem sites ou QR codes.",
              },
              {
                icon: "/icons/gift.svg",
                title: "Lista de Presentes Integrada",
                desc: "Permita que seus convidados escolham presentes diretamente pelo WhatsApp (taxa de 3%).",
              },
              {
                icon: "/icons/guestbook.svg",
                title: "Mural de Recados e Fotos",
                desc: "Crie memórias com fotos e mensagens compartilhadas pelos convidados.",
              },
              {
                icon: "/icons/check.svg",
                title: "RSVP Automático",
                desc: "Confirmações em tempo real com lembretes automáticos e personalizáveis.",
              },
              {
                icon: "/icons/infinity.svg",
                title: "Convidados Ilimitados",
                desc: "Convide quantas pessoas quiser, sem limites ou custos extras.",
              },
              {
                icon: "/icons/dashboard.svg",
                title: "Dashboard Centralizado",
                desc: "Gerencie todos os detalhes do evento em uma interface elegante e intuitiva.",
              },
            ].map((feat, idx) => (
              <motion.div
                key={feat.title}
                className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg flex flex-col items-center text-center border border-[#F7D794]/30 hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <Image
                  src={feat.icon}
                  width={48}
                  height={48}
                  alt={feat.title}
                  className="mb-6"
                />
                <h3 className="font-semibold text-xl mb-3 text-[#863F44]">{feat.title}</h3>
                <p className="text-base">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="py-20 bg-white px-6 sm:px-12 md:px-20">
          <h2 className="text-4xl font-[Playfair Display] font-bold mb-12 text-center text-[#863F44]">
            Conheça a Equipe por Trás da Celebre
          </h2>
          <div className="grid sm:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {[
              {
                img: "/images/raquel.jpg",
                name: "Raquel Rocha Tellaroli",
                role: "Idealizadora",
                desc: "Advogada apaixonada por eventos, Raquel criou a Celebre para transformar celebrações em momentos inesquecíveis.",
              },
              {
                img: "/images/jose.jpg",
                name: "José Henrique Rocha",
                role: "Desenvolvedor",
                desc: "Engenheiro da computação, José desenvolveu a plataforma para garantir uma experiência fluida e elegante.",
              },
            ].map((member, idx) => (
              <motion.div
                key={member.name}
                className="bg-[#FAF5F0] p-8 rounded-2xl shadow-lg flex flex-col items-center text-center border border-[#F7D794]/30 hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, x: idx === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.15, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <Image
                  src={member.img}
                  width={100}
                  height={100}
                  className="rounded-full mb-6 shadow-md"
                  alt={`Foto de ${member.name}`}
                />
                <span className="text-[#863F44] font-semibold text-xl mb-2">
                  {member.name}
                </span>
                <span className="text-base font-medium mb-3">{member.role}</span>
                <p className="text-base">{member.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Market Opportunity */}
        <section className="py-20 bg-[#FAF5F0] px-6 sm:px-12 md:px-20 bg-[url('/images/floral-pattern.png')] bg-opacity-10">
          <h2 className="text-4xl font-[Playfair Display] font-bold mb-12 text-center text-[#863F44]">
            Uma Nova Era para Eventos
          </h2>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg mb-6 leading-relaxed">
              Com 17 clientes ativos e milhares de casamentos realizados anualmente no Brasil (IBGE), a Celebre está redefinindo o planejamento de eventos. Estamos expandindo para aniversários, formaturas, eventos corporativos e mercados internacionais com templates multiculturais, além de oferecer personalização white-label para cerimonialistas e marcas.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#F7D794" }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#F5C6CB] text-[#863F44] px-8 py-3 rounded-full font-semibold shadow-md hover:bg-[#F7D794] transition-all duration-300"
            >
              Faça Parte
            </motion.button>
          </div>
        </section>

        {/* Partnerships and Gift List */}
        <section className="py-20 bg-white px-6 sm:px-12 md:px-20">
          <h2 className="text-4xl font-[Playfair Display] font-bold mb-12 text-center text-[#863F44]">
            Parcerias e Benefícios Exclusivos
          </h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-4 text-[#863F44]">
                Lista de Presentes Integrada
              </h3>
              <p className="text-base mb-6">
                Facilite a escolha de presentes para seus convidados com uma lista integrada diretamente no WhatsApp. Cobramos uma taxa de apenas 3% sobre os presentes digitais, garantindo praticidade e transparência.
              </p>
              <p className="text-base font-medium">
                Perfeito para casamentos, chás de bebê e outros eventos especiais.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-4 text-[#863F44]">
                Parcerias com Cerimonialistas
              </h3>
              <p className="text-base mb-6">
                Trabalhamos com cerimonialistas e fornecedores para oferecer uma experiência completa. Nossa plataforma suporta personalização white-label, permitindo que marcas e profissionais integrem a Celebre em seus serviços.
              </p>
              <p className="text-base font-medium">
                Junte-se a nós para elevar seus eventos a um novo patamar.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ & Lead Magnet */}
        <section className="py-20 bg-[#FAF5F0] px-6 sm:px-12 md:px-20">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <FAQAccordion
            />
            <motion.div
              className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg flex flex-col items-center relative border border-[#F7D794]/30"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h2 className="font-[Playfair Display] text-2xl font-bold mb-6 text-center text-[#863F44]">
                Baixe o Checklist Perfeito
              </h2>
              <Image
                src="/images/bride-wedding.jpg"
                width={220}
                height={220}
                alt="Noiva planejando com Celebre"
                className="rounded-full object-cover mb-6 shadow-md"
              />
              <input
                id="email"
                className="w-full p-4 mb-4 rounded-lg border border-[#F7D794]/50 focus:ring-2 focus:ring-[#F5C6CB] outline-none"
                placeholder="Seu e-mail"
                type="email"
                autoComplete="email"
              />
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#F7D794" }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#F5C6CB] text-[#863F44] py-4 w-full rounded-full font-semibold shadow-md hover:bg-[#F7D794] transition-all duration-300"
              >
                Baixe Grátis
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Planos & Preços */}
        <section id="pricing" className="py-20 bg-white px-6 sm:px-12 md:px-20">
          <h2 className="text-4xl font-[Playfair Display] font-bold mb-12 text-center text-[#863F44]">
            Escolha o Plano Ideal
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                  "Suporte dedicado 24/7",
                ],
              },
            ].map((plan, idx) => (
              <motion.div
                key={plan.name}
                className={`bg-[#FAF5F0] p-8 rounded-2xl shadow-lg flex flex-col items-center border border-[#F7D794]/30 hover:shadow-xl transition-shadow duration-300 ${
                  idx === 1 ? "border-2 border-[#F5C6CB]" : ""
                }`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <h3 className="font-semibold text-xl mb-3 text-[#863F44]">{plan.name}</h3>
                <div className="text-3xl font-bold mb-4 text-[#863F44]">{plan.price}</div>
                <ul className="text-base mb-6 text-center space-y-3">
                  {plan.bullets.map((b, i) => (
                    <li key={i} className="flex items-center justify-center">
                      <span className="mr-2 text-[#F5C6CB]">✓</span> {b}
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#F7D794" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#F5C6CB] text-[#863F44] px-8 py-3 rounded-full font-semibold hover:bg-[#F7D794] transition-all duration-300"
                >
                  Assinar
                </motion.button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-24 bg-[#FAF5F0] text-center bg-[url('/images/confetti-pattern.png')] bg-opacity-10">
          <motion.h2
            className="text-4xl font-[Playfair Display] font-bold mb-8 text-[#863F44]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            Crie Celebrações Inesquecíveis
          </motion.h2>
          <motion.p
            className="text-lg mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            Comece hoje e transforme seu evento com a simplicidade e elegância da Celebre.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#F7D794" }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#F5C6CB] text-[#863F44] py-4 px-10 text-xl rounded-full font-semibold hover:bg-[#F7D794] transition-all duration-300 shadow-md"
          >
            Comece Grátis
          </motion.button>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-8 bg-white/80 backdrop-blur-lg border-t border-[#F7D794]/30">
  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
    {/* LOGO & SLOGAN */}
    <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
      <div className="flex items-center gap-3 mb-2">
        {/* Substitua pelo seu SVG ou <Image /> */}
        <span className="font-serif text-2xl font-bold text-[#863F44]">Celebre</span>
        <span className="text-pink-200 text-2xl">●</span>
        <span className="text-pink-200 text-lg">●</span>
      </div>
      <p className="text-[#863F44] font-semibold text-base md:text-sm opacity-80">
        Simplifique. Celebre. Conecte.
      </p>
    </div>
    {/* NAVEGAÇÃO */}
    <div className="flex flex-col items-center md:items-start gap-2">
      <span className="font-semibold mb-2 text-[#863F44]">Navegação</span>
      <a href="/sobre" className="hover:text-[#863F44] transition-colors">Sobre</a>
      <a href="/blog" className="hover:text-[#863F44] transition-colors">Blog</a>
      <a href="#faq" className="hover:text-[#863F44] transition-colors">Contato</a>
      <a href="/termos" className="hover:text-[#863F44] transition-colors">Termos</a>
      <a href="/privacidade" className="hover:text-[#863F44] transition-colors">Privacidade</a>
    </div>
    {/* CONTATO */}
    <div className="flex flex-col items-center md:items-start gap-2">
      <span className="font-semibold mb-2 text-[#863F44]">Contato</span>
      <a href="tel:+5527996843742" className="hover:text-[#863F44] transition-colors">
        +55 27 99684-3742
      </a>
      <a href="tel:+5527997109712" className="hover:text-[#863F44] transition-colors">
        +55 27 99710-9712
      </a>
      <a
        href="https://www.ecelebre.com.br"
        className="hover:text-[#863F44] transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        www.ecelebre.com.br
      </a>
    </div>
    {/* REDES SOCIAIS */}
    <div className="flex flex-col items-center md:items-start gap-2">
      <span className="font-semibold mb-2 text-[#863F44]">Redes Sociais</span>
      <div className="flex gap-4">
        <a
          href="https://x.com/celebreapp"
          aria-label="Celebre no X"
          className="hover:text-[#863F44] text-xl"
        >X</a>
        <a
          href="https://instagram.com/celebreapp"
          aria-label="Celebre no Instagram"
          className="hover:text-[#863F44] text-xl"
        >Instagram</a>
        <a
          href="https://facebook.com/celebreapp"
          aria-label="Celebre no Facebook"
          className="hover:text-[#863F44] text-xl"
        >Facebook</a>
      </div>
    </div>
  </div>
  <div className="mt-10 text-center text-[#863F44]/60 text-sm">
    © 2025 Celebre Eventos. Todos os direitos reservados.
  </div>
</footer>

      </main>
    </>
  );
}