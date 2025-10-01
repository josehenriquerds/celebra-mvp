'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "O Celebre é realmente gratuito?",
    answer: "Sim! Você pode usar todas as funcionalidades principais (convites, RSVP, dashboard) gratuitamente. Cobramos apenas 3% sobre presentes vendidos através da nossa lista de presentes integrada."
  },
  {
    question: "Quantos convidados posso adicionar?",
    answer: "Não há limite! Você pode adicionar quantos convidados quiser, sem custos adicionais. Nosso sistema é escalável e suporta desde eventos pequenos até grandes celebrações."
  },
  {
    question: "Como funcionam os convites pelo WhatsApp?",
    answer: "Você cria o convite na plataforma e nós enviamos automaticamente para seus convidados via WhatsApp. Eles recebem um link personalizado com todas as informações do evento e podem confirmar presença com um clique."
  },
  {
    question: "Posso personalizar o convite?",
    answer: "Sim! Oferecemos templates prontos que você pode personalizar com suas cores, fotos e textos. Também é possível criar do zero usando nosso editor visual."
  },
  {
    question: "Como funciona a lista de presentes?",
    answer: "Você adiciona produtos de qualquer loja (com link) ou cria um item PIX. Seus convidados escolhem e compram diretamente. Cobramos 3% sobre cada presente vendido através da plataforma."
  },
  {
    question: "Preciso de conhecimento técnico?",
    answer: "Não! Nossa plataforma foi desenhada para ser simples e intuitiva. Se você sabe usar WhatsApp, vai conseguir usar o Celebre sem problemas."
  },
  {
    question: "Os dados dos meus convidados estão seguros?",
    answer: "Sim! Seguimos rigorosamente a LGPD. Seus dados e dos seus convidados são criptografados e armazenados com segurança. Nunca compartilhamos informações com terceiros."
  },
  {
    question: "Posso usar para qualquer tipo de evento?",
    answer: "Sim! Embora seja perfeito para casamentos, você pode usar para aniversários, formaturas, bodas, chá de bebê e qualquer celebração."
  }
];

export default function FAQAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-left">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
