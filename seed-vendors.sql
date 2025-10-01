-- Quick Seed for Vendor Partners
-- Run with: docker exec -i celebre-postgres psql -U postgres -d celebre_db < seed-vendors.sql

-- Vendor 1: Rosa Buffet (Approved)
INSERT INTO vendor_partners (
  id, slug, company_name, contact_name, email, phone_e164,
  instagram_handle, website_url, whatsapp_url,
  city, state, country, service_radius_km,
  categories, price_from_cents,
  description_short, description_long,
  status, profile_score,
  consent_text, consent_at, created_at, updated_at
) VALUES (
  'rosa-buffet-001', 'rosabuffet-vitoria', 'Rosa Buffet', 'Carla Rosa',
  'contato@rosabuffet.com', '+5527999111111',
  'rosabuffet', 'https://rosabuffet.com.br', 'https://wa.me/5527999111111',
  'Vitória', 'ES', 'BR', 50,
  ARRAY['Buffet', 'Doces'], 150000,
  'Buffet artesanal com menu capixaba e opções veganas.',
  'O Rosa Buffet é especializado em eventos intimistas e grandes celebrações. Trabalhamos com ingredientes locais e frescos, oferecendo um menu autêntico capixaba com toque contemporâneo.',
  'approved', 95,
  'Li e aceito os termos e a política de privacidade do Celebre.',
  '2025-01-10', '2025-01-10', NOW()
);

-- Rosa Buffet Media
INSERT INTO vendor_media (id, vendor_id, type, url, sort_order) VALUES
  ('rosa-media-1', 'rosa-buffet-001', 'logo', '/uploads/mock/rosabuffet-logo.jpg', 0),
  ('rosa-media-2', 'rosa-buffet-001', 'cover', '/uploads/mock/rosabuffet-cover.jpg', 0),
  ('rosa-media-3', 'rosa-buffet-001', 'gallery', '/uploads/mock/rosabuffet-1.jpg', 1),
  ('rosa-media-4', 'rosa-buffet-001', 'gallery', '/uploads/mock/rosabuffet-2.jpg', 2);

-- Rosa Buffet Reviews
INSERT INTO vendor_reviews (id, vendor_id, rating, comment, created_at) VALUES
  ('rosa-review-1', 'rosa-buffet-001', 5, 'Buffet maravilhoso! Comida deliciosa e atendimento impecável. - Ana Paula Silva', '2025-01-15'),
  ('rosa-review-2', 'rosa-buffet-001', 5, 'Melhor buffet da Grande Vitória. Super recomendo! - João Santos', '2025-01-20'),
  ('rosa-review-3', 'rosa-buffet-001', 4, 'Muito bom, apenas o doce de leite poderia ser mais cremoso. - Maria Oliveira', '2025-01-22');

-- Vendor 2: Studio Click Fotografia (Approved)
INSERT INTO vendor_partners (
  id, slug, company_name, contact_name, email, phone_e164,
  instagram_handle, whatsapp_url,
  city, state, country, service_radius_km,
  categories, price_from_cents,
  description_short, description_long,
  status, profile_score,
  consent_text, consent_at, created_at, updated_at
) VALUES (
  'studio-click-002', 'studioclick-vitoria', 'Studio Click Fotografia', 'Pedro Almeida',
  'contato@studioclick.com', '+5527999222222',
  'studioclick_es', 'https://wa.me/5527999222222',
  'Vitória', 'ES', 'BR', 100,
  ARRAY['Fotografia', 'Vídeo'], 280000,
  'Fotografia autoral para casamentos e eventos especiais.',
  'Somos especializados em capturar momentos únicos com olhar artístico. Trabalhamos com equipamentos profissionais e entrega em até 30 dias.',
  'approved', 90,
  'Li e aceito os termos e a política de privacidade do Celebre.',
  '2025-01-12', '2025-01-12', NOW()
);

INSERT INTO vendor_media (id, vendor_id, type, url, sort_order) VALUES
  ('studio-media-1', 'studio-click-002', 'logo', '/uploads/mock/studioclick-logo.jpg', 0),
  ('studio-media-2', 'studio-click-002', 'cover', '/uploads/mock/studioclick-cover.jpg', 0);

INSERT INTO vendor_reviews (id, vendor_id, rating, comment, created_at) VALUES
  ('studio-review-1', 'studio-click-002', 5, 'Fotos incríveis! Superou nossas expectativas. - Camila & Rodrigo', '2025-01-18');

-- Vendor 3: DJ Beats (Pending Review)
INSERT INTO vendor_partners (
  id, slug, company_name, contact_name, email, phone_e164,
  instagram_handle, whatsapp_url,
  city, state, country, service_radius_km,
  categories, price_from_cents,
  description_short,
  status, profile_score,
  consent_text, consent_at, created_at, updated_at
) VALUES (
  'dj-beats-003', 'djbeats-vila-velha', 'DJ Beats', 'Carlos DJ',
  'djbeats@email.com', '+5527999333333',
  'djbeats_es', 'https://wa.me/5527999333333',
  'Vila Velha', 'ES', 'BR', 30,
  ARRAY['DJ', 'Som'], 120000,
  'DJ profissional para festas e eventos.',
  'pending_review', 60,
  'Li e aceito os termos e a política de privacidade do Celebre.',
  '2025-01-25', '2025-01-25', NOW()
);

-- Vendor 4: Flores & Cia Decoração (Approved)
INSERT INTO vendor_partners (
  id, slug, company_name, contact_name, email, phone_e164,
  instagram_handle, whatsapp_url,
  city, state, country, service_radius_km,
  categories, price_from_cents,
  description_short, description_long,
  status, profile_score,
  consent_text, consent_at, created_at, updated_at
) VALUES (
  'flores-cia-004', 'florescia-serra', 'Flores & Cia Decoração', 'Juliana Flores',
  'contato@florescia.com.br', '+5527999444444',
  'florescia_decor', 'https://wa.me/5527999444444',
  'Serra', 'ES', 'BR', 40,
  ARRAY['Decoração', 'Flores'], 200000,
  'Decoração floral para casamentos e eventos corporativos.',
  'Criamos ambientes únicos com arranjos florais autorais. Trabalhamos com flores importadas e nacionais, sempre respeitando o conceito do evento.',
  'approved', 88,
  'Li e aceito os termos e a política de privacidade do Celebre.',
  '2025-01-14', '2025-01-14', NOW()
);

INSERT INTO vendor_media (id, vendor_id, type, url, sort_order) VALUES
  ('flores-media-1', 'flores-cia-004', 'logo', '/uploads/mock/florescia-logo.jpg', 0),
  ('flores-media-2', 'flores-cia-004', 'cover', '/uploads/mock/florescia-cover.jpg', 0);

-- Vendor 5: Espaço Jardim Eventos (Approved)
INSERT INTO vendor_partners (
  id, slug, company_name, contact_name, email, phone_e164,
  instagram_handle, website_url, whatsapp_url,
  city, state, country, service_radius_km,
  categories, price_from_cents,
  description_short, description_long,
  status, profile_score,
  consent_text, consent_at, created_at, updated_at
) VALUES (
  'espaco-jardim-005', 'espacojardim-vitoria', 'Espaço Jardim Eventos', 'Ricardo Jardim',
  'contato@espacojardim.com.br', '+5527999555555',
  'espacojardim_es', 'https://espacojardim.com.br', 'https://wa.me/5527999555555',
  'Vitória', 'ES', 'BR', 60,
  ARRAY['Espaço', 'Buffet'], 500000,
  'Espaço para eventos com capacidade para 300 pessoas.',
  'Espaço completo com área coberta e aberta, cozinha industrial, estacionamento para 100 carros e equipe de apoio. Ideal para casamentos, formaturas e eventos corporativos.',
  'approved', 92,
  'Li e aceito os termos e a política de privacidade do Celebre.',
  '2025-01-11', '2025-01-11', NOW()
);

INSERT INTO vendor_media (id, vendor_id, type, url, sort_order) VALUES
  ('jardim-media-1', 'espaco-jardim-005', 'logo', '/uploads/mock/espacojardim-logo.jpg', 0),
  ('jardim-media-2', 'espaco-jardim-005', 'cover', '/uploads/mock/espacojardim-cover.jpg', 0);

-- Vendor 6: Convites Arte & Papel (Pending Review)
INSERT INTO vendor_partners (
  id, slug, company_name, contact_name, email, phone_e164,
  instagram_handle, whatsapp_url,
  city, state, country, service_radius_km,
  categories, price_from_cents,
  description_short,
  status, profile_score,
  consent_text, consent_at, created_at, updated_at
) VALUES (
  'convites-arte-006', 'convitesarte-vitoria', 'Convites Arte & Papel', 'Fernanda Arte',
  'convitesarte@email.com', '+5527999666666',
  'convitesarte', 'https://wa.me/5527999666666',
  'Vitória', 'ES', 'BR', 50,
  ARRAY['Convites', 'Papelaria'], 5000,
  'Convites personalizados e papelaria para eventos.',
  'pending_review', 55,
  'Li e aceito os termos e a política de privacidade do Celebre.',
  '2025-01-26', '2025-01-26', NOW()
);

SELECT '✅ Seeded ' || COUNT(*) || ' vendor partners' FROM vendor_partners;
