// Soft or technical? Skills typed or pasted into the Skills box are sorted straight away (no AI): soft skills
// are a fairly closed list of personal qualities, so anything not on it is taken as technical. With a job offer,
// the AI check in the Skills step then corrects the few it gets wrong (see task 'skillsFit' in server/index.js).

const SOFT = [
  // English
  'communication', 'teamwork', 'team work', 'team player', 'team spirit', 'collaboration', 'collaborative', 'leadership',
  'problem solving', 'problem-solving', 'critical thinking', 'analytical thinking', 'analytical skills', 'time management',
  'organisation', 'organization', 'organisational', 'organizational', 'adaptability', 'flexibility', 'creativity', 'creative thinking',
  'empathy', 'emotional intelligence', 'attention to detail', 'detail-oriented', 'detail oriented', 'work ethic', 'interpersonal',
  'negotiation', 'conflict resolution', 'decision making', 'decision-making', 'public speaking', 'presentation skills',
  'active listening', 'customer service', 'client relations', 'relationship building', 'mentoring', 'coaching',
  'autonomy', 'self-motivated', 'self motivated', 'self-motivation', 'initiative', 'resilience', 'multitasking', 'multi-tasking',
  'curiosity', 'patience', 'reliability', 'punctuality', 'stress management', 'persuasion', 'storytelling',
  'team management', 'people management', 'team leadership', 'cultural awareness', 'open-mindedness', 'open minded', 'proactive',
  'dependability', 'integrity', 'accountability', 'positive attitude', 'growth mindset', 'cross-functional collaboration',
  'stakeholder communication', 'written communication', 'verbal communication', 'teaching', 'motivation', 'work under pressure',
  // French
  'travail en equipe', 'esprit d\'equipe', 'esprit d’equipe', 'resolution de problemes', 'esprit critique', 'gestion du temps',
  'adaptabilite', 'capacite d\'adaptation', 'capacite d’adaptation', 'flexibilite', 'creativite', 'empathie', 'intelligence emotionnelle',
  'rigueur', 'sens du detail', 'autonomie', 'prise d\'initiative', 'prise d’initiative', 'esprit d\'initiative', 'esprit d’initiative',
  'curiosite', 'perseverance', 'gestion du stress', 'negociation', 'gestion des conflits', 'prise de decision', 'prise de parole',
  'ecoute active', 'ecoute', 'relationnel', 'sens du relationnel', 'sens du service', 'service client', 'pedagogie', 'ponctualite',
  'fiabilite', 'polyvalence', 'dynamisme', 'esprit d\'analyse', 'esprit d’analyse', 'esprit de synthese', 'sens de l\'organisation',
  'sens de l’organisation', 'mentorat', 'management d\'equipe', 'management d’equipe', 'gestion d\'equipe', 'gestion d’equipe',
  'travail sous pression', 'bienveillance', 'force de proposition', 'aisance relationnelle', 'aisance orale', 'sens des responsabilites',
]
const norm = (s) => ' ' + String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9'’-]+/g, ' ').trim() + ' '
const SOFT_N = SOFT.map(norm)

// "Excellent communication skills", "Esprit d'équipe", "Leadership" → true; "Python", "Project management" → false
export function isSoftSkill(name) {
  const n = norm(name)
  if (n.trim().split(' ').length > 6) return false
  return SOFT_N.some(k => n.includes(k))
}
