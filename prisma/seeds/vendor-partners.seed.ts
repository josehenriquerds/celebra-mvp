import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedVendorPartners() {
  console.log('🌱 Seeding vendor partners...')

  // Vendor 1: Rosa Buffet (Aprovado, Completo)
  const rosaBuffet = await prisma.vendorPartner.create({
    data: {
      slug: 'rosabuffet-vitoria',
      companyName: 'Rosa Buffet',
      contactName: 'Carla Rosa',
      email: 'contato@rosabuffet.com',
      phoneE164: '+5527999111111',
      instagramHandle: 'rosabuffet',
      websiteUrl: 'https://rosabuffet.com.br',
      whatsappUrl: 'https://wa.me/5527999111111',
      city: 'Vitória',
      state: 'ES',
      country: 'BR',
      serviceRadiusKm: 50,
      categories: ['Buffet', 'Doces'],
      priceFromCents: 150000, // R$ 1.500,00
      descriptionShort: 'Buffet artesanal com menu capixaba e opções veganas.',
      descriptionLong:
        'O Rosa Buffet é especializado em eventos intimistas e grandes celebrações. Trabalhamos com ingredientes locais e frescos, oferecendo um menu autêntico capixaba com toque contemporâneo. Atendemos casamentos, aniversários, eventos corporativos e muito mais. Nossa equipe conta com chefs experientes e serviço impecável.',
      status: 'approved',
      profileScore: 95,
      consentText: 'Li e aceito os termos e a política de privacidade do Celebre.',
      consentAt: new Date('2025-01-10'),
      createdAt: new Date('2025-01-10'),
    },
  })

  await prisma.vendorMedia.createMany({
    data: [
      {
        vendorId: rosaBuffet.id,
        type: 'logo',
        url: '/uploads/mock/rosabuffet-logo.jpg',
        sortOrder: 0,
      },
      {
        vendorId: rosaBuffet.id,
        type: 'cover',
        url: '/uploads/mock/rosabuffet-cover.jpg',
        sortOrder: 0,
      },
      {
        vendorId: rosaBuffet.id,
        type: 'gallery',
        url: '/uploads/mock/rosabuffet-1.jpg',
        sortOrder: 1,
      },
      {
        vendorId: rosaBuffet.id,
        type: 'gallery',
        url: '/uploads/mock/rosabuffet-2.jpg',
        sortOrder: 2,
      },
      {
        vendorId: rosaBuffet.id,
        type: 'gallery',
        url: '/uploads/mock/rosabuffet-3.jpg',
        sortOrder: 3,
      },
      {
        vendorId: rosaBuffet.id,
        type: 'gallery',
        url: '/uploads/mock/rosabuffet-4.jpg',
        sortOrder: 4,
      },
      {
        vendorId: rosaBuffet.id,
        type: 'gallery',
        url: '/uploads/mock/rosabuffet-5.jpg',
        sortOrder: 5,
      },
    ],
  })

  await prisma.vendorReview.createMany({
    data: [
      {
        vendorId: rosaBuffet.id,
        rating: 5,
        comment: 'Buffet impecável! Todos os convidados elogiaram.',
      },
      {
        vendorId: rosaBuffet.id,
        rating: 5,
        comment: 'Comida deliciosa e serviço de primeira. Recomendo!',
      },
      {
        vendorId: rosaBuffet.id,
        rating: 4,
        comment: 'Muito bom, apenas o preço um pouco alto.',
      },
    ],
  })

  await prisma.vendorStatusLog.create({
    data: {
      vendorId: rosaBuffet.id,
      action: 'submitted',
      reason: 'Cadastro inicial',
      createdAt: new Date('2025-01-10'),
    },
  })

  await prisma.vendorStatusLog.create({
    data: {
      vendorId: rosaBuffet.id,
      action: 'approved',
      actorUserId: 'admin',
      reason: 'Perfil completo e verificado',
      createdAt: new Date('2025-01-11'),
    },
  })

  // Vendor 2: Studio Click Fotografia (Aprovado)
  const studioClick = await prisma.vendorPartner.create({
    data: {
      slug: 'studioclick-vitoria',
      companyName: 'Studio Click Fotografia',
      contactName: 'Pedro Silva',
      email: 'contato@studioclick.com',
      phoneE164: '+5527999222222',
      instagramHandle: 'studioclick_es',
      whatsappUrl: 'https://wa.me/5527999222222',
      city: 'Vitória',
      state: 'ES',
      country: 'BR',
      serviceRadiusKm: 100,
      categories: ['Fotografia', 'Filmagem'],
      priceFromCents: 200000, // R$ 2.000,00
      descriptionShort: 'Fotografia autoral para casamentos e eventos.',
      descriptionLong:
        'Especialistas em capturar momentos únicos com um olhar artístico e sensível. Oferecemos pacotes completos de fotografia e filmagem, com edição profissional e álbuns personalizados. Mais de 10 anos de experiência em eventos.',
      status: 'approved',
      profileScore: 85,
      consentText: 'Li e aceito os termos e a política de privacidade do Celebre.',
      consentAt: new Date('2025-01-12'),
      createdAt: new Date('2025-01-12'),
    },
  })

  await prisma.vendorMedia.createMany({
    data: [
      {
        vendorId: studioClick.id,
        type: 'logo',
        url: '/uploads/mock/studioclick-logo.jpg',
        sortOrder: 0,
      },
      {
        vendorId: studioClick.id,
        type: 'cover',
        url: '/uploads/mock/studioclick-cover.jpg',
        sortOrder: 0,
      },
      {
        vendorId: studioClick.id,
        type: 'gallery',
        url: '/uploads/mock/studioclick-1.jpg',
        sortOrder: 1,
      },
      {
        vendorId: studioClick.id,
        type: 'gallery',
        url: '/uploads/mock/studioclick-2.jpg',
        sortOrder: 2,
      },
      {
        vendorId: studioClick.id,
        type: 'gallery',
        url: '/uploads/mock/studioclick-3.jpg',
        sortOrder: 3,
      },
    ],
  })

  // Vendor 3: DJ Beats (Pendente)
  const djBeats = await prisma.vendorPartner.create({
    data: {
      slug: 'djbeats-vila-velha',
      companyName: 'DJ Beats',
      contactName: 'Carlos Souza',
      email: 'djbeats@gmail.com',
      phoneE164: '+5527999333333',
      instagramHandle: 'djbeats_official',
      whatsappUrl: 'https://wa.me/5527999333333',
      city: 'Vila Velha',
      state: 'ES',
      country: 'BR',
      categories: ['DJ', 'Som'],
      priceFromCents: 80000, // R$ 800,00
      descriptionShort: 'DJ profissional para festas e eventos.',
      descriptionLong:
        'Som de qualidade e muita animação! Trabalho com todos os estilos musicais e equipamento de última geração.',
      status: 'pending_review',
      profileScore: 45,
      consentText: 'Li e aceito os termos e a política de privacidade do Celebre.',
      consentAt: new Date('2025-01-14'),
      createdAt: new Date('2025-01-14'),
    },
  })

  await prisma.vendorStatusLog.create({
    data: {
      vendorId: djBeats.id,
      action: 'submitted',
      reason: 'Cadastro inicial',
      createdAt: new Date('2025-01-14'),
    },
  })

  // Vendor 4: Flores & Cia (Aprovado)
  const floresCia = await prisma.vendorPartner.create({
    data: {
      slug: 'florescia-serra',
      companyName: 'Flores & Cia Decoração',
      contactName: 'Maria Oliveira',
      email: 'contato@florescia.com.br',
      phoneE164: '+5527999444444',
      instagramHandle: 'florescia_decoracao',
      websiteUrl: 'https://florescia.com.br',
      whatsappUrl: 'https://wa.me/5527999444444',
      city: 'Serra',
      state: 'ES',
      country: 'BR',
      serviceRadiusKm: 30,
      categories: ['Decoração', 'Flores'],
      priceFromCents: 300000, // R$ 3.000,00
      descriptionShort: 'Decoração floral sofisticada para eventos inesquecíveis.',
      descriptionLong:
        'Transformamos ambientes com arranjos florais exclusivos e decoração personalizada. Trabalhamos com flores nacionais e importadas, sempre priorizando a qualidade e frescor. Nossa equipe cria projetos sob medida para cada ocasião.',
      status: 'approved',
      profileScore: 90,
      consentText: 'Li e aceito os termos e a política de privacidade do Celebre.',
      consentAt: new Date('2025-01-08'),
      createdAt: new Date('2025-01-08'),
    },
  })

  await prisma.vendorMedia.createMany({
    data: [
      {
        vendorId: floresCia.id,
        type: 'logo',
        url: '/uploads/mock/florescia-logo.jpg',
        sortOrder: 0,
      },
      {
        vendorId: floresCia.id,
        type: 'cover',
        url: '/uploads/mock/florescia-cover.jpg',
        sortOrder: 0,
      },
      {
        vendorId: floresCia.id,
        type: 'gallery',
        url: '/uploads/mock/florescia-1.jpg',
        sortOrder: 1,
      },
      {
        vendorId: floresCia.id,
        type: 'gallery',
        url: '/uploads/mock/florescia-2.jpg',
        sortOrder: 2,
      },
      {
        vendorId: floresCia.id,
        type: 'gallery',
        url: '/uploads/mock/florescia-3.jpg',
        sortOrder: 3,
      },
      {
        vendorId: floresCia.id,
        type: 'gallery',
        url: '/uploads/mock/florescia-4.jpg',
        sortOrder: 4,
      },
    ],
  })

  // Vendor 5: Espaço Jardim Eventos (Aprovado)
  const espacoJardim = await prisma.vendorPartner.create({
    data: {
      slug: 'espacojardim-vitoria',
      companyName: 'Espaço Jardim Eventos',
      contactName: 'Roberto Costa',
      email: 'contato@espacojardim.com.br',
      phoneE164: '+5527999555555',
      instagramHandle: 'espacojardim_eventos',
      websiteUrl: 'https://espacojardim.com.br',
      whatsappUrl: 'https://wa.me/5527999555555',
      city: 'Vitória',
      state: 'ES',
      country: 'BR',
      categories: ['Espaço', 'Cerimonial'],
      priceFromCents: 500000, // R$ 5.000,00
      descriptionShort: 'Espaço amplo e arborizado para eventos ao ar livre.',
      descriptionLong:
        'O Espaço Jardim é perfeito para cerimônias e recepções ao ar livre. Contamos com área coberta para 300 pessoas, jardim com lago, estacionamento amplo e equipe de cerimonial. Ideal para casamentos, formaturas e eventos corporativos.',
      status: 'approved',
      profileScore: 100,
      consentText: 'Li e aceito os termos e a política de privacidade do Celebre.',
      consentAt: new Date('2025-01-05'),
      createdAt: new Date('2025-01-05'),
    },
  })

  await prisma.vendorMedia.createMany({
    data: [
      {
        vendorId: espacoJardim.id,
        type: 'logo',
        url: '/uploads/mock/espacojardim-logo.jpg',
        sortOrder: 0,
      },
      {
        vendorId: espacoJardim.id,
        type: 'cover',
        url: '/uploads/mock/espacojardim-cover.jpg',
        sortOrder: 0,
      },
      {
        vendorId: espacoJardim.id,
        type: 'gallery',
        url: '/uploads/mock/espacojardim-1.jpg',
        sortOrder: 1,
      },
      {
        vendorId: espacoJardim.id,
        type: 'gallery',
        url: '/uploads/mock/espacojardim-2.jpg',
        sortOrder: 2,
      },
      {
        vendorId: espacoJardim.id,
        type: 'gallery',
        url: '/uploads/mock/espacojardim-3.jpg',
        sortOrder: 3,
      },
      {
        vendorId: espacoJardim.id,
        type: 'gallery',
        url: '/uploads/mock/espacojardim-4.jpg',
        sortOrder: 4,
      },
      {
        vendorId: espacoJardim.id,
        type: 'gallery',
        url: '/uploads/mock/espacojardim-5.jpg',
        sortOrder: 5,
      },
      {
        vendorId: espacoJardim.id,
        type: 'gallery',
        url: '/uploads/mock/espacojardim-6.jpg',
        sortOrder: 6,
      },
    ],
  })

  // Vendor 6: Convites Arte & Papel (Pendente)
  const convitesArte = await prisma.vendorPartner.create({
    data: {
      slug: 'convitesarte-vitoria',
      companyName: 'Convites Arte & Papel',
      contactName: 'Ana Paula',
      email: 'ana@convitesarte.com',
      phoneE164: '+5527999666666',
      instagramHandle: 'convitesarte',
      whatsappUrl: 'https://wa.me/5527999666666',
      city: 'Vitória',
      state: 'ES',
      country: 'BR',
      categories: ['Convites'],
      priceFromCents: 1500, // R$ 15,00 por unidade
      descriptionShort: 'Convites personalizados e impressos em papel especial.',
      descriptionLong:
        'Criamos convites únicos para o seu evento, com design exclusivo e impressão de alta qualidade.',
      status: 'pending_review',
      profileScore: 30,
      consentText: 'Li e aceito os termos e a política de privacidade do Celebre.',
      consentAt: new Date('2025-01-15'),
      createdAt: new Date('2025-01-15'),
    },
  })

  console.log('✅ Vendor partners seeded successfully!')
  console.log(`   - ${rosaBuffet.companyName} (${rosaBuffet.slug})`)
  console.log(`   - ${studioClick.companyName} (${studioClick.slug})`)
  console.log(`   - ${djBeats.companyName} (${djBeats.slug})`)
  console.log(`   - ${floresCia.companyName} (${floresCia.slug})`)
  console.log(`   - ${espacoJardim.companyName} (${espacoJardim.slug})`)
  console.log(`   - ${convitesArte.companyName} (${convitesArte.slug})`)
}

// Execute if run directly
if (require.main === module) {
  seedVendorPartners()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
}
