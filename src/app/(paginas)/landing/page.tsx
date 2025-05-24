'use client';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <Head>
        <title>Celebre | Plataforma para Eventos & Casamentos</title>
        <meta
          name="description"
          content="Celebre é a plataforma mais moderna para planejar casamentos e eventos: convites digitais, RSVP automático, checklist e muito mais."
        />
        <meta
          name="keywords"
          content="casamento, evento, RSVP, checklist de casamento, organização de eventos, celebração, plataforma de eventos, convite digital"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://celebre.app" />
      </Head>
      <main className="font-inter bg-[#FAF5F0] text-[#2B2B2B]">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-8 py-6 bg-white shadow-sm fixed w-full z-30 top-0 left-0">
          <span className="font-serif text-2xl font-bold text-[#863F44] tracking-tight">
            Celebre
          </span>
          <nav className="hidden md:flex gap-6 font-medium">
            <a href="#" className="hover:text-[#863F44]">Início</a>
            <a href="#features" className="hover:text-[#863F44]">Funcionalidades</a>
            <a href="#pricing" className="hover:text-[#863F44]">Preços</a>
            <a href="#testimonials" className="hover:text-[#863F44]">Depoimentos</a>
            <a href="#faq" className="hover:text-[#863F44]">Contato</a>
          </nav>
          <button className="bg-pink-200 text-[#863F44] px-4 sm:px-6 py-2 rounded-full font-semibold shadow hover:bg-pink-300 transition-all duration-200 text-sm sm:text-base">
            Criar meu evento
          </button>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col-reverse md:flex-row items-center md:items-start justify-between px-4 sm:px-8 md:px-20 pt-28 pb-14 bg-white gap-10 md:gap-4">
          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 leading-tight">
              Transforme seu evento em uma experiência inesquecível
            </h1>
            <p className="text-base sm:text-lg mb-7">
              Plataforma completa para planejar, convidar e engajar seus convidados, ideal para casamentos, aniversários, formaturas e festas corporativas.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.04 }}
              className="bg-pink-200 text-[#863F44] font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-pink-300 transition text-lg"
            >
              Comece Gratuitamente
            </motion.button>
          </motion.div>
          <motion.div
            className="md:w-1/2 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9 }}
            viewport={{ once: true }}
          >
            <Image
              src="/illustrations/renomear.png"
              width={320}
              height={200}
              alt="Pessoas celebrando em evento e casamento"
              className="rounded-xl object-cover w-full h-auto"
              priority
            />
          </motion.div>
        </section>

        {/* Métricas */}
        <section className="flex flex-col md:flex-row justify-center items-center gap-8 py-10 md:py-16 bg-[#FAF5F0] text-center">
          {[
            { value: '+3.000', label: 'Eventos planejados' },
            { value: '98%', label: 'RSVP efetivados' },
            { value: '+1.200', label: 'Cerimonialistas & anfitriões' }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="flex-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl md:text-4xl font-bold text-[#863F44]">{item.value}</div>
              <div className="text-base mt-2 text-[#2B2B2B]">{item.label}</div>
            </motion.div>
          ))}
        </section>

        {/* Como funciona */}
        <section className="bg-white px-4 sm:px-8 md:px-20 py-14 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-2xl font-bold mb-6">Como funciona</h2>
            <ol className="space-y-5 text-base sm:text-lg">
              {[
                'Crie seu evento em 1 minuto',
                'Importe a lista de convidados (CSV ou WhatsApp)',
                'Personalize convites com templates prontos',
                'Acompanhe confirmações e envie lembretes automáticos'
              ].map((text, i) => (
                <li key={i} className="flex items-center">
                  <span className="inline-block bg-[#FADADD] text-[#863F44] w-8 h-8 text-center font-bold rounded-full mr-3">{i + 1}</span>
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
            <div className="bg-[#FAF5F0] rounded-xl shadow-lg p-8 flex flex-col items-center">
              <Image
                src="/video-thumb.svg"
                width={220}
                height={120}
                alt="Vídeo tutorial de evento"
                className="rounded-lg mb-4"
              />
              <p className="text-center text-base">
                Veja como a Ana organizou seu casamento em 5 passos
              </p>
            </div>
          </motion.div>
        </section>

        {/* Benefícios principais */}
        <section id="features" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 sm:px-8 md:px-20 py-12 bg-[#FAF5F0]">
          {[
            { icon: '📧', title: 'Convites digitais', desc: 'Envie convites personalizados por e-mail' },
            { icon: '✅', title: 'RSVP automático', desc: 'Gerencie confirmações em tempo real' },
            { icon: '🖼️', title: 'Mural interativo', desc: 'Receba fotos e recados ao vivo' }
          ].map((feat, idx) => (
            <motion.div
              key={feat.title}
              className="bg-white p-8 rounded-xl shadow-sm flex flex-col items-center"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: idx * 0.12 }}
              viewport={{ once: true }}
            >
              <span className="text-3xl mb-2">{feat.icon}</span>
              <h3 className="font-semibold mb-2">{feat.title}</h3>
              <p className="text-center text-sm">{feat.desc}</p>
            </motion.div>
          ))}
        </section>

        {/* Depoimentos */}
        <section id="testimonials" className="px-4 sm:px-8 md:px-20 py-16 bg-white flex flex-col md:flex-row gap-8 justify-center">
          {[
            {
              img: '/user1.jpg',
              name: 'Ana M.',
              text: '"O Celebre facilitou todos os detalhes do nosso casamento!"'
            },
            {
              img: '/user2.jpg',
              name: 'Carla F.',
              text: '"Ferramenta indispensável para cerimonialista."'
            }
          ].map((test, idx) => (
            <motion.div
              key={test.name}
              className="bg-[#FAF5F0] rounded-xl p-8 shadow-md flex flex-col items-center flex-1"
              initial={{ opacity: 0, x: idx === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Image src={test.img} width={56} height={56} className="rounded-full mb-3" alt={test.name} />
              <span className="text-[#863F44] font-semibold mb-2">{test.name}</span>
              <span className="italic text-center text-lg mb-2">{test.text}</span>
            </motion.div>
          ))}
        </section>

        {/* FAQ & Lead Magnet */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 sm:px-8 md:px-20 py-16 bg-[#FAF5F0]">
          {/* FAQ */}
          <motion.div
            className="bg-white p-8 rounded-xl shadow-md"
            id="faq"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h4 className="font-serif text-xl font-bold mb-6">Perguntas frequentes</h4>
            <ul className="space-y-6 text-base">
              <li>Posso alterar meu plano a qualquer momento?</li>
              <li>Como meus dados são armazenados e protegidos?</li>
              <li>Existe suporte no dia do evento?</li>
            </ul>
          </motion.div>
          {/* Lead Magnet */}
          <motion.div
            className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="font-serif text-xl font-bold mb-6 text-center">Baixe grátis o checklist<br />10 passos para o evento perfeito</h4>
            <label htmlFor="email" className="sr-only">Seu e-mail</label>
            <input
              id="email"
              className="w-full p-3 mb-4 rounded-lg border"
              placeholder="Seu e-mail"
              type="email"
              autoComplete="email"
            />
            <motion.button
              className="bg-pink-200 text-[#863F44] py-3 w-full rounded-full hover:bg-pink-300 font-semibold transition"
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.03 }}
            >
              Enviar
            </motion.button>
          </motion.div>
        </section>

        {/* Planos & Preços */}
        <section id="pricing" className="px-4 sm:px-8 md:px-20 py-16 bg-white">
          <h4 className="font-serif text-2xl font-bold mb-8 text-center">Planos & Preços</h4>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Gratuito',
                price: 'R$ 0',
                bullets: ['Até 50 convites', 'Funcionalidades básicas']
              },
              {
                name: 'Profissional',
                price: 'R$ 69',
                bullets: ['RSVP ilimitado', 'Templates extras', 'Suporte prioritário']
              },
              {
                name: 'Enterprise',
                price: 'R$ 149',
                bullets: ['Integrações avançadas', 'White-label', 'SLA dedicado']
              }
            ].map((plan, idx) => (
              <motion.div
                key={plan.name}
                className={`bg-[#FAF5F0] rounded-xl shadow p-8 flex flex-col items-center ${idx === 1 ? 'border-2 border-pink-200' : ''}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.18 }}
                viewport={{ once: true }}
              >
                <h5 className="font-semibold text-lg mb-2">{plan.name}</h5>
                <div className="text-2xl font-bold mb-4 text-[#863F44]">{plan.price}</div>
                <ul className="text-sm mb-6 text-center">
                  {plan.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
                <motion.button
                  className="bg-pink-200 text-[#863F44] px-8 py-2 rounded-full font-semibold hover:bg-pink-300 transition"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.03 }}
                >
                  Assinar
                </motion.button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section className="text-center py-14 px-4 bg-[#FAF5F0]">
          <motion.h4
            className="text-2xl font-serif font-bold mb-6"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Veja como é fácil gerenciar tudo em um só lugar
          </motion.h4>
          <motion.button
            className="bg-pink-200 text-[#863F44] py-4 px-10 text-lg rounded-full font-semibold hover:bg-pink-300 transition"
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.04 }}
          >
            Comece agora – é grátis
          </motion.button>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 sm:px-8 bg-white text-center border-t border-[#F3F0FF]">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <a href="#">Sobre</a>
            <a href="#">Blog</a>
            <a href="#faq">FAQ</a>
            <a href="#">Termos</a>
            <a href="#">Privacidade</a>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <span>© 2025 Celebre Eventos</span>
          </div>
        </footer>
      </main>
    </>
  );
}
  