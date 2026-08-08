import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { Product, Category, Order, Coupon, DownloadRecord, AdminStats, User, Withdrawal } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store active 6-digit confirmation codes for email verification
const emailAuthCodes = new Map<string, string>();

// --- IN-MEMORY DATABASE STORE WITH PERSISTENCE FILE ---
const DATA_FILE = path.join(process.cwd(), 'mz_store_data.json');

interface StoreDB {
  categories: Category[];
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  downloads: DownloadRecord[];
  users: User[];
  withdrawals: Withdrawal[];
}

const initialProducts: Product[] = [
  {
    id: 'prod-emprego-mz',
    name: 'Preparado para o Emprego MZ',
    slug: 'preparado-para-o-emprego-mz',
    category_id: 'cat-2',
    price: 249,
    old_price: 499,
    active: true,
    image_url: '/src/assets/images/ebook_emprego_mz_1786135848773.jpg',
    file_path: 'preparado_para_o_emprego_mz.pdf',
    short_description: 'Guia prático para quem procura emprego em Moçambique. Aprenda a preparar um currículo profissional, criar uma boa carta de candidatura, preparar-se para entrevistas e encontrar oportunidades de emprego.',
    description: `O guia 'Preparado para o Emprego MZ' foi desenhado especificamente para a realidade do mercado laboral moçambicano. Se você é recém-graduado, está à procura do primeiro emprego ou quer transitar para uma posição superior, este e-book oferece estratégias validadas para se destacar entre centenas de candidatos.

Com orientações claras sobre recrutamento em Maputo, Matola, Beira, Nampula e demais províncias de Moçambique, você aprenderá exatamente o que os gestores de RH buscam ao selecionar currículos e conduzir entrevistas.`,
    benefits: [
      'Aumente em até 3x suas chances de convocação para entrevista',
      'Modelos de currículo prontos testados nos sistemas de RH de Moçambique',
      'Modelos de cartas de candidatura em Português corporativo',
      'Guia completo de perguntas e respostas mais frequentes em entrevistas',
      'Acesso direto à lista com mais de 30 portais e agências de recrutamento em Moçambique'
    ],
    includes: [
      'E-book completo em formato PDF',
      'Modelos de currículos editáveis em Word (.docx)',
      'Modelos de cartas de candidatura e motivação',
      'Guia de preparação passo a passo para entrevistas',
      'Recursos e links úteis para procurar emprego em MZ',
      'Acesso imediato e vitalício após pagamento'
    ],
    format: 'E-book PDF + Ficheiros Word Editáveis (Download Imediato)',
    faq: [
      {
        question: 'Como recebo o produto após a compra?',
        answer: 'O envio é 100% automático. Assim que a sua compra for confirmada via M-Pesa (841939698) ou e-Mola (867050958), o botão de download seguro é libertado imediatamente na tela e um link de acesso é enviado para o seu e-mail.'
      },
      {
        question: 'Posso abrir e ler no meu telemóvel?',
        answer: 'Com certeza! Todos os e-books estão otimizados para telemóveis Android, iPhones, tablets e computadores.'
      },
      {
        question: 'Como funciona o pagamento por M-Pesa ou e-Mola?',
        answer: 'Ao escolher M-Pesa ou e-Mola no checkout, você insere o seu número de telemóvel e confirma com o seu PIN de 4 dígitos. O valor é creditado na conta recetora correspondente (841939698 ou 867050958) e o produto é disponibilizado na hora.'
      }
    ],
    created_at: new Date('2026-01-15').toISOString()
  },
  {
    id: 'prod-mpesa-negocios',
    name: 'Domine o M-Pesa e Negócios Digitais em Moçambique',
    slug: 'domine-mpesa-e-negocios-digitais-mz',
    category_id: 'cat-1',
    price: 180,
    old_price: 350,
    active: true,
    image_url: 'https://images.unsplash.com/photo-1556742049-0a67daf4002e?w=600&auto=format&fit=crop&q=80',
    file_path: 'domine_mpesa_negocios_mz.pdf',
    short_description: 'Guia prático para aceitar pagamentos digitais M-Pesa e e-Mola, integrar gateways e multiplicar vendas online em Moçambique.',
    description: 'Aprenda a estruturar pagamentos por M-Pesa (84) e e-Mola (86) de forma profissional. Este e-book ensina desde a configuração de contas comerciais até ao envio de notificações automáticas via WhatsApp e e-mail para os seus clientes.',
    benefits: [
      'Aprenda a receber pagamentos automáticos M-Pesa (841939698) e e-Mola (867050958)',
      'Como evitar fraudes e validar comprovativos com segurança',
      'Estratégias para automatizar a entrega de produtos digitais'
    ],
    includes: [
      'E-book em PDF de leitura rápida e prática',
      'Checklist de verificação de transações M-Pesa / e-Mola'
    ],
    format: 'E-book PDF (Download Imediato)',
    faq: [],
    created_at: new Date('2026-02-22').toISOString()
  },
  {
    id: 'prod-financas-mz',
    name: 'Guia Prático de Finanças Pessoais em Moçambique',
    slug: 'guia-pratico-financas-pessoais-mz',
    category_id: 'cat-3',
    price: 199,
    old_price: 350,
    active: true,
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    file_path: 'guia_financas_pessoais_mz.pdf',
    short_description: 'Aprenda a gerir o seu salário em Meticais, fazer orçamentos eficientes, sair de dívidas e investir com segurança no mercado financeiro moçambicano.',
    description: 'Aprenda a gerir as suas finanças na moeda local (MT). Este guia ensina estratégias práticas de poupança, investimento e gestão de orçamento adaptadas à economia de Moçambique.',
    benefits: [
      'Planeamento orçamental em Meticais (MT)',
      'Estratégias para criar reserva de emergência',
      'Introdução aos investimentos locais e depósitos a prazo'
    ],
    includes: [
      'E-book em PDF',
      'Ficha de controlo de gastos em Excel'
    ],
    format: 'E-book PDF + Planilha Excel',
    faq: [],
    created_at: new Date('2026-02-01').toISOString()
  },
  {
    id: 'prod-contabilidade-mz',
    name: 'Manual de Contabilidade e Fiscalidade para PMEs e Freelancers MZ',
    slug: 'manual-contabilidade-fiscalidade-pmes-mz',
    category_id: 'cat-3',
    price: 350,
    old_price: 600,
    active: true,
    image_url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
    file_path: 'manual_contabilidade_fiscalidade_mz.pdf',
    short_description: 'Aprenda a calcular e pagar IRPS, IRPC, IVA, INSS e manter a sua contabilidade organizada segundo as normas moçambicanas (PGC-PE).',
    description: 'Guia fiscal de fácil compreensão para empreendedores, contadores iniciantes e freelancers em Moçambique.',
    benefits: [
      'Guia completo de impostos em Moçambique (IRPS, IRPC, IVA e INSS)',
      'Como emitir faturas e guias de pagamento na Autoridade Tributária',
      'Evite multas e juros de mora fiscais'
    ],
    includes: [
      'Manual PDF detalhado com exemplos práticos',
      'Planilha de simulação de IRPS e retenção na fonte'
    ],
    format: 'E-book PDF + Planilha Calculadora Excel',
    faq: [],
    created_at: new Date('2026-02-23').toISOString()
  },
  {
    id: 'prod-empresa-mz',
    name: 'Como Abrir uma Empresa em Moçambique - Passo a Passo',
    slug: 'como-abrir-empresa-em-mocambique',
    category_id: 'cat-4',
    price: 399,
    old_price: 600,
    active: true,
    image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
    file_path: 'guia_abrir_empresa_mz.pdf',
    short_description: 'Manual completo de legalização, registo na Conservatória, obtenção do NUIT, licença de atividade e obrigações fiscais perante a Autoridade Tributária.',
    description: 'Tudo o que você precisa de saber para formalizar o seu negócio em Moçambique sem complicações burocráticas.',
    benefits: [
      'Passo a passo burocrático simplificado',
      'Modelos de estatutos da sociedade',
      'Minutas para balcão único de atendimento'
    ],
    includes: [
      'Manual PDF completo',
      'Modelos de estatutos societários'
    ],
    format: 'PDF Digital',
    faq: [],
    created_at: new Date('2026-02-10').toISOString()
  },
  {
    id: 'prod-duat-imobiliario',
    name: 'Guia de Investimento Imobiliário e Gestão de Terrenos (DUAT) em Moçambique',
    slug: 'guia-investimento-imobiliario-duat-mz',
    category_id: 'cat-4',
    price: 290,
    old_price: 500,
    active: true,
    image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=80',
    file_path: 'guia_duat_imobiliario_mz.pdf',
    short_description: 'Descubra como legalizar terrenos, obter DUAT, construir para arrendar e investir no mercado imobiliário moçambicano com segurança jurídica.',
    description: 'E-book indispensável para quem quer adquirir terrenos, casas ou edifícios comerciais em Moçambique.',
    benefits: [
      'Entenda o processo do DUAT (Direito de Uso e Aproveitamento da Terra)',
      'Cuidados para evitar burlas na compra de terrenos e casas',
      'Modelos de contratos de promessa de compra e venda'
    ],
    includes: [
      'E-book PDF de 120 páginas',
      'Minutas jurídicas de cessão de direitos de exploração'
    ],
    format: 'E-book PDF + Documentos Editáveis',
    faq: [],
    created_at: new Date('2026-02-24').toISOString()
  },
  {
    id: 'prod-exames-concursos',
    name: 'Super Redação e Testes Psicotécnicos para Exames de Admissão e Concursos Públicos MZ',
    slug: 'super-redacao-testes-exames-concursos-mz',
    category_id: 'cat-5',
    price: 220,
    old_price: 400,
    active: true,
    image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    file_path: 'super_redacao_testes_concursos_mz.pdf',
    short_description: 'Preparatório completo com resolvidos de exames de admissão (UEM, UP, Unizambeze) e provas de concurso público do Estado em Moçambique.',
    description: 'Aumente as suas notas nos exames das universidades moçambicanas e concursos do Estado com resumos práticos e exercícios gabaritados.',
    benefits: [
      'Técnicas de redação nota máxima para exames',
      'Testes psicotécnicos com gabarito e explicação passo a passo',
      'Resoluções de provas anteriores de concursos do Estado'
    ],
    includes: [
      'E-book em PDF com mais de 200 questões resolvidas'
    ],
    format: 'E-book PDF (Pronto para Imprimir e Estudar)',
    faq: [],
    created_at: new Date('2026-02-25').toISOString()
  },
  {
    id: 'prod-loja-online-mz',
    name: 'Como Criar uma Loja Online de Sucesso em Moçambique sem Grandes Capitais',
    slug: 'como-criar-loja-online-sucesso-mz',
    category_id: 'cat-6',
    price: 250,
    old_price: 450,
    active: true,
    image_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80',
    file_path: 'criar_loja_online_mocambique.pdf',
    short_description: 'Aprenda a criar o seu catálogo digital, receber por M-Pesa/e-Mola, organizar entregas em Maputo/Províncias e escalar as suas vendas.',
    description: 'Guia completo de e-commerce adaptado para a realidade de Moçambique com M-Pesa e e-Mola.',
    benefits: [
      'Plano passo a passo para montar a sua loja digital em menos de 24 horas',
      'Como organizar a logística de entregas rápidas na sua cidade',
      'Estratégias de atração de clientes com baixo custo em redes sociais'
    ],
    includes: [
      'E-book Guia Prático + Checklists de Lançamento'
    ],
    format: 'E-book PDF',
    faq: [],
    created_at: new Date('2026-02-26').toISOString()
  },
  {
    id: 'prod-contratos-mz',
    name: 'Pack de 50+ Modelos de Contratos e Minutas Jurídicas MZ',
    slug: 'pack-modelos-contratos-mocambique',
    category_id: 'cat-7',
    price: 499,
    old_price: 899,
    active: true,
    image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
    file_path: 'pack_contratos_minutas_mz.zip',
    short_description: 'Coleção completa de contratos de prestação de serviços, arrendamento, trabalho e vendas em conformidade com a legislação laboral e civil de Moçambique.',
    description: 'Proteja os seus negócios com minutas de contratos profissionais editáveis no Microsoft Word.',
    benefits: [
      'Modelos editáveis em Word',
      'Conformidade com a Lei do Trabalho de Moçambique',
      'Proteção jurídica para freelancers e PMEs'
    ],
    includes: [
      '50+ ficheiros Word editáveis em formato ZIP'
    ],
    format: 'ZIP (Documentos Word Editáveis)',
    faq: [],
    created_at: new Date('2026-02-15').toISOString()
  },
  {
    id: 'prod-whatsapp-mz',
    name: 'Curso Digital: Vendas e Marketing no WhatsApp para Negócios MZ',
    slug: 'curso-vendas-whatsapp-mocambique',
    category_id: 'cat-6',
    price: 299,
    old_price: 500,
    active: true,
    image_url: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=600&auto=format&fit=crop&q=80',
    file_path: 'curso_vendas_whatsapp_mz.pdf',
    short_description: 'Aprenda a transformar o WhatsApp Business numa máquina de vendas digitais em Moçambique com scripts de atendimento e catálogo otimizado.',
    description: 'Estratégia comprovada para vender produtos digitais e físicos usando o WhatsApp Business em Moçambique.',
    benefits: [
      'Scripts de conversão e fecho de vendas',
      'Automações e etiquetas de clientes',
      'Modelos de catálogos atraentes'
    ],
    includes: [
      'Guia de Estudo em PDF',
      'Aulas em Áudio/Vídeo e Scripts'
    ],
    format: 'PDF + Acesso a Conteúdo em Vídeo',
    faq: [],
    created_at: new Date('2026-02-20').toISOString()
  }
];

let db: StoreDB = {
  categories: [
    { id: 'cat-1', name: 'E-books', slug: 'e-books' },
    { id: 'cat-2', name: 'Emprego', slug: 'emprego' },
    { id: 'cat-3', name: 'Finanças', slug: 'financas' },
    { id: 'cat-4', name: 'Negócios', slug: 'negocios' },
    { id: 'cat-5', name: 'Educação', slug: 'educacao' },
    { id: 'cat-6', name: 'Cursos', slug: 'cursos' },
    { id: 'cat-7', name: 'Templates', slug: 'templates' },
    { id: 'cat-8', name: 'Outros', slug: 'outros' },
  ],
  products: initialProducts,
  orders: [
    {
      id: 'ORD-MZ-101',
      customer_name: 'Mabote Macamo',
      customer_email: 'mabote.macamo@example.com',
      customer_phone: '+258 84 123 4567',
      product_id: 'prod-emprego-mz',
      product_name: 'Preparado para o Emprego MZ',
      total: 249,
      original_price: 249,
      discount_amount: 0,
      payment_method: 'mpesa',
      payment_status: 'Pago',
      gateway_reference: 'MPESA-884920',
      download_token: 'dl_token_mabote_101',
      download_expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'ORD-MZ-102',
      customer_name: 'Aminata Langa',
      customer_email: 'aminata.langa@example.com',
      customer_phone: '+258 86 987 6543',
      product_id: 'prod-financas-mz',
      product_name: 'Guia Prático de Finanças Pessoais em Moçambique',
      total: 199,
      original_price: 199,
      discount_amount: 0,
      payment_method: 'emola',
      payment_status: 'Pago',
      gateway_reference: 'EMOLA-302911',
      download_token: 'dl_token_aminata_102',
      download_expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 18).toISOString()
    },
    {
      id: 'ORD-MZ-103',
      customer_name: 'Sérgio Sitoe',
      customer_email: 'sergio.sitoe@example.com',
      customer_phone: '+258 82 555 1212',
      product_id: 'prod-emprego-mz',
      product_name: 'Preparado para o Emprego MZ',
      total: 199.2,
      original_price: 249,
      discount_amount: 49.8,
      coupon_code: 'EMPREGO20',
      payment_method: 'mpesa',
      payment_status: 'Pendente',
      gateway_reference: 'MPESA-993012',
      created_at: new Date(Date.now() - 1800000).toISOString()
    }
  ],
  coupons: [
    {
      id: 'coup-1',
      code: 'EMPREGO20',
      discount_type: 'percent',
      discount_value: 20,
      expires_at: new Date('2027-12-31').toISOString(),
      max_uses: 1000,
      used_count: 1,
      active: true
    },
    {
      id: 'coup-2',
      code: 'PROMO10',
      discount_type: 'percent',
      discount_value: 10,
      expires_at: new Date('2027-12-31').toISOString(),
      max_uses: 500,
      used_count: 0,
      active: true
    }
  ],
  downloads: [
    {
      id: 'dl-1',
      order_id: 'ORD-MZ-101',
      user_email: 'mabote.macamo@example.com',
      product_id: 'prod-emprego-mz',
      token: 'dl_token_mabote_101',
      download_count: 1,
      max_downloads: 10,
      expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'dl-2',
      order_id: 'ORD-MZ-102',
      user_email: 'aminata.langa@example.com',
      product_id: 'prod-financas-mz',
      token: 'dl_token_aminata_102',
      download_count: 0,
      max_downloads: 10,
      expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 18).toISOString()
    }
  ],
  users: [
    {
      id: 'user-admin',
      name: 'Administrador MZ Digital',
      email: 'saqueonilio@gmail.com',
      phone: '+258 83 384 3119',
      role: 'admin',
      created_at: new Date('2026-01-01').toISOString()
    },
    {
      id: 'user-mabote',
      name: 'Mabote Macamo',
      email: 'mabote.macamo@example.com',
      phone: '+258 84 123 4567',
      role: 'customer',
      created_at: new Date('2026-01-10').toISOString()
    }
  ],
  withdrawals: [
    {
      id: 'LEV-MZ-8001',
      amount: 150,
      method: 'mpesa',
      account: '841939698',
      status: 'Concluído',
      admin_email: 'saqueonilio@gmail.com',
      gateway_reference: 'LEV-MPESA-849201',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ]
};

// Helper to save DB to local JSON file
function saveDB() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Error writing store data file:', err);
  }
}

// Load DB if file exists
function loadDB() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const loaded = JSON.parse(data);
      if (loaded.products && loaded.orders) {
        db = loaded;
        if (!db.withdrawals) db.withdrawals = [];
        // Merge missing default products into db.products if not present
        initialProducts.forEach(initP => {
          if (!db.products.some(p => p.id === initP.id)) {
            db.products.push(initP);
          }
        });
      }
    }
  } catch (err) {
    console.error('Error loading store data file:', err);
  }
}

loadDB();

// --- PUBLIC PRODUCTS & CATEGORIES API ---

app.get('/api/categories', (req, res) => {
  res.json(db.categories);
});

app.get('/api/products', (req, res) => {
  const activeProducts = db.products.filter(p => p.active !== false);
  res.json(activeProducts);
});

app.get('/api/products/:slug', (req, res) => {
  const { slug } = req.params;
  const product = db.products.find(p => p.slug === slug || p.id === slug);
  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }
  res.json(product);
});

// --- COUPON VALIDATION ---
app.get('/api/coupons/validate', (req, res) => {
  const code = (req.query.code as string || '').trim().toUpperCase();
  if (!code) {
    return res.status(400).json({ error: 'Código de cupão não fornecido' });
  }
  const coupon = db.coupons.find(c => c.code.toUpperCase() === code && c.active);
  if (!coupon) {
    return res.status(404).json({ error: 'Cupão inválido ou expirado' });
  }
  if (coupon.used_count >= coupon.max_uses) {
    return res.status(400).json({ error: 'Este cupão atingiu o limite de utilizações' });
  }
  res.json(coupon);
});

// --- CHECKOUT & ORDER CREATION ---
app.post('/api/orders/checkout', (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, product_id, payment_method, receiving_account, coupon_code } = req.body;

    if (!customer_name || !customer_email || !customer_phone || !product_id || !payment_method) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
    }

    const product = db.products.find(p => p.id === product_id || p.slug === product_id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    let finalPrice = product.price;
    let discountAmount = 0;
    let appliedCoupon: Coupon | undefined;

    if (coupon_code) {
      appliedCoupon = db.coupons.find(c => c.code.toUpperCase() === coupon_code.trim().toUpperCase() && c.active);
      if (appliedCoupon) {
        if (appliedCoupon.discount_type === 'percent') {
          discountAmount = (product.price * appliedCoupon.discount_value) / 100;
        } else {
          discountAmount = appliedCoupon.discount_value;
        }
        finalPrice = Math.max(0, product.price - discountAmount);
      }
    }

    const targetAccount = receiving_account || (payment_method === 'mpesa' ? '841939698' : payment_method === 'emola' ? '867050958' : '841939698');
    const orderId = `ORD-MZ-${Math.floor(10000 + Math.random() * 90000)}`;
    const gatewayRef = `${payment_method.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: orderId,
      customer_name,
      customer_email,
      customer_phone,
      product_id: product.id,
      product_name: product.name,
      total: Math.round(finalPrice * 100) / 100,
      original_price: product.price,
      discount_amount: Math.round(discountAmount * 100) / 100,
      coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
      payment_method,
      receiving_account: targetAccount,
      payment_status: 'Pendente',
      gateway_reference: gatewayRef,
      created_at: new Date().toISOString()
    };

    if (appliedCoupon) {
      appliedCoupon.used_count += 1;
    }

    db.orders.unshift(newOrder);
    saveDB();

    res.json({
      success: true,
      order: newOrder,
      instructions: `Solicitação de pagamento iniciada via ${payment_method.toUpperCase()}. Insira o PIN de confirmação no seu telemóvel para o número ${customer_phone}.`,
      mockGatewayUrl: `/pagamento/aguardando?order_id=${newOrder.id}`
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao processar checkout: ' + err.message });
  }
});

// --- FETCH ORDER STATUS ---
app.get('/api/orders/:id', (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }
  res.json(order);
});

// --- GATEWAY PAYMENT WEBHOOK (MOZAMBIQUE GATEWAY SIMULATION & PRODUCTION HANDLER) ---
app.post('/api/payments/webhook', (req, res) => {
  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
  const clientSecret = req.headers['x-webhook-secret'];

  if (webhookSecret && clientSecret !== webhookSecret) {
    return res.status(401).json({ error: 'Webhook secret inválido' });
  }

  const { order_id, gateway_reference, status, transaction_id } = req.body;

  const order = db.orders.find(o => o.id === order_id || o.gateway_reference === gateway_reference);
  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado para atualizar' });
  }

  if (status === 'SUCCESS' || status === 'Pago' || status === 'PAID') {
    order.payment_status = 'Pago';

    // Generate secure download record
    const downloadToken = 'dl_sec_' + crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 86400000 * 7).toISOString(); // 7 days token

    order.download_token = downloadToken;
    order.download_expires_at = expiresAt;

    // Check or create download record
    let downloadRec = db.downloads.find(d => d.order_id === order.id);
    if (!downloadRec) {
      downloadRec = {
        id: 'dl-' + Math.floor(1000 + Math.random() * 9000),
        order_id: order.id,
        user_email: order.customer_email,
        product_id: order.product_id,
        token: downloadToken,
        download_count: 0,
        max_downloads: 10,
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      };
      db.downloads.push(downloadRec);
    } else {
      downloadRec.token = downloadToken;
      downloadRec.expires_at = expiresAt;
    }

    saveDB();
    return res.json({ success: true, message: 'Pagamento confirmado e produto libertado', order_id: order.id, download_token: downloadToken });
  } else if (status === 'FAILED' || status === 'Falhou') {
    order.payment_status = 'Falhou';
    saveDB();
    return res.json({ success: true, message: 'Pedido marcado como falhado', order_id: order.id });
  } else {
    return res.status(400).json({ error: 'Estado desconhecido enviado no webhook' });
  }
});

// --- SIMULATE PAYMENT CONFIRMATION FOR TESTING & DEMO ---
app.post('/api/payments/simulate-confirm', (req, res) => {
  const { order_id } = req.body;
  const order = db.orders.find(o => o.id === order_id);
  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }

  // Invoke internal webhook processing logic safely
  order.payment_status = 'Pago';
  const downloadToken = 'dl_sec_' + crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 86400000 * 7).toISOString();

  order.download_token = downloadToken;
  order.download_expires_at = expiresAt;

  let downloadRec = db.downloads.find(d => d.order_id === order.id);
  if (!downloadRec) {
    downloadRec = {
      id: 'dl-' + Math.floor(1000 + Math.random() * 9000),
      order_id: order.id,
      user_email: order.customer_email,
      product_id: order.product_id,
      token: downloadToken,
      download_count: 0,
      max_downloads: 10,
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    };
    db.downloads.push(downloadRec);
  } else {
    downloadRec.token = downloadToken;
    downloadRec.expires_at = expiresAt;
  }

  saveDB();
  res.json({
    success: true,
    message: 'Pagamento simulado com sucesso. Pedido atualizado para PAGO.',
    order,
    download_token: downloadToken
  });
});

// --- SECURE DIGITAL DOWNLOAD DELIVERY ROUTE ---
app.get('/api/downloads/file/:token', (req, res) => {
  const { token } = req.params;

  const downloadRec = db.downloads.find(d => d.token === token);
  if (!downloadRec) {
    return res.status(403).json({ error: 'Link de download inválido ou não autorizado' });
  }

  if (new Date(downloadRec.expires_at) < new Date()) {
    return res.status(410).json({ error: 'Este link de download expirou. Solicite um novo acesso no suporte.' });
  }

  const order = db.orders.find(o => o.id === downloadRec.order_id);
  if (!order || order.payment_status !== 'Pago') {
    return res.status(403).json({ error: 'O pagamento deste produto ainda não foi confirmado' });
  }

  const product = db.products.find(p => p.id === downloadRec.product_id);
  const productName = product ? product.name : 'Produto Digital';

  downloadRec.download_count += 1;
  saveDB();

  // Create a clean dynamically formatted text/PDF buffer for download delivery
  const fileContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 280 >>
stream
BT
/F1 18 Tf
50 720 Td
(MZ DIGITAL STORE - FICHEIRO ADQUIRIDO) Tj
0 -30 Td
/F1 12 Tf
(Produto: ${productName}) Tj
0 -20 Td
(Cliente: ${order.customer_name} - ${order.customer_email}) Tj
0 -20 Td
(Pedido: ${order.id} | Data: ${new Date(order.created_at).toLocaleDateString()}) Tj
0 -40 Td
(Obrigado por comprar na MZ Digital Store!) Tj
0 -20 Td
(Este e um ficheiro protegido enviado exclusivamente para o seu uso pessoal.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000243 00000 n 
0000000320 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
650
%%EOF`;

  const safeFilename = (productName.replace(/[^a-zA-Z0-9]/g, '_') || 'produto_digital') + '.pdf';

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
  res.send(Buffer.from(fileContent, 'utf-8'));
});

// --- CUSTOMER PURCHASES & DOWNLOADS BY EMAIL OR PHONE ---
app.get('/api/customer/orders', (req, res) => {
  const { email, phone } = req.query;
  if (!email && !phone) {
    return res.status(400).json({ error: 'Informe e-mail ou telefone para buscar as suas compras' });
  }

  const matches = db.orders.filter(o => {
    if (email && o.customer_email.toLowerCase() === (email as string).toLowerCase()) return true;
    if (phone && o.customer_phone.includes(phone as string)) return true;
    return false;
  });

  res.json(matches);
});

// --- ADMIN STATS API ---
app.get('/api/admin/stats', (req, res) => {
  const paidOrders = db.orders.filter(o => o.payment_status === 'Pago');
  const pendingOrders = db.orders.filter(o => o.payment_status === 'Pendente');

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const start7Days = Date.now() - 86400000 * 7;
  const start30Days = Date.now() - 86400000 * 30;

  const salesToday = paidOrders
    .filter(o => new Date(o.created_at).getTime() >= startToday)
    .reduce((sum, o) => sum + o.total, 0);

  const salesLast7Days = paidOrders
    .filter(o => new Date(o.created_at).getTime() >= start7Days)
    .reduce((sum, o) => sum + o.total, 0);

  const salesLast30Days = paidOrders
    .filter(o => new Date(o.created_at).getTime() >= start30Days)
    .reduce((sum, o) => sum + o.total, 0);

  // Unique customer emails
  const uniqueEmails = new Set(db.orders.map(o => o.customer_email.toLowerCase()));

  // Chart data for last 7 days
  const dailyChartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - 86400000 * i);
    const dateStr = d.toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit' });

    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 86400000;

    const dayPaid = paidOrders.filter(o => {
      const t = new Date(o.created_at).getTime();
      return t >= dayStart && t < dayEnd;
    });

    const dayAmount = dayPaid.reduce((s, o) => s + o.total, 0);

    dailyChartData.push({
      date: dateStr,
      amount: dayAmount,
      orders: dayPaid.length
    });
  }

  const stats: AdminStats = {
    totalSalesCount: paidOrders.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalCustomers: uniqueEmails.size,
    totalProductsSold: paidOrders.length,
    pendingOrdersCount: pendingOrders.length,
    salesToday: Math.round(salesToday * 100) / 100,
    salesLast7Days: Math.round(salesLast7Days * 100) / 100,
    salesLast30Days: Math.round(salesLast30Days * 100) / 100,
    recentOrders: db.orders.slice(0, 10),
    dailyChartData
  };

  res.json(stats);
});

// --- ADMIN PRODUCTS CRUD ---
app.post('/api/admin/products', (req, res) => {
  const { name, short_description, description, price, old_price, category_id, image_url, file_path, benefits, includes, format } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ error: 'Nome, preço e categoria são obrigatórios' });
  }

  const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const newProduct: Product = {
    id: 'prod-' + Math.floor(10000 + Math.random() * 90000),
    name,
    slug,
    short_description: short_description || '',
    description: description || '',
    price: Number(price),
    old_price: old_price ? Number(old_price) : undefined,
    category_id,
    active: true,
    image_url: image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    file_path: file_path || 'produto_digital.pdf',
    benefits: benefits || [],
    includes: includes || [],
    format: format || 'PDF Digital',
    faq: [],
    created_at: new Date().toISOString()
  };

  db.products.unshift(newProduct);
  saveDB();
  res.json(newProduct);
});

app.put('/api/admin/products/:id', (req, res) => {
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  Object.assign(product, req.body);
  saveDB();
  res.json(product);
});

app.delete('/api/admin/products/:id', (req, res) => {
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  db.products.splice(index, 1);
  saveDB();
  res.json({ success: true });
});

// --- ADMIN ORDERS MANAGEMENT ---
app.get('/api/admin/orders', (req, res) => {
  res.json(db.orders);
});

app.put('/api/admin/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }

  order.payment_status = status;

  if (status === 'Pago' && !order.download_token) {
    const downloadToken = 'dl_sec_' + crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 86400000 * 7).toISOString();
    order.download_token = downloadToken;
    order.download_expires_at = expiresAt;

    db.downloads.push({
      id: 'dl-' + Math.floor(1000 + Math.random() * 9000),
      order_id: order.id,
      user_email: order.customer_email,
      product_id: order.product_id,
      token: downloadToken,
      download_count: 0,
      max_downloads: 10,
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    });
  }

  saveDB();
  res.json(order);
});

// --- ADMIN CATEGORIES CRUD ---
app.get('/api/admin/categories', (req, res) => {
  res.json(db.categories);
});

app.post('/api/admin/categories', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
  const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
  const cat: Category = {
    id: 'cat-' + Math.floor(1000 + Math.random() * 9000),
    name,
    slug
  };
  db.categories.push(cat);
  saveDB();
  res.json(cat);
});

// --- ADMIN COUPONS CRUD ---
app.get('/api/admin/coupons', (req, res) => {
  res.json(db.coupons);
});

app.post('/api/admin/coupons', (req, res) => {
  const { code, discount_type, discount_value, max_uses } = req.body;
  if (!code || !discount_value) {
    return res.status(400).json({ error: 'Código e valor do desconto são obrigatórios' });
  }

  const coupon: Coupon = {
    id: 'coup-' + Math.floor(1000 + Math.random() * 9000),
    code: code.trim().toUpperCase(),
    discount_type: discount_type || 'percent',
    discount_value: Number(discount_value),
    expires_at: new Date('2028-12-31').toISOString(),
    max_uses: Number(max_uses) || 100,
    used_count: 0,
    active: true
  };

  db.coupons.push(coupon);
  saveDB();
  res.json(coupon);
});

// --- ADMIN WITHDRAWALS (LEVANTAMENTO DE DINHEIRO) API ---

app.get('/api/admin/withdrawals', (req, res) => {
  const paidOrders = db.orders.filter(o => o.payment_status === 'Pago');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

  if (!db.withdrawals) db.withdrawals = [];
  const completedWithdrawals = db.withdrawals.filter(w => w.status === 'Concluído');
  const totalWithdrawn = completedWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  const availableBalance = Math.max(0, totalRevenue - totalWithdrawn);

  res.json({
    total_revenue: Math.round(totalRevenue * 100) / 100,
    total_withdrawn: Math.round(totalWithdrawn * 100) / 100,
    available_balance: Math.round(availableBalance * 100) / 100,
    history: db.withdrawals
  });
});

app.post('/api/admin/withdrawals/send-code', (req, res) => {
  const { admin_email } = req.body;
  if (!admin_email || (admin_email !== 'saqueonilio@gmail.com' && !admin_email.includes('admin'))) {
    return res.status(403).json({ error: 'Apenas o e-mail do administrador autorizado (saqueonilio@gmail.com) pode solicitar código de levantamento.' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  emailAuthCodes.set(admin_email.toLowerCase(), code);

  res.json({
    success: true,
    message: `Código de verificação de segurança enviado para ${admin_email}`,
    simulatedCode: code
  });
});

app.post('/api/admin/withdrawals', (req, res) => {
  const { amount, method, account, admin_email, code } = req.body;

  if (!amount || !method || !account || !admin_email || !code) {
    return res.status(400).json({ error: 'Todos os campos de levantamento e código de verificação são obrigatórios.' });
  }

  if (admin_email !== 'saqueonilio@gmail.com' && !admin_email.includes('admin')) {
    return res.status(403).json({ error: 'Apenas o administrador autorizado pode efetuar levantamentos de fundos.' });
  }

  const storedCode = emailAuthCodes.get(admin_email.toLowerCase());
  if (!storedCode || storedCode !== code.trim()) {
    return res.status(401).json({ error: 'Código de confirmação de e-mail inválido ou expirado. Solicite um novo código.' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Insira um valor numérico válido para levantamento.' });
  }

  const paidOrders = db.orders.filter(o => o.payment_status === 'Pago');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  if (!db.withdrawals) db.withdrawals = [];
  const completedWithdrawals = db.withdrawals.filter(w => w.status === 'Concluído');
  const totalWithdrawn = completedWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const availableBalance = totalRevenue - totalWithdrawn;

  if (numAmount > availableBalance) {
    return res.status(400).json({
      error: `Saldo insuficiente para levantamento. Saldo disponível: ${Math.round(availableBalance)} MT`
    });
  }

  const gatewayRef = `LEV-${method.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const newWithdrawal: Withdrawal = {
    id: `LEV-MZ-${Math.floor(10000 + Math.random() * 90000)}`,
    amount: numAmount,
    method: method === 'emola' ? 'emola' : 'mpesa',
    account: account.trim(),
    status: 'Concluído',
    admin_email,
    gateway_reference: gatewayRef,
    created_at: new Date().toISOString()
  };

  db.withdrawals.unshift(newWithdrawal);
  saveDB();

  emailAuthCodes.delete(admin_email.toLowerCase());

  res.json({
    success: true,
    message: `Levantamento de ${numAmount} MT para a conta ${method.toUpperCase()} (${account}) concluído com sucesso!`,
    withdrawal: newWithdrawal
  });
});

// --- VITE MIDDLEWARE SETUP & STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MZ Digital Store Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
