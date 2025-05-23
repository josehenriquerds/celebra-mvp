'use client';
import FAQItem from './FAQItem';

export default function FAQSection({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <section className="py-16 bg-[#FAF9F7] px-6 md:px-12">
      <h2 className="text-3xl font-serif font-bold text-center mb-8">Perguntas Frequentes</h2>
      <div className="max-w-3xl mx-auto">
        {items.map((item, index) => (
          <FAQItem key={index} question={item.question} answer={item.answer} />
        ))}
      </div>
    </section>
  );
}