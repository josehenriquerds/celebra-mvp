'use client';
import PricingCard from './PricingCard';

export default function PricingSection({ plans }: { plans: { title: string; price: string; features: string[] }[] }) {
  return (
    <section className="py-16 px-6 md:px-12 bg-gray-50">
      <h2 className="text-3xl font-serif font-bold text-center mb-12">Planos e Preços</h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <PricingCard
            key={index}
            title={plan.title}
            price={plan.price}
            features={plan.features}
          />
        ))}
      </div>
    </section>
  );
}