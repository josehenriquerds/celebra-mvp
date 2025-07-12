// NAVIGATION
export const NAV_LINKS = [
  { href: '/', key: 'home', label: 'Home' },
  { href: '/', key: 'how_hilink_work', label: 'How Hilink Work?' },
  { href: '/', key: 'services', label: 'Services' },
  { href: '/', key: 'pricing ', label: 'Pricing ' },
  { href: '/', key: 'contact_us', label: 'Contact Us' },
];


import { 
  FiMessageCircle, 
  FiClipboard, 
  FiCheckCircle, 
  FiMail, 
  FiUsers, 
  FiCpu 
} from "react-icons/fi";

// CAMP SECTION
export const PEOPLE_URL = [
  '/person-1.png',
  '/person-2.png',
  '/person-3.png',
  '/person-4.png',
];

// FEATURES SECTION
  export const FEATURES = [
  {
    title: 'Convide e gerencie tudo pelo WhatsApp',
    icon: FiMessageCircle,
    variant: 'green',
    description:
      'Adicione convidados, envie convites personalizados, receba confirmações e gerencie detalhes do evento com comandos simples pelo WhatsApp. Fácil, rápido e intuitivo.',
  },
  {
    title: 'Checklist interativo do evento',
    icon: FiClipboard,
    variant: 'green',
    description:
      'Monte e acompanhe o checklist de tarefas do casamento, receba lembretes automáticos e garanta que nenhum detalhe seja esquecido. Visualize o progresso de cada etapa.',
  },
  {
    title: 'Confirmações automáticas de presença',
    icon: FiCheckCircle,
    variant: 'green',
    description:
      'Acompanhe as confirmações de presença em tempo real. Os convidados podem responder pelo WhatsApp, e o sistema atualiza tudo automaticamente para você.',
  },
  {
    title: 'Convites digitais personalizáveis',
    icon: FiMail,
    variant: 'orange',
    description:
      'Crie convites elegantes com o seu estilo, envie pelo WhatsApp e acompanhe quem recebeu e visualizou. Personalize com fotos, frases e informações do evento.',
  },
  {
    title: 'Organização centralizada do evento',
    icon: FiUsers,
    variant: 'orange',
    description:
      'Reúna todas as informações do evento em um só lugar: lista de convidados, local, horário, lembretes, checklist e atualizações. Tudo acessível a qualquer momento.',
  },
  {
    title: 'Assistente inteligente de automações',
    icon: FiCpu,
    variant: 'orange',
    description:
      'Receba sugestões automáticas, lembretes, mensagens prontas e tire dúvidas diretamente com a IA integrada à plataforma. Ideal para quem quer praticidade.',
  },
];


// FOOTER SECTION
export const FOOTER_LINKS = [
  {
    title: 'Saiba mais',
    links: [
      'Sobre nós',
      'Próximos eventos',
      'Politica de Privacidade',
      'Entre em contato',
    ],
  },
  {
    title: 'Nossos serviços',
    links: ['Casamentos', 'Chás', 'Eventos Corporativos', 'Aniversários'],
  },
];

export const FOOTER_CONTACT_INFO = {
  title: 'Entre em contato',
  links: [
    { label: 'WhatsApp', value: '27 99710-9712' },
    { label: 'WhatsApp', value: '27 99634-3742' },
    { label: 'Email', value: 'EntaoCelebre@gmail.com' },
  ],
};

export const SOCIALS = {
  title: 'Social',
  links: [
    '/instagram.svg',
  ],
};
