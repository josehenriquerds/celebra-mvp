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
          Celebre: Planeje Casamentos e Eventos com Convites Digitais
        </title>
        <meta
          name="description"
          content="Planeje casamentos e eventos com a Celebre: convites digitais, RSVP automático, checklists e mais. Comece grátis agora!"
        />
        <meta
          name="keywords"
          content="planejamento de casamentos, eventos, convites digitais, RSVP automático, checklist de eventos, plataforma de celebração"
        />meta
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://www.ecelebre.com.br/" />
        <meta
          property="og:title"
          content="Celebre: Planeje Casamentos e Eventos com Facilidade"
        />
        <meta
          property="og:description"
          content="Crie convites digitais, gerencie RSVPs e planeje eventos com a Celebre. Perfeito para casamentos e festas. Comece grátis!"
        />
        <meta
          property="og:image"
          content="https://www.ecelebre.com.br//images/og-image.jpg"
        />
        <meta property="og:url" content="https://www.ecelebre.com.br/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Celebre: Planeje Casamentos e Eventos com Facilidade"
        />
        <meta
          name="twitter:description"
          content="Crie convites digitais, gerencie RSVPs e planeje eventos com a Celebre. Perfeito para casamentos e festas. Comece grátis!"
        />
        <meta
          name="twitter:image"
          content="https://www.ecelebre.com.br//images/og-image.jpg"
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Celebre",
            url: "https://celebre.app",
            description:
              "Plataforma para planejar casamentos e eventos com convites digitais, RSVP automático e checklists.",
          })}
        </script>
      </Head>
      <main className="font-inter bg-gradient-to-b from-[#FAF5F0] to-white text-[#2B2B2B] min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-8 py-6 bg-white/90 backdrop-blur-md shadow-lg fixed w-full z-50 top-0 left-0">
          <h1 className="font-serif text-2xl font-bold text-[#863F44] tracking-tight">
            <a href="/">Celebre</a>
          </h1>
          <nav className="hidden md:flex gap-8 font-medium text-lg">
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
              href="#pricing"
              className="hover:text-[#863F44] transition-colors"
            >
              Planos
            </a>
            <a
              href="#testimonials"
              className="hover:text-[#863F44] transition-colors"
            >
              Depoimentos
            </a>
            <a href="#faq" className="hover:text-[#863F44] transition-colors">
              Contato
            </a>
          </nav>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#FADADD" }}
            whileTap={{ scale: 0.95 }}
            className="bg-pink-200 text-[#863F44] px-6 py-2 rounded-full font-semibold shadow-md hover:bg-pink-300 transition-all duration-200 text-sm sm:text-base"
          >
            Planeje Agora
          </motion.button>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 md:px-16 py-20 md:py-32 bg-white/80 backdrop-blur-sm">
          <motion.div
            className="md:w-1/2 text-center md:text-left"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight text-[#863F44]">
              Planeje Eventos com Elegância
            </h1>
            <p className="text-lg sm:text-xl mb-8 max-w-lg mx-auto md:mx-0">
              Transforme seus casamentos e eventos com convites digitais, RSVP
              automático e checklists intuitivos. Comece grátis!
            </p>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#FADADD" }}
              whileTap={{ scale: 0.95 }}
              className="bg-pink-200 text-[#863F44] font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-pink-300 transition-all text-lg"
            >
              Comece Grátis
            </motion.button>
          </motion.div>
          <motion.div
            className="md:w-1/2 flex justify-center mt-10 md:mt-0"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9 }}
            viewport={{ once: true }}
          >
            <Image
              src="/illustrations/convite-digital-casamento.jpg"
              width={400}
              height={300}
              alt="Planejamento elegante com Celebre"
              className="rounded-2xl object-cover shadow-2xl"
              priority
            />
          </motion.div>
        </section>

        {/* Métricas */}
        <section className="py-16 bg-[#FAF5F0] text-center">
          <h2 className="text-3xl font-serif font-bold mb-12 text-[#863F44]">
            Nossos Resultados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
            {[
              { value: "+3.000", label: "Eventos planejados" },
              { value: "98%", label: "RSVP confirmados" },
              { value: "+1.200", label: "Clientes satisfeitos" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-[#863F44]">
                  {item.value}
                </div>
                <div className="text-base mt-2 text-[#2B2B2B]">
                  {item.label}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Como funciona */}
        <section className="bg-white py-16 px-4 sm:px-8 md:px-16">
          <h2 className="text-3xl font-serif font-bold mb-12 text-center text-[#863F44]">
            Como Usar a Celebre
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <ol className="space-y-6 text-lg">
                {[
                  "Crie seu evento em 1 minuto",
                  "Importe convidados via CSV ou WhatsApp",
                  "Personalize convites com templates únicos",
                  "Gerencie RSVPs em tempo real",
                ].map((text, i) => (
                  <li key={i} className="flex items-start">
                    <span className="inline-block bg-pink-200 text-[#863F44] w-8 h-8 text-center font-bold rounded-full mr-4 mt-1">
                      {i + 1}
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9 }}
              viewport={{ once: true }}
            >
              <div className="bg-[#FAF5F0] rounded-2xl shadow-lg p-6 flex flex-col items-center">
                <Image
                  src="/video-thumb.svg"
                  width={240}
                  height={140}
                  alt="Tutorial Celebre"
                  className="rounded-xl mb-4"
                />
                <p className="text-center text-base">
                  Veja como planejar seu evento perfeito
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefícios principais */}
        <section
          id="features"
          className="py-16 bg-[#FAF5F0] px-4 sm:px-8 md:px-16"
        >
          <h2 className="text-3xl font-serif font-bold mb-12 text-center text-[#863F44]">
            Ferramentas Essenciais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: "📧",
                title: "Convites Digitais",
                desc: "Crie convites elegantes por e-mail ou WhatsApp.",
              },
              {
                icon: "✅",
                title: "RSVP Automático",
                desc: "Confirmações em tempo real com lembretes.",
              },
              {
                icon: "🖼️",
                title: "Mural Interativo",
                desc: "Compartilhe momentos ao vivo com convidados.",
              },
            ].map((feat, idx) => (
              <motion.div
                key={feat.title}
                className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: idx * 0.12 }}
                viewport={{ once: true }}
              >
                <span className="text-4xl mb-4">{feat.icon}</span>
                <h3 className="font-semibold mb-2 text-lg">{feat.title}</h3>
                <p className="text-sm">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Depoimentos */}
        <section
          id="testimonials"
          className="py-16 bg-white px-4 sm:px-8 md:px-16"
        >
          <h2 className="text-3xl font-serif font-bold mb-12 text-center text-[#863F44]">
            O Que Dizem de Nós
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                img: "/user1.jpg",
                name: "Ana M.",
                text: '"Transformou meu casamento com convites e RSVP automáticos!"',
              },
              {
                img: "/user2.jpg",
                name: "Carla F.",
                text: '"Indispensável para organizar eventos com eficiência."',
              },
            ].map((test, idx) => (
              <motion.div
                key={test.name}
                className="bg-[#FAF5F0] p-6 rounded-2xl shadow-md flex flex-col items-center text-center"
                initial={{ opacity: 0, x: idx === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Image
                  src={test.img}
                  width={60}
                  height={60}
                  className="rounded-full mb-4"
                  alt={`Foto de ${test.name}`}
                />
                <span className="text-[#863F44] font-semibold mb-2">
                  {test.name}
                </span>
                <p className="italic text-base">{test.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ & Lead Magnet */}
        <section className="py-16 bg-[#FAF5F0] px-4 sm:px-8 md:px-16">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <FAQAccordion></FAQAccordion>
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center relative"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-2xl font-bold mb-6 text-center">
                Baixe o Checklist
              </h2>
              <Image
                src="/images/bride.jpg" // Substitua pelo caminho da imagem da noiva que você fornecerá
                width={200}
                height={200}
                alt="Noiva elegante"
                className="rounded-full object-cover mb-6 shadow-md"
              />
              <input
                id="email"
                className="w-full p-3 mb-4 rounded-lg border border-gray-300"
                placeholder="Seu e-mail"
                type="email"
                autoComplete="email"
              />
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#FADADD" }}
                whileTap={{ scale: 0.95 }}
                className="bg-pink-200 text-[#863F44] py-3 w-full rounded-full hover:bg-pink-300 font-semibold transition"
              >
                Baixe Grátis
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Planos & Preços */}
        <section id="pricing" className="py-16 bg-white px-4 sm:px-8 md:px-16">
          <h2 className="text-3xl font-serif font-bold mb-12 text-center text-[#863F44]">
            Escolha Seu Plano
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Gratuito",
                price: "R$ 0",
                bullets: [
                  "50 convites",
                  "Funcionalidades básicas",
                  "Suporte via e-mail",
                ],
              },
              {
                name: "Profissional",
                price: "R$ 69/mês",
                bullets: [
                  "RSVP ilimitado",
                  "Templates premium",
                  "Suporte 24/7",
                ],
              },
              {
                name: "Enterprise",
                price: "R$ 149/mês",
                bullets: [
                  "Integrações com CRMs",
                  "White-label",
                  "SLA dedicado",
                ],
              },
            ].map((plan, idx) => (
              <motion.div
                key={plan.name}
                className={`bg-[#FAF5F0] p-6 rounded-2xl shadow-lg flex flex-col items-center ${
                  idx === 1 ? "border-2 border-pink-200" : ""
                }`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                viewport={{ once: true }}
              >
                <h3 className="font-semibold text-xl mb-2">{plan.name}</h3>
                <div className="text-2xl font-bold mb-4 text-[#863F44]">
                  {plan.price}
                </div>
                <ul className="text-sm mb-6 text-center space-y-2">
                  {plan.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#FADADD" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-pink-200 text-[#863F44] px-6 py-2 rounded-full font-semibold hover:bg-pink-300 transition"
                >
                  Assinar
                </motion.button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 bg-[#FAF5F0] text-center">
          <motion.h2
            className="text-3xl font-serif font-bold mb-8 text-[#863F44]"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Planeje seu Evento Perfeito Hoje
          </motion.h2>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#FADADD" }}
            whileTap={{ scale: 0.95 }}
            className="bg-pink-200 text-[#863F44] py-3 px-8 text-xl rounded-full font-semibold hover:bg-pink-300 transition"
          >
            Comece Grátis
          </motion.button>
        </section>

        {/* Footer */}
        <footer className="py-10 bg-white/90 backdrop-blur-md text-center border-t border-gray-100">
          <p className="mb-4 text-lg">
            © 2025 Celebre - Planeje celebrações inesquecíveis.
          </p>
          <div className="flex justify-center gap-6 mb-4">
            <a href="/sobre" className="hover:text-[#863F44] transition-colors">
              Sobre
            </a>
            <a href="/blog" className="hover:text-[#863F44] transition-colors">
              Blog
            </a>
            <a href="#faq" className="hover:text-[#863F44] transition-colors">
              Contato
            </a>
            <a
              href="/termos"
              className="hover:text-[#863F44] transition-colors"
            >
              Termos
            </a>
            <a
              href="/privacidade"
              className="hover:text-[#863F44] transition-colors"
            >
              Privacidade
            </a>
          </div>
          <div className="flex justify-center gap-4">
            <a
              href="https://x.com/celebreapp"
              aria-label="Celebre no X"
              className="hover:text-[#863F44]"
            >
              X
            </a>
            <a
              href="https://instagram.com/celebreapp"
              aria-label="Celebre no Instagram"
              className="hover:text-[#863F44]"
            >
              Instagram
            </a>
            <a
              href="https://facebook.com/celebreapp"
              aria-label="Celebre no Facebook"
              className="hover:text-[#863F44]"
            >
              Facebook
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
