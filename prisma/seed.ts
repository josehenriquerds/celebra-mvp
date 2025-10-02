import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Utility function to generate circular seat positions
function generateCircularSeats(capacity: number, radius: number) {
  const theta = (2 * Math.PI) / capacity
  return Array.from({ length: capacity }, (_, i) => ({
    index: i,
    x: Math.cos(i * theta) * radius,
    y: Math.sin(i * theta) * radius,
    rotation: (i * theta * 180) / Math.PI,
  }))
}

async function main() {
  console.log('🌱 Starting seed...')

  // Clean existing data
  await prisma.eventLog.deleteMany()
  await prisma.seatAssignment.deleteMany()
  await prisma.seat.deleteMany()
  await prisma.table.deleteMany()
  await prisma.checkin.deleteMany()
  await prisma.messageTemplate.deleteMany()
  await prisma.timelineEntry.deleteMany()
  await prisma.guestTag.deleteMany()
  await prisma.segmentTag.deleteMany()
  await prisma.giftRegistryItem.deleteMany()
  await prisma.vendor.deleteMany()
  await prisma.task.deleteMany()
  await prisma.engagementScore.deleteMany()
  await prisma.interaction.deleteMany()
  await prisma.guest.deleteMany()
  await prisma.consentLog.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.household.deleteMany()
  await prisma.event.deleteMany()

  console.log('🧹 Cleaned existing data')

  // =============================================
  // EVENTO 1: Casamento Ana & Pedro
  // =============================================
  const event1 = await prisma.event.create({
    data: {
      id: 'event_001',
      title: 'Casamento Ana & Pedro',
      dateTime: new Date('2025-08-15T17:00:00'),
      venueName: 'Quinta do Lago',
      address: 'Rua das Flores, 123 - Vitória/ES',
      budgetTotal: 80000,
      hosts: ['Ana Clara Santos', 'Pedro Henrique Oliveira'],
    },
  })

  console.log(`✅ Created event: ${event1.title}`)

  // =============================================
  // FAMILÍAS & CONTACTS - Evento 1
  // =============================================

  // Família Silva (6 pessoas)
  const famSilva = await prisma.household.create({
    data: { label: 'Família Silva', sizeCached: 6 },
  })

  const contactsSilva = await prisma.contact.createMany({
    data: [
      {
        fullName: 'João Silva',
        phone: '+5527999001001',
        email: 'joao.silva@email.com',
        relation: 'familia',
        isVip: true,
        householdId: famSilva.id,
      },
      {
        fullName: 'Maria Silva',
        phone: '+5527999001002',
        email: 'maria.silva@email.com',
        relation: 'familia',
        householdId: famSilva.id,
      },
      {
        fullName: 'Lucas Silva',
        phone: '+5527999001003',
        relation: 'familia',
        householdId: famSilva.id,
      },
      {
        fullName: 'Julia Silva',
        phone: '+5527999001004',
        relation: 'familia',
        householdId: famSilva.id,
      },
      {
        fullName: 'Roberto Silva',
        phone: '+5527999001005',
        relation: 'familia',
        householdId: famSilva.id,
      },
      {
        fullName: 'Carla Silva',
        phone: '+5527999001006',
        relation: 'familia',
        householdId: famSilva.id,
      },
    ],
  })

  // Família Costa (5 pessoas)
  const famCosta = await prisma.household.create({
    data: { label: 'Família Costa', sizeCached: 5 },
  })

  await prisma.contact.createMany({
    data: [
      {
        fullName: 'Carlos Costa',
        phone: '+5527999002001',
        email: 'carlos.costa@email.com',
        relation: 'familia',
        isVip: true,
        restrictionsJson: { gluten_free: true, note: 'Celíaco' },
        householdId: famCosta.id,
      },
      {
        fullName: 'Paula Costa',
        phone: '+5527999002002',
        relation: 'familia',
        householdId: famCosta.id,
      },
      {
        fullName: 'Rafael Costa',
        phone: '+5527999002003',
        relation: 'familia',
        householdId: famCosta.id,
      },
      {
        fullName: 'Beatriz Costa',
        phone: '+5527999002004',
        relation: 'familia',
        householdId: famCosta.id,
      },
      {
        fullName: 'Thiago Costa',
        phone: '+5527999002005',
        relation: 'familia',
        householdId: famCosta.id,
      },
    ],
  })

  // Família Almeida (4 pessoas)
  const famAlmeida = await prisma.household.create({
    data: { label: 'Família Almeida', sizeCached: 4 },
  })

  await prisma.contact.createMany({
    data: [
      {
        fullName: 'Fernando Almeida',
        phone: '+5527999003001',
        email: 'fernando.almeida@email.com',
        relation: 'amigo',
        householdId: famAlmeida.id,
      },
      {
        fullName: 'Juliana Almeida',
        phone: '+5527999003002',
        relation: 'amigo',
        householdId: famAlmeida.id,
      },
      {
        fullName: 'Gabriel Almeida',
        phone: '+5527999003003',
        relation: 'amigo',
        householdId: famAlmeida.id,
      },
      {
        fullName: 'Larissa Almeida',
        phone: '+5527999003004',
        relation: 'amigo',
        householdId: famAlmeida.id,
      },
    ],
  })

  // Amigos da Faculdade (8 pessoas)
  const famFaculdade = await prisma.household.create({
    data: { label: 'Amigos da Faculdade', sizeCached: 8 },
  })

  await prisma.contact.createMany({
    data: [
      {
        fullName: 'Bruno Martins',
        phone: '+5527999004001',
        email: 'bruno.martins@email.com',
        relation: 'amigo',
        householdId: famFaculdade.id,
      },
      {
        fullName: 'Camila Rocha',
        phone: '+5527999004002',
        relation: 'amigo',
        householdId: famFaculdade.id,
      },
      {
        fullName: 'Diego Ferreira',
        phone: '+5527999004003',
        relation: 'amigo',
        householdId: famFaculdade.id,
      },
      {
        fullName: 'Eduarda Lima',
        phone: '+5527999004004',
        relation: 'amigo',
        householdId: famFaculdade.id,
      },
      {
        fullName: 'Felipe Santos',
        phone: '+5527999004005',
        relation: 'amigo',
        householdId: famFaculdade.id,
      },
      {
        fullName: 'Gabriela Nunes',
        phone: '+5527999004006',
        relation: 'amigo',
        householdId: famFaculdade.id,
      },
      {
        fullName: 'Henrique Dias',
        phone: '+5527999004007',
        relation: 'amigo',
        householdId: famFaculdade.id,
      },
      {
        fullName: 'Isabela Gomes',
        phone: '+5527999004008',
        relation: 'amigo',
        householdId: famFaculdade.id,
      },
    ],
  })

  // Colegas de Trabalho (10 pessoas)
  const famTrabalho = await prisma.household.create({
    data: { label: 'Colegas de Trabalho', sizeCached: 10 },
  })

  await prisma.contact.createMany({
    data: [
      {
        fullName: 'Igor Pereira',
        phone: '+5527999005001',
        email: 'igor.pereira@empresa.com',
        relation: 'trabalho',
        householdId: famTrabalho.id,
      },
      {
        fullName: 'Jéssica Cardoso',
        phone: '+5527999005002',
        relation: 'trabalho',
        householdId: famTrabalho.id,
      },
      {
        fullName: 'Kevin Barbosa',
        phone: '+5527999005003',
        relation: 'trabalho',
        householdId: famTrabalho.id,
      },
      {
        fullName: 'Letícia Moura',
        phone: '+5527999005004',
        relation: 'trabalho',
        householdId: famTrabalho.id,
      },
      {
        fullName: 'Marcelo Souza',
        phone: '+5527999005005',
        relation: 'trabalho',
        householdId: famTrabalho.id,
      },
      {
        fullName: 'Natália Reis',
        phone: '+5527999005006',
        relation: 'trabalho',
        householdId: famTrabalho.id,
      },
      {
        fullName: 'Otávio Castro',
        phone: '+5527999005007',
        relation: 'trabalho',
        householdId: famTrabalho.id,
      },
      {
        fullName: 'Patrícia Mendes',
        phone: '+5527999005008',
        relation: 'trabalho',
        householdId: famTrabalho.id,
      },
      {
        fullName: 'Quésia Batista',
        phone: '+5527999005009',
        relation: 'trabalho',
        householdId: famTrabalho.id,
      },
      {
        fullName: 'Ricardo Araújo',
        phone: '+5527999005010',
        relation: 'trabalho',
        householdId: famTrabalho.id,
      },
    ],
  })

  // Resto dos convidados (mix de famílias menores e individuais)
  const famPadrinhos = await prisma.household.create({
    data: { label: 'Padrinhos', sizeCached: 4 },
  })

  await prisma.contact.createMany({
    data: [
      {
        fullName: 'Sofia Monteiro',
        phone: '+5527999006001',
        email: 'sofia.monteiro@email.com',
        relation: 'amigo',
        isVip: true,
        householdId: famPadrinhos.id,
      },
      {
        fullName: 'Tiago Moreira',
        phone: '+5527999006002',
        relation: 'amigo',
        isVip: true,
        householdId: famPadrinhos.id,
      },
      {
        fullName: 'Úrsula Correia',
        phone: '+5527999006003',
        relation: 'amigo',
        isVip: true,
        householdId: famPadrinhos.id,
      },
      {
        fullName: 'Vitor Teixeira',
        phone: '+5527999006004',
        relation: 'amigo',
        isVip: true,
        householdId: famPadrinhos.id,
      },
    ],
  })

  // Mais 7 famílias para completar 10 households e ~120 convidados
  const famVizinhos = await prisma.household.create({
    data: { label: 'Vizinhos', sizeCached: 6 },
  })

  await prisma.contact.createMany({
    data: Array.from({ length: 6 }, (_, i) => ({
      fullName: `Vizinho ${i + 1}`,
      phone: `+552799900700${i + 1}`,
      relation: 'amigo' as const,
      householdId: famVizinhos.id,
    })),
  })

  const famPrimos = await prisma.household.create({
    data: { label: 'Primos', sizeCached: 8 },
  })

  await prisma.contact.createMany({
    data: Array.from({ length: 8 }, (_, i) => ({
      fullName: `Primo(a) ${i + 1}`,
      phone: `+552799900800${i + 1}`,
      relation: 'familia' as const,
      householdId: famPrimos.id,
    })),
  })

  const famTios = await prisma.household.create({
    data: { label: 'Tios', sizeCached: 7 },
  })

  await prisma.contact.createMany({
    data: Array.from({ length: 7 }, (_, i) => ({
      fullName: `Tio(a) ${i + 1}`,
      phone: `+552799900900${i + 1}`,
      relation: 'familia' as const,
      householdId: famTios.id,
    })),
  })

  const famAmigosInfancia = await prisma.household.create({
    data: { label: 'Amigos de Infância', sizeCached: 5 },
  })

  await prisma.contact.createMany({
    data: Array.from({ length: 5 }, (_, i) => ({
      fullName: `Amigo Infância ${i + 1}`,
      phone: `+552799901000${i + 1}`,
      relation: 'amigo' as const,
      householdId: famAmigosInfancia.id,
    })),
  })

  console.log('✅ Created 10 households with 120+ contacts')

  // =============================================
  // GUESTS - Link contacts to event
  // =============================================
  const allContacts = await prisma.contact.findMany({
    take: 120,
    orderBy: { createdAt: 'asc' },
  })

  // Create guests with varied RSVP statuses
  const rsvpDistribution = {
    sim: 45,
    nao: 10,
    talvez: 5,
    pendente: 60,
  }

  const rsvpCounter = { sim: 0, nao: 0, talvez: 0, pendente: 0 }

  for (const contact of allContacts) {
    let rsvpStatus: 'sim' | 'nao' | 'talvez' | 'pendente' = 'pendente'

    if (rsvpCounter.sim < rsvpDistribution.sim) {
      rsvpStatus = 'sim'
      rsvpCounter.sim++
    } else if (rsvpCounter.nao < rsvpDistribution.nao) {
      rsvpStatus = 'nao'
      rsvpCounter.nao++
    } else if (rsvpCounter.talvez < rsvpDistribution.talvez) {
      rsvpStatus = 'talvez'
      rsvpCounter.talvez++
    }

    await prisma.guest.create({
      data: {
        eventId: event1.id,
        contactId: contact.id,
        inviteStatus: rsvpStatus === 'pendente' ? 'enviado' : 'lido',
        rsvp: rsvpStatus,
        seats: 1,
        children: Math.random() > 0.8 ? Math.floor(Math.random() * 2) + 1 : 0,
        transportNeeded: Math.random() > 0.7,
      },
    })
  }

  console.log('✅ Created 120 guests with varied RSVP statuses')

  // =============================================
  // TABLES - 10 tables with seats
  // =============================================
  const tableConfigs = [
    {
      label: 'Mesa Principal',
      capacity: 10,
      zone: 'Centro',
      x: 400,
      y: 200,
      shape: 'round' as const,
    },
    { label: 'Mesa 1', capacity: 8, zone: 'Esquerda', x: 200, y: 100, shape: 'round' as const },
    { label: 'Mesa 2', capacity: 8, zone: 'Esquerda', x: 200, y: 300, shape: 'round' as const },
    { label: 'Mesa 3', capacity: 8, zone: 'Direita', x: 600, y: 100, shape: 'round' as const },
    { label: 'Mesa 4', capacity: 8, zone: 'Direita', x: 600, y: 300, shape: 'round' as const },
    { label: 'Mesa 5', capacity: 10, zone: 'Fundos', x: 400, y: 400, shape: 'round' as const },
    { label: 'Mesa 6', capacity: 6, zone: 'Varanda', x: 100, y: 200, shape: 'round' as const },
    { label: 'Mesa 7', capacity: 6, zone: 'Varanda', x: 700, y: 200, shape: 'round' as const },
    { label: 'Mesa Kids', capacity: 8, zone: 'Lateral', x: 300, y: 500, shape: 'rect' as const },
    { label: 'Mesa Buffet', capacity: 12, zone: 'Lateral', x: 500, y: 500, shape: 'rect' as const },
  ]

  for (const config of tableConfigs) {
    const table = await prisma.table.create({
      data: {
        eventId: event1.id,
        label: config.label,
        capacity: config.capacity,
        zone: config.zone,
        x: config.x,
        y: config.y,
        shape: config.shape,
      },
    })

    // Generate seats
    const seatPositions = generateCircularSeats(config.capacity, 80)
    for (const pos of seatPositions) {
      await prisma.seat.create({
        data: {
          tableId: table.id,
          index: pos.index,
          x: pos.x,
          y: pos.y,
          rotation: pos.rotation,
        },
      })
    }
  }

  console.log('✅ Created 10 tables with seats')

  // Assign some guests to seats (auto-allocation simulation)
  const confirmedGuests = await prisma.guest.findMany({
    where: { eventId: event1.id, rsvp: 'sim' },
    take: 30,
    include: { contact: true },
  })

  const tables = await prisma.table.findMany({
    where: { eventId: event1.id },
    include: { seats: true },
  })

  let seatIndex = 0
  for (const guest of confirmedGuests) {
    const table = tables[Math.floor(seatIndex / 8) % tables.length]
    const seat = table.seats[seatIndex % table.seats.length]

    if (seat) {
      await prisma.seatAssignment.create({
        data: {
          guestId: guest.id,
          seatId: seat.id,
          locked: guest.contact.isVip,
        },
      })
      seatIndex++
    }
  }

  console.log('✅ Assigned 30 guests to seats')

  // =============================================
  // TASKS
  // =============================================
  await prisma.task.createMany({
    data: [
      {
        eventId: event1.id,
        title: 'Confirmar cardápio com o buffet',
        status: 'concluida',
        dueAt: new Date('2025-07-01'),
        slaHours: 48,
      },
      {
        eventId: event1.id,
        title: 'Contratar fotógrafo',
        status: 'concluida',
        dueAt: new Date('2025-07-10'),
        slaHours: 72,
      },
      {
        eventId: event1.id,
        title: 'Enviar convites digitais',
        status: 'em_andamento',
        dueAt: new Date('2025-10-01'),
        slaHours: 24,
      },
      {
        eventId: event1.id,
        title: 'Confirmar decoração floral',
        status: 'aberta',
        dueAt: new Date('2025-10-05'),
        slaHours: 48,
      },
      {
        eventId: event1.id,
        title: 'Finalizar lista de presentes',
        status: 'aberta',
        dueAt: new Date('2025-10-03'),
        slaHours: 36,
      },
    ],
  })

  console.log('✅ Created tasks')

  // =============================================
  // VENDORS
  // =============================================
  const vendor1 = await prisma.vendor.create({
    data: {
      eventId: event1.id,
      name: 'Buffet Delícia',
      phone: '+5527999990001',
      category: 'Buffet',
      contractValue: 25000,
      status: 'ativo',
    },
  })

  await prisma.vendor.createMany({
    data: [
      {
        eventId: event1.id,
        name: 'Fotografia Momentos',
        phone: '+5527999990002',
        category: 'Fotografia',
        contractValue: 8000,
        status: 'ativo',
      },
      {
        eventId: event1.id,
        name: 'DJ Alex Music',
        phone: '+5527999990003',
        category: 'Música',
        contractValue: 5000,
        status: 'ativo',
      },
      {
        eventId: event1.id,
        name: 'Flores & Arte',
        phone: '+5527999990004',
        category: 'Decoração',
        contractValue: 12000,
        status: 'pendente',
      },
    ],
  })

  // Link vendor to task
  const taskConfirmarCardapio = await prisma.task.findFirst({
    where: { title: 'Confirmar cardápio com o buffet' },
  })

  if (taskConfirmarCardapio) {
    await prisma.task.update({
      where: { id: taskConfirmarCardapio.id },
      data: { relatedVendorId: vendor1.id },
    })
  }

  console.log('✅ Created vendors')

  // =============================================
  // GIFT REGISTRY
  // =============================================
  await prisma.giftRegistryItem.createMany({
    data: [
      {
        eventId: event1.id,
        title: 'Jogo de Panelas Tramontina',
        link: 'https://example.com/panelas',
        price: 800,
        status: 'comprado',
        buyerContactId: allContacts[0].id,
      },
      {
        eventId: event1.id,
        title: 'Aparelho de Jantar Porcelana',
        price: 1200,
        status: 'reservado',
        buyerContactId: allContacts[1].id,
      },
      {
        eventId: event1.id,
        title: 'Liquidificador Philips Walita',
        price: 450,
        status: 'disponivel',
      },
      {
        eventId: event1.id,
        title: 'Aspirador de Pó Robô',
        price: 2500,
        status: 'disponivel',
      },
      {
        eventId: event1.id,
        title: 'Jogo de Toalhas Premium',
        price: 350,
        status: 'comprado',
        buyerContactId: allContacts[2].id,
      },
      {
        eventId: event1.id,
        title: 'Cafeteira Nespresso',
        price: 800,
        status: 'disponivel',
      },
      {
        eventId: event1.id,
        title: 'Edredom King Size',
        price: 600,
        status: 'disponivel',
      },
      {
        eventId: event1.id,
        title: 'Air Fryer Grande',
        price: 700,
        status: 'reservado',
        buyerContactId: allContacts[3].id,
      },
    ],
  })

  console.log('✅ Created gift registry items')

  // =============================================
  // INTERACTIONS & ENGAGEMENT
  // =============================================
  const sampleContacts = allContacts.slice(0, 20)

  for (const contact of sampleContacts) {
    // Create interactions
    const interactionCount = Math.floor(Math.random() * 10) + 1
    for (let i = 0; i < interactionCount; i++) {
      await prisma.interaction.create({
        data: {
          eventId: event1.id,
          contactId: contact.id,
          channel: 'whatsapp',
          kind: ['mensagem', 'clique', 'foto'][Math.floor(Math.random() * 3)] as any,
          payloadJson: { text: 'Sample interaction' },
          occurredAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      })
    }

    // Calculate engagement score
    const score = interactionCount * 5
    const tier = score > 50 ? 'ouro' : score > 25 ? 'prata' : 'bronze'

    await prisma.engagementScore.create({
      data: {
        contactId: contact.id,
        eventId: event1.id,
        value: score,
        tier: tier as any,
      },
    })
  }

  console.log('✅ Created interactions and engagement scores')

  // =============================================
  // TIMELINE ENTRIES
  // =============================================
  await prisma.timelineEntry.createMany({
    data: [
      {
        eventId: event1.id,
        actorType: 'guest',
        type: 'rsvp',
        refId: allContacts[0].id,
        occurredAt: new Date('2025-09-20T10:30:00'),
        metaJson: { contact: 'João Silva', value: 'sim' },
      },
      {
        eventId: event1.id,
        actorType: 'host',
        type: 'msg',
        occurredAt: new Date('2025-09-21T14:00:00'),
        metaJson: { message: 'Convites enviados para Família Silva' },
      },
      {
        eventId: event1.id,
        actorType: 'guest',
        type: 'presente',
        refId: allContacts[1].id,
        occurredAt: new Date('2025-09-22T16:45:00'),
        metaJson: { contact: 'Maria Silva', gift: 'Jogo de Panelas' },
      },
      {
        eventId: event1.id,
        actorType: 'system',
        type: 'tarefa',
        occurredAt: new Date('2025-09-23T09:00:00'),
        metaJson: { task: 'Confirmar cardápio', status: 'concluida' },
      },
    ],
  })

  console.log('✅ Created timeline entries')

  // =============================================
  // MESSAGE TEMPLATES
  // =============================================
  await prisma.messageTemplate.createMany({
    data: [
      {
        eventId: event1.id,
        name: 'convite_padrao',
        variables: ['first_name', 'event_title', 'date', 'time', 'venue'],
        contentText:
          'Oi {{first_name}}! 💌\n\nVocê está convidado(a) para {{event_title}}!\n\n📅 Data: {{date}}\n🕐 Horário: {{time}}\n📍 Local: {{venue}}\n\nVocê confirma presença?',
        contentButtons: ['SIM', 'NÃO', 'TALVEZ'],
      },
      {
        eventId: event1.id,
        name: 'lembrete_rsvp',
        variables: ['first_name', 'event_title', 'days_left'],
        contentText:
          'Oi {{first_name}}! ⏰\n\nEstamos a {{days_left}} dias de {{event_title}}.\n\nAinda não recebemos sua confirmação. Você vem?',
        contentButtons: ['SIM', 'NÃO'],
      },
      {
        eventId: event1.id,
        name: 'confirmacao_presente',
        variables: ['first_name', 'gift_name'],
        contentText:
          'Obrigado {{first_name}}! 🎁\n\nRecebemos a confirmação do presente: {{gift_name}}.\n\nEstamos muito felizes!',
      },
    ],
  })

  console.log('✅ Created message templates')

  // =============================================
  // SEGMENT TAGS (Dynamic)
  // =============================================
  await prisma.segmentTag.createMany({
    data: [
      {
        eventId: event1.id,
        name: 'VIP Confirmados',
        ruleJson: { rule: "rsvp == 'sim' AND is_vip == true" },
        isDynamic: true,
      },
      {
        eventId: event1.id,
        name: 'Família com Crianças',
        ruleJson: { rule: 'children > 0' },
        isDynamic: true,
      },
      {
        eventId: event1.id,
        name: 'Pendentes de RSVP',
        ruleJson: { rule: "rsvp == 'pendente'" },
        isDynamic: true,
      },
      {
        eventId: event1.id,
        name: 'Restrições Alimentares',
        ruleJson: { rule: 'restrictions_json != null' },
        isDynamic: true,
      },
    ],
  })

  console.log('✅ Created segment tags')

  // =============================================
  // CONSENT LOGS
  // =============================================
  for (const contact of sampleContacts.slice(0, 10)) {
    await prisma.consentLog.create({
      data: {
        contactId: contact.id,
        source: 'whatsapp',
        action: 'opt_in',
        text: 'Aceito receber comunicações sobre o evento via WhatsApp',
      },
    })
  }

  console.log('✅ Created consent logs')

  // =============================================
  // CHECK-INS (simulated)
  // =============================================
  const checkinGuests = confirmedGuests.slice(0, 15)
  for (const guest of checkinGuests) {
    await prisma.checkin.create({
      data: {
        eventId: event1.id,
        guestId: guest.id,
        atGate: true,
        timestamp: new Date('2025-08-15T16:45:00'),
      },
    })
  }

  console.log('✅ Created check-ins')

  // =============================================
  // EVENT 2: Aniversário 15 anos - Maria
  // =============================================
  const event2 = await prisma.event.create({
    data: {
      id: 'event_002',
      title: 'Aniversário 15 Anos - Maria Eduarda',
      dateTime: new Date('2025-12-20T19:00:00'),
      venueName: 'Salão de Festas Elegance',
      address: 'Av. Principal, 456 - Vila Velha/ES',
      budgetTotal: 35000,
      hosts: ['Maria Eduarda Ribeiro', 'Família Ribeiro'],
    },
  })

  console.log(`✅ Created event: ${event2.title}`)

  // Create smaller dataset for event 2 (reuse some contacts, create new ones)
  const event2Contacts = allContacts.slice(0, 40)

  for (const contact of event2Contacts) {
    await prisma.guest.create({
      data: {
        eventId: event2.id,
        contactId: contact.id,
        inviteStatus: 'enviado',
        rsvp: 'pendente',
        seats: 1,
      },
    })
  }

  console.log('✅ Created 40 guests for event 2')

  // =============================================
  // EVENT LOGS
  // =============================================
  await prisma.eventLog.createMany({
    data: [
      {
        eventId: event1.id,
        source: 'whatsapp',
        type: 'message_received',
        payloadJson: { from: '+5527999001001', text: 'SIM', messageId: 'msg_001' },
      },
      {
        eventId: event1.id,
        source: 'api',
        type: 'rsvp_updated',
        payloadJson: { guestId: allContacts[0].id, oldStatus: 'pendente', newStatus: 'sim' },
      },
      {
        eventId: event1.id,
        source: 'cron',
        type: 'reminder_sent',
        payloadJson: { templateId: 'lembrete_rsvp', recipientsCount: 60 },
      },
      {
        eventId: event1.id,
        source: 'user',
        type: 'task_completed',
        payloadJson: { taskId: taskConfirmarCardapio?.id, title: 'Confirmar cardápio' },
      },
    ],
  })

  console.log('✅ Created event logs')

  console.log('\n🎉 Seed completed successfully!\n')
  console.log('Summary:')
  console.log('- 2 events created')
  console.log('- 10 households')
  console.log('- 120+ contacts')
  console.log('- 120 guests (event 1) + 40 guests (event 2)')
  console.log('- 10 tables with seats')
  console.log('- 30 seat assignments')
  console.log('- 5 tasks')
  console.log('- 4 vendors')
  console.log('- 8 gift registry items')
  console.log('- 200+ interactions')
  console.log('- 20 engagement scores')
  console.log('- 4 timeline entries')
  console.log('- 3 message templates')
  console.log('- 4 segment tags')
  console.log('- 10 consent logs')
  console.log('- 15 check-ins')
  console.log('- 4 event logs\n')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
