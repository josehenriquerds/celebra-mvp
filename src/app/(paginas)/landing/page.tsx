'use client';

import { useState } from 'react';
import Link from 'next/link';
import Footer from '@/app/components/landing/Footer';
import FAQSection from '@/app/components/landing2/FAQSection';
import FeatureList from '@/app/components/landing2/FeatureList';
import Hero1 from '@/app/components/landing2/Hero1';
import MobileMenu from '@/app/components/landing2/MobileMenu';
import PortfolioSection from '@/app/components/landing2/PortfolioSection';
import PricingSection from '@/app/components/landing2/PricingSection';
import TestimonialCard from '@/app/components/landing2/TestimonialCard';


export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    { icon: '/icons/envelope.svg', title: 'Convites digitais', description: 'Envie convites personalizados por email' },
    { icon: '/icons/check.svg', title: 'RSVP automático', description: 'Gerencie confirmações em tempo real' },
    { icon: '/icons/mural.svg', title: 'Mural interativo', description: 'Compartilhe mensagens e fotos ao vivo' }
  ];

  const portfolioItems = [
    { title: '+3 000 eventos planejados', description: 'Comemorações incríveis organizadas' },
    { title: '98 % RSVP efetivados', description: 'Taxa de confirmação excepcional' },
    { title: '+1 200 anfitriões ativos', description: 'Profissionais confiáveis cadastrados' }
  ];

  const testimonials = [
    { name: 'Ana M.', text: 'O Celebre facilitou todos os detalhes do nosso casamento!', img: '/images/user1.jpg' },
    { name: 'Carla F.', text: 'Ferramenta indispensável para qualquer cerimonialista.', img: '/images/user2.jpg' }
  ];

  const plans = [
    { title: 'Gratuito', price: 'R$0', features: ['Até 50 convites', 'Funcionalidades básicas'] },
    { title: 'Profissional', price: 'R$49/mês', features: ['RSVP ilimitado', 'Templates extras', 'Suporte por chat'] },
    { title: 'Enterprise', price: 'Sob consulta', features: ['Integrações avançadas', 'White-label', 'SLA dedicado'] }
  ];

  const faqItems = [
    { question: 'Posso alterar meu plano a qualquer momento?', answer: 'Sim, você pode mudar de plano diretamente nas configurações da sua conta.' },
    { question: 'Como meus dados são armazenados e protegidos?', answer: 'Utilizamos criptografia AES-256 e seguimos as diretrizes da LGPD.' },
    { question: 'Existe suporte no dia do evento?', answer: 'Sim, oferecemos suporte prioritário por chat em todos os planos.' }
  ];

  const navItems = ['Início','Funcionalidades','Preços','Depoimentos','Contato'];

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow sticky top-0 z-50">
        <Link href="/" className="text-xl font-serif font-bold text-[#863F44] flex items-center">
          Celebre<span className="ml-2 animate-pulse">🥂</span>
        </Link>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl" aria-label="Toggle menu">
          {menuOpen ? '×' : '☰'}
        </button>
        <nav className="hidden md:flex space-x-6">
          {navItems.map(item => (
            <Link key={item} href={`#${item.toLowerCase()}`} className="hover:text-[#B87D8A] transition">
              {item}
            </Link>
          ))}
        </nav>
        <Link href="/create" className="hidden md:block px-4 py-2 bg-[#863F44] text-white rounded-lg hover:shadow-lg">
          Criar meu evento
        </Link>
      </header>

      <MobileMenu open={menuOpen} toggle={() => setMenuOpen(prev => !prev)} />

      <main className="overflow-x-hidden">
        <Hero1 />
        <FeatureList features={features} />
        <PortfolioSection items={portfolioItems} />

        <section id="depoimentos" className="py-16 px-6 md:px-12 bg-[#FAF9F7]">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">O que dizem nossos usuários</h2>
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
            {testimonials.map((t, idx) => (
              <TestimonialCard key={idx} name={t.name} text={t.text} img={t.img} />
            ))}
          </div>
        </section>

        <PricingSection plans={plans} />
        <FAQSection items={faqItems} />
      </main>

      <Footer />
    </>
  );
}