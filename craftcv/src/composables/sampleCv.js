// Fictional example CV used for template thumbnails and the landing page.
import { lang as uiLang } from '../i18n/index.js'
export const SAMPLE_CV = {
  fn: 'Amara', ln: 'Mensah', title: 'Senior Product Manager',
  email: 'amara.mensah@email.com', phone: '+44 7700 900123', loc: 'London, UK',
  li: 'linkedin.com/in/amaramensah', website: '', photo: null, lang: 'en',
  sum: 'Product manager with 8 years of experience building B2B SaaS products. Leads cross-functional teams from discovery to launch, with a focus on data-informed decisions and clear communication.',
  experiences: [
    { id: 1, title: 'Senior Product Manager', company: 'Northwind Analytics', period: '2021 – Present',
      desc: 'Own the roadmap for the reporting suite used by 1,200 business customers\nLed discovery and launch of self-serve dashboards, cutting support tickets by 30%\nManage a squad of 7 engineers and 2 designers' },
    { id: 2, title: 'Product Manager', company: 'Brightpath Software', period: '2018 – 2021',
      desc: 'Launched the mobile app from first prototype to 50,000 monthly users\nIntroduced quarterly OKRs and a shared experiment backlog' },
    { id: 3, title: 'Business Analyst', company: 'Kwame & Co Consulting', period: '2016 – 2018',
      desc: 'Analysed operations data for retail and logistics clients and presented recommendations to senior stakeholders' },
  ],
  skills: ['Product strategy', 'Roadmapping', 'User research', 'SQL', 'A/B testing', 'Stakeholder management', 'Agile / Scrum', 'Figma'],
  education: [
    { degree: 'MSc Management of Information Systems', school: 'London School of Economics', year: '2016' },
    { degree: 'BSc Computer Science', school: 'University of Ghana', year: '2014' },
  ],
  projects: [],
  certifications: ['Professional Scrum Product Owner (PSPO I)'],
  languages: [{ name: 'English', level: 'Native' }, { name: 'French', level: 'Professional (B2)' }, { name: 'Twi', level: 'Native' }],
}

// The same example in French, shown while the app is in French
export const SAMPLE_CV_FR = {
  ...SAMPLE_CV,
  title: 'Chef de produit senior', phone: '+33 6 12 34 56 78', loc: 'Paris, France', lang: 'fr',
  sum: 'Chef de produit avec 8 ans d’expérience dans les logiciels SaaS B2B. Pilote des équipes pluridisciplinaires de la découverte au lancement, avec des décisions fondées sur les données et une communication claire.',
  experiences: [
    { id: 1, title: 'Chef de produit senior', company: 'Northwind Analytics', period: '2021 – Aujourd’hui',
      desc: 'Responsable de la feuille de route des outils de reporting utilisés par 1 200 entreprises clientes\nPilotage de la découverte et du lancement de tableaux de bord en libre-service, avec 30 % de tickets de support en moins\nEncadrement d’une équipe de 7 développeurs et 2 designers' },
    { id: 2, title: 'Chef de produit', company: 'Brightpath Software', period: '2018 – 2021',
      desc: 'Lancement de l’application mobile, du premier prototype à 50 000 utilisateurs mensuels\nMise en place d’OKR trimestriels et d’un backlog d’expérimentations partagé' },
    { id: 3, title: 'Business analyst', company: 'Kwame & Co Consulting', period: '2016 – 2018',
      desc: 'Analyse des données opérationnelles de clients de la distribution et de la logistique, et recommandations présentées aux dirigeants' },
  ],
  skills: ['Stratégie produit', 'Feuille de route', 'Recherche utilisateur', 'SQL', 'Tests A/B', 'Gestion des parties prenantes', 'Agile / Scrum', 'Figma'],
  education: [
    { degree: 'Master en systèmes d’information', school: 'London School of Economics', year: '2016' },
    { degree: 'Licence d’informatique', school: 'University of Ghana', year: '2014' },
  ],
  certifications: ['Professional Scrum Product Owner (PSPO I)'],
  languages: [{ name: 'Anglais', level: 'Langue maternelle' }, { name: 'Français', level: 'Courant (B2)' }, { name: 'Twi', level: 'Langue maternelle' }],
}

export const SAMPLE_CV_ES = {
  ...SAMPLE_CV,
  title: 'Product Manager sénior', phone: '+34 612 345 678', loc: 'Madrid, España', lang: 'es',
  sum: 'Product manager con 8 años de experiencia en productos SaaS B2B. Dirige equipos multidisciplinares desde la investigación hasta el lanzamiento, con decisiones basadas en datos y una comunicación clara.',
  experiences: [
    { id: 1, title: 'Product Manager sénior', company: 'Northwind Analytics', period: '2021 – Actualidad',
      desc: 'Responsable del roadmap de la suite de informes que usan 1.200 empresas clientes\nLideró la investigación y el lanzamiento de paneles de autoservicio, con un 30 % menos de incidencias de soporte\nDirige un equipo de 7 ingenieros y 2 diseñadores' },
    { id: 2, title: 'Product Manager', company: 'Brightpath Software', period: '2018 – 2021',
      desc: 'Lanzó la app móvil, del primer prototipo a 50.000 usuarios mensuales\nIntrodujo OKR trimestrales y un backlog de experimentos compartido' },
    { id: 3, title: 'Analista de negocio', company: 'Kwame & Co Consulting', period: '2016 – 2018',
      desc: 'Analizó datos operativos de clientes de retail y logística y presentó recomendaciones a la dirección' },
  ],
  skills: ['Estrategia de producto', 'Roadmap', 'Investigación de usuarios', 'SQL', 'Tests A/B', 'Gestión de stakeholders', 'Agile / Scrum', 'Figma'],
  education: [
    { degree: 'Máster en Sistemas de Información', school: 'London School of Economics', year: '2016' },
    { degree: 'Grado en Informática', school: 'University of Ghana', year: '2014' },
  ],
  languages: [{ name: 'Inglés', level: 'Nativo' }, { name: 'Francés', level: 'Profesional (B2)' }, { name: 'Twi', level: 'Nativo' }],
}

export const SAMPLE_CV_DE = {
  ...SAMPLE_CV,
  title: 'Senior Product Manager', phone: '+49 151 23456789', loc: 'Berlin, Deutschland', lang: 'de',
  sum: 'Product Managerin mit 8 Jahren Erfahrung mit B2B-SaaS-Produkten. Führt funktionsübergreifende Teams von der Discovery bis zum Launch, mit datenbasierten Entscheidungen und klarer Kommunikation.',
  experiences: [
    { id: 1, title: 'Senior Product Manager', company: 'Northwind Analytics', period: '2021 – heute',
      desc: 'Verantwortet die Roadmap der Reporting-Suite für 1.200 Geschäftskunden\nLeitete Discovery und Launch von Self-Service-Dashboards, 30 % weniger Support-Tickets\nFührt ein Team aus 7 Entwicklern und 2 Designern' },
    { id: 2, title: 'Product Manager', company: 'Brightpath Software', period: '2018 – 2021',
      desc: 'Brachte die mobile App vom ersten Prototyp auf 50.000 monatliche Nutzer\nFührte quartalsweise OKRs und ein gemeinsames Experiment-Backlog ein' },
    { id: 3, title: 'Business Analyst', company: 'Kwame & Co Consulting', period: '2016 – 2018',
      desc: 'Analysierte Betriebsdaten von Handels- und Logistikkunden und präsentierte Empfehlungen vor der Geschäftsleitung' },
  ],
  skills: ['Produktstrategie', 'Roadmapping', 'Nutzerforschung', 'SQL', 'A/B-Tests', 'Stakeholder-Management', 'Agile / Scrum', 'Figma'],
  education: [
    { degree: 'MSc Wirtschaftsinformatik', school: 'London School of Economics', year: '2016' },
    { degree: 'BSc Informatik', school: 'University of Ghana', year: '2014' },
  ],
  languages: [{ name: 'Englisch', level: 'Muttersprache' }, { name: 'Französisch', level: 'Verhandlungssicher (B2)' }, { name: 'Twi', level: 'Muttersprache' }],
}

export const SAMPLE_CV_IT = {
  ...SAMPLE_CV,
  title: 'Senior Product Manager', phone: '+39 320 123 4567', loc: 'Milano, Italia', lang: 'it',
  sum: 'Product manager con 8 anni di esperienza su prodotti SaaS B2B. Guida team interfunzionali dalla discovery al lancio, con decisioni basate sui dati e una comunicazione chiara.',
  experiences: [
    { id: 1, title: 'Senior Product Manager', company: 'Northwind Analytics', period: '2021 – oggi',
      desc: 'Responsabile della roadmap della suite di reportistica usata da 1.200 aziende clienti\nHa guidato discovery e lancio di dashboard self-service, con il 30% di ticket di assistenza in meno\nGestisce un team di 7 sviluppatori e 2 designer' },
    { id: 2, title: 'Product Manager', company: 'Brightpath Software', period: '2018 – 2021',
      desc: 'Ha lanciato l’app mobile, dal primo prototipo a 50.000 utenti mensili\nHa introdotto OKR trimestrali e un backlog di esperimenti condiviso' },
    { id: 3, title: 'Business Analyst', company: 'Kwame & Co Consulting', period: '2016 – 2018',
      desc: 'Ha analizzato dati operativi di clienti del retail e della logistica, presentando raccomandazioni al management' },
  ],
  skills: ['Strategia di prodotto', 'Roadmap', 'Ricerca utenti', 'SQL', 'Test A/B', 'Gestione degli stakeholder', 'Agile / Scrum', 'Figma'],
  education: [
    { degree: 'Laurea magistrale in Sistemi informativi', school: 'London School of Economics', year: '2016' },
    { degree: 'Laurea in Informatica', school: 'University of Ghana', year: '2014' },
  ],
  languages: [{ name: 'Inglese', level: 'Madrelingua' }, { name: 'Francese', level: 'Professionale (B2)' }, { name: 'Twi', level: 'Madrelingua' }],
}

export const SAMPLE_CV_PT = {
  ...SAMPLE_CV,
  title: 'Gerente de Produto Sênior', phone: '+351 912 345 678', loc: 'Lisboa, Portugal', lang: 'pt',
  sum: 'Gerente de produto com 8 anos de experiência em produtos SaaS B2B. Lidera equipes multidisciplinares da descoberta ao lançamento, com decisões baseadas em dados e comunicação clara.',
  experiences: [
    { id: 1, title: 'Gerente de Produto Sênior', company: 'Northwind Analytics', period: '2021 – Atual',
      desc: 'Responsável pelo roadmap da suíte de relatórios usada por 1.200 empresas clientes\nLiderou a descoberta e o lançamento de painéis self-service, reduzindo em 30% os chamados de suporte\nLidera uma equipe de 7 engenheiros e 2 designers' },
    { id: 2, title: 'Gerente de Produto', company: 'Brightpath Software', period: '2018 – 2021',
      desc: 'Lançou o app móvel, do primeiro protótipo a 50.000 usuários mensais\nImplantou OKRs trimestrais e um backlog de experimentos compartilhado' },
    { id: 3, title: 'Analista de Negócios', company: 'Kwame & Co Consulting', period: '2016 – 2018',
      desc: 'Analisou dados operacionais de clientes de varejo e logística e apresentou recomendações à diretoria' },
  ],
  skills: ['Estratégia de produto', 'Roadmap', 'Pesquisa com usuários', 'SQL', 'Testes A/B', 'Gestão de stakeholders', 'Agile / Scrum', 'Figma'],
  education: [
    { degree: 'Mestrado em Sistemas de Informação', school: 'London School of Economics', year: '2016' },
    { degree: 'Licenciatura em Ciência da Computação', school: 'University of Ghana', year: '2014' },
  ],
  languages: [{ name: 'Inglês', level: 'Nativo' }, { name: 'Francês', level: 'Profissional (B2)' }, { name: 'Twi', level: 'Nativo' }],
}

export const SAMPLE_CV_ZH = {
  ...SAMPLE_CV,
  title: '高级产品经理', phone: '+86 138 1234 5678', loc: '中国上海', lang: 'zh',
  sum: '拥有 8 年 B2B SaaS 产品经验的产品经理。带领跨职能团队完成从需求探索到上线的全过程，注重数据驱动的决策和清晰的沟通。',
  experiences: [
    { id: 1, title: '高级产品经理', company: 'Northwind Analytics', period: '2021 – 至今',
      desc: '负责服务 1,200 家企业客户的报表套件的产品路线图\n主导自助式数据看板的需求探索与上线，客服工单减少 30%\n管理由 7 名工程师和 2 名设计师组成的团队' },
    { id: 2, title: '产品经理', company: 'Brightpath Software', period: '2018 – 2021',
      desc: '推出移动应用，从第一个原型做到月活跃用户 50,000\n引入季度 OKR 和共享的实验待办清单' },
    { id: 3, title: '业务分析师', company: 'Kwame & Co Consulting', period: '2016 – 2018',
      desc: '分析零售和物流客户的运营数据，并向高层管理者提出建议' },
  ],
  skills: ['产品策略', '产品路线图', '用户研究', 'SQL', 'A/B 测试', '利益相关方管理', '敏捷 / Scrum', 'Figma'],
  education: [
    { degree: '信息系统管理硕士', school: '伦敦政治经济学院', year: '2016' },
    { degree: '计算机科学学士', school: '加纳大学', year: '2014' },
  ],
  languages: [{ name: '英语', level: '母语' }, { name: '法语', level: '工作熟练（B2）' }, { name: '契维语', level: '母语' }],
}

// Example CV in the interface language
const SAMPLES = { en: SAMPLE_CV, fr: SAMPLE_CV_FR, es: SAMPLE_CV_ES, de: SAMPLE_CV_DE, it: SAMPLE_CV_IT, pt: SAMPLE_CV_PT, zh: SAMPLE_CV_ZH }
export const sampleCv = () => SAMPLES[uiLang.value] || SAMPLE_CV
