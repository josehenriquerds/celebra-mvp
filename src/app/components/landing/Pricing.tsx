'use client';
import { motion } from 'framer-motion';

const plans = [
  { name: 'Basic', price: '$29/mo', features: ['Up to 5 eventos', 'Suporte básico', 'Exportação CSV'], popular: false },
  { name: 'Pro', price: '$79/mo', features: ['Até 20 eventos', 'Suporte prioritário', 'Templates personalizados'], popular: true },
  { name: 'Enterprise', price: '$199/mo', features: ['Eventos ilimitados', 'Suporte 24/7', 'Integrações avançadas'], popular: false }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-heading text-textPrimary mb-4">Escolha o plano ideal para você</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.2 }} className={`p-6 rounded-lg shadow-lg bg-white ${plan.popular ? 'ring-4 ring-accent' : ''}`}>
              {plan.popular && <div className="text-xs font-semibold text-accent uppercase mb-2">Mais Popular</div>}
              <h3 className="text-xl font-medium text-primary mb-2">{plan.name}</h3>
              <p className="text-2xl font-heading text-textPrimary mb-4">{plan.price}</p>
              <ul className="text-textSecondary mb-6 space-y-2">
                {plan.features.map((f, j) => <li key={j}>• {f}</li>)}
              </ul>
              <button className={`px-4 py-2 rounded-md font-medium transition ${plan.popular ? 'bg-primary text-white' : 'border border-primary text-primary hover:bg-primary hover:text-white'}`}>{plan.popular ? 'Start Pro Plan' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Plan'}</button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}