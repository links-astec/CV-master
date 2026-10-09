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

// Example CV in the interface language
export const sampleCv = () => (uiLang.value === 'fr' ? SAMPLE_CV_FR : SAMPLE_CV)
