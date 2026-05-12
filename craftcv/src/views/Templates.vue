<template>
  <div class="view-page">
    <!-- Filter tabs -->
    <div class="filter-row">
      <button v-for="cat in cats" :key="cat" class="filter-tab" :class="{ active: activeCat === cat }" @click="activeCat = cat">
        {{ cat }}
        <span class="f-count">{{ countFor(cat) }}</span>
      </button>
    </div>

    <!-- Template grid with REAL CV previews -->
    <div v-for="[cat, items] in grouped" :key="cat">
      <div class="tpl-section-ttl">{{ cat }}</div>
      <div class="tpl-grid">
        <div
          v-for="t in items" :key="t.id"
          class="tpl-card"
          :class="{ sel: store.template === t.id }"
          @click="pickTemplate(t.id)"
        >
          <div class="tpl-thumb" :ref="el => { if(el) cardEls[t.id]=el }">
            <div class="tpl-preview-scaler" :style="getScale(t.id)">
              <div v-html="renderSample(t.id)"></div>
            </div>
            <div v-if="store.template === t.id" class="tpl-selected-overlay">
              <div class="tpl-selected-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            <div v-if="t.badge" class="tpl-badge" :class="`b-${t.badge}`">{{ t.badgeLabel }}</div>
          </div>
          <div class="tpl-info">
            <div class="tpl-name">{{ t.name }}</div>
            <div class="tpl-cat">{{ t.desc }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCvStore } from '../stores/cv.js'
import { useCvRenderer } from '../composables/cvRenderer.js'

const store = useCvStore()
const { render } = useCvRenderer()

const SAMPLE = {
  fn: 'Alexandra', ln: 'Morrison', title: 'Senior Product Manager',
  email: 'a.morrison@email.com', phone: '+44 7712 345 678', loc: 'London, UK',
  li: 'linkedin.com/in/amorrison', photo: null,
  sum: 'Results-driven Product Manager with 8+ years delivering SaaS products used by 2M+ users. Expert in 0→1 development, cross-functional leadership and data-driven roadmapping.',
  experiences: [
    { title: 'Head of Product', company: 'TechFlow Ltd', period: '2021–Present', desc: 'Led product strategy for flagship B2B analytics suite, growing ARR by £2.4M and reducing churn by 18%.' },
    { title: 'Senior PM', company: 'Nexus Digital', period: '2018–2021', desc: 'Launched 3 product lines generating £1.1M new revenue across 4 squads.' },
  ],
  skills: ['Product Strategy', 'SQL & Analytics', 'Figma', 'Agile/Scrum', 'OKRs & KPIs', 'Stakeholder Mgmt'],
  education: [{ degree: 'MSc Product Management', school: 'UCL London', year: '2016' }],
  projects: [{ id: 1, name: 'Analytics Dashboard', desc: 'Built internal KPI dashboard used by 200+ employees.', tech: 'React, D3.js', url: '' }],
  certifications: ['PSPO II – Scrum Alliance'],
  languages: [{ name: 'English', level: 'Native' }, { name: 'French', level: 'B2' }],
}

const TEMPLATES = [
  // PROFESSIONAL
  { id: 'executive',  name: 'Executive Slate',    cat: 'Professional', badge: 'pop',   badgeLabel: 'Popular', desc: 'Dark header · Sidebar · Skill bars' },
  { id: 'modern',     name: 'Modern Azure',        cat: 'Professional', badge: null,    badgeLabel: '',        desc: 'Gradient header · Photo ready' },
  { id: 'gradient',   name: 'Gradient Flow',       cat: 'Professional', badge: null,    badgeLabel: '',        desc: 'Rich overlay · Photo ready' },
  { id: 'swiss',      name: 'Swiss Design',        cat: 'Professional', badge: null,    badgeLabel: '',        desc: 'Bauhaus geometric · Structured' },
  { id: 'elegant',    name: 'Elegant Gold',        cat: 'Professional', badge: 'pro',   badgeLabel: 'Pro',     desc: 'Dark gold header · Refined' },
  { id: 'photo',      name: 'Photo Professional',  cat: 'Professional', badge: 'photo', badgeLabel: 'Photo',   desc: 'Profile photo · Two-column' },
  { id: 'corporate',  name: 'Corporate Blue',      cat: 'Professional', badge: null,    badgeLabel: '',        desc: 'Navy header · Skill bars' },
  { id: 'clean',      name: 'Clean Professional',  cat: 'Professional', badge: null,    badgeLabel: '',        desc: 'Classic layout · Timeless' },
  { id: 'slate',      name: 'Slate Impact',        cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Steel dark · Gradient bar' },
  { id: 'ruby',       name: 'Ruby Red',            cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Deep red header · Gradient bar' },
  { id: 'ocean',      name: 'Ocean Blue',          cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Ocean gradient · Classic layout' },
  { id: 'sunrise',    name: 'Sunrise Orange',      cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Warm orange gradient' },
  { id: 'diamond',    name: 'Diamond',             cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Diamond avatar · Clean lines' },
  { id: 'emerald',    name: 'Emerald',             cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Emerald avatar · Clean lines' },
  { id: 'graphite',   name: 'Graphite',            cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Dark sidebar · Minimal' },
  { id: 'onyx',       name: 'Onyx',                cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Dark with gradient bar' },
  { id: 'slate2',     name: 'Slate Pro',           cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Slate sidebar · Pro layout' },
  { id: 'slate3',     name: 'Slate III',           cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Dark sidebar · Blue accents' },
  { id: 'navy',       name: 'Navy Pro',            cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Navy sidebar · Blue accents' },
  { id: 'lava',       name: 'Lava',                cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Dark red gradient · Fire bar' },
  { id: 'garnet',     name: 'Garnet',              cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Garnet dark · Gold bar' },
  { id: 'ochre',      name: 'Ochre',               cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Dark amber gradient' },
  { id: 'glacier',    name: 'Glacier',             cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Ice blue · Cool tones' },
  { id: 'glacier2',   name: 'Glacier II',          cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Glacier blue sidebar' },
  { id: 'topaz',      name: 'Topaz',               cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Cyan accent · Clean grid' },
  { id: 'electric',   name: 'Electric',            cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Sky blue · Bold header' },
  { id: 'tealwave',   name: 'Teal Wave',           cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Teal wave header · Clean' },
  { id: 'crimson',    name: 'Crimson',             cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Deep red · Gradient stripe' },
  { id: 'crimson2',   name: 'Crimson II',          cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Crimson accent · Bold rule' },
  { id: 'walnut',     name: 'Walnut',              cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Dark brown sidebar · Warm' },
  { id: 'jade',       name: 'Jade',                cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Jade sidebar · Badge' },
  { id: 'spruce',     name: 'Spruce',              cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Green sidebar · Icon badge' },
  { id: 'sepia',      name: 'Sepia',               cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Sepia tones · Warm classic' },
  { id: 'slate4',     name: 'Slate IV',            cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Slate header · Rainbow bar' },
  { id: 'slate5',     name: 'Slate V',             cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Dark gradient · Gold bar' },
  // MINIMAL
  { id: 'minimal',    name: 'Minimal Editorial',   cat: 'Minimal',      badge: null,    badgeLabel: '',        desc: 'Serif editorial · Clean' },
  { id: 'compact',    name: 'Compact Grid',        cat: 'Minimal',      badge: null,    badgeLabel: '',        desc: 'Dense two-column layout' },
  { id: 'academic',   name: 'Academic',            cat: 'Minimal',      badge: null,    badgeLabel: '',        desc: 'Timeline layout · Traditional' },
  { id: 'ivory',      name: 'Ivory Luxury',        cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Off-white · Centred · Refined' },
  { id: 'ivory2',     name: 'Ivory II',            cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Double rule · Serif centred' },
  { id: 'silver',     name: 'Silver Lining',       cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Cool grey · Refined layout' },
  { id: 'rose',       name: 'Rose Gold',           cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Soft rose · Elegant' },
  { id: 'sky',        name: 'Sky Blue',            cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Centred · Sky blue' },
  { id: 'nordic',     name: 'Nordic',              cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Centred · Rainbow gradient bar' },
  { id: 'sage',       name: 'Sage Green',          cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Sage green · Nature tones' },
  { id: 'copper2',    name: 'Copper II',           cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Copper accent · Clean' },
  { id: 'tan',        name: 'Tan',                 cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Warm tan · Serif accents' },
  { id: 'ash',        name: 'Ash',                 cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Ash grey · Ultra clean' },
  { id: 'steel',      name: 'Steel',               cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Steel blue · Clean grid' },
  { id: 'brick',      name: 'Brick Red',           cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Red accent bar · Clean' },
  { id: 'sand',       name: 'Sand',                cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Warm sand tones · Centred' },
  { id: 'parchment',  name: 'Parchment',           cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Cream serif · Elegant' },
  { id: 'ink',        name: 'Ink',                 cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Bold black rule · Minimal' },
  { id: 'meadow',     name: 'Meadow',              cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Mint centred · Nature' },
  { id: 'pine',       name: 'Pine',                cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Pine green · Bold rule' },
  { id: 'stone',      name: 'Stone Cold',          cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Warm stone · Left accent' },
  // CREATIVE
  { id: 'creative',   name: 'Creative Violet',     cat: 'Creative',     badge: null,    badgeLabel: '',        desc: 'Bold sidebar · Dot-skill rating' },
  { id: 'teal',       name: 'Teal Sidebar',        cat: 'Creative',     badge: null,    badgeLabel: '',        desc: 'Teal sidebar · Skill bars' },
  { id: 'pastel',     name: 'Pastel Rose',         cat: 'Creative',     badge: null,    badgeLabel: '',        desc: 'Soft gradient · Feminine' },
  { id: 'infographic',name: 'Infographic',         cat: 'Creative',     badge: 'pro',   badgeLabel: 'Pro',     desc: 'Stats cards · Visual data' },
  { id: 'magazine',   name: 'Magazine Editorial',  cat: 'Creative',     badge: null,    badgeLabel: '',        desc: 'Split panels · Editorial feel' },
  { id: 'terra',      name: 'Terra',               cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Warm earthy tones · Elegant' },
  { id: 'prism',      name: 'Prism',               cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Colourful accent strip' },
  { id: 'forest',     name: 'Forest Green',        cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Deep green sidebar · Nature' },
  { id: 'purple',     name: 'Purple Reign',        cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Deep violet header · Bold' },
  { id: 'mint',       name: 'Mint Fresh',          cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Mint green sidebar · Clean' },
  { id: 'indigo',     name: 'Indigo Wave',         cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Wave header cutout · Bold' },
  { id: 'bloom',      name: 'Pink Bloom',          cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Pink gradient · Feminine & bold' },
  { id: 'sakura',     name: 'Sakura',              cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Cherry blossom · Soft pink' },
  { id: 'lemon',      name: 'Lemon Fresh',         cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Bright yellow · Energetic' },
  { id: 'aurora',     name: 'Aurora',              cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Northern lights gradient' },
  { id: 'dusk',       name: 'Dusk',                cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Twilight purple gradient' },
  { id: 'blush',      name: 'Blush',               cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Blush pink · Gradient avatar' },
  { id: 'violet2',    name: 'Violet',              cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Violet avatar · Soft' },
  { id: 'mauve',      name: 'Mauve',               cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Deep mauve gradient' },
  { id: 'peach',      name: 'Peach',               cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Peach gradient · Warm' },
  { id: 'clay',       name: 'Clay Amber',          cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Amber sidebar · Warm' },
  { id: 'frost',      name: 'Frost',               cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Indigo centred · Soft' },
  { id: 'lavender',   name: 'Lavender',            cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Lavender avatar · Soft' },
  { id: 'coral',      name: 'Coral',               cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Coral gradient · Chip skills' },
  { id: 'wine',       name: 'Wine',                cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Wine dark · Gold bar' },
  { id: 'verdant',    name: 'Verdant',             cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Deep green sidebar · Nature' },
  // TECH
  { id: 'bold',       name: 'Bold Noir',           cat: 'Tech',         badge: 'pop',   badgeLabel: 'Popular', desc: 'Full dark · Gradient stripe' },
  { id: 'tech',       name: 'Tech Dark',           cat: 'Tech',         badge: null,    badgeLabel: '',        desc: 'Terminal monospace · Dark' },
  { id: 'midnight',   name: 'Midnight Executive',  cat: 'Tech',         badge: null,    badgeLabel: '',        desc: 'Deep dark · Neon accents' },
  { id: 'charcoal',   name: 'Charcoal Grid',       cat: 'Tech',         badge: 'new',   badgeLabel: 'New',     desc: 'Full dark grey · Minimal' },
  { id: 'amber',      name: 'Dark Amber',          cat: 'Tech',         badge: 'new',   badgeLabel: 'New',     desc: 'Dark background · Amber accents' },
  { id: 'cobalt',     name: 'Cobalt Night',        cat: 'Tech',         badge: 'new',   badgeLabel: 'New',     desc: 'Dark cobalt · Neon accents' },
  { id: 'vega',       name: 'Vega',                cat: 'Tech',         badge: 'new',   badgeLabel: 'New',     desc: 'Pure dark · Cyan accents' },
  { id: 'carbon',     name: 'Carbon',              cat: 'Tech',         badge: 'new',   badgeLabel: 'New',     desc: 'Carbon black · Orange accents' },
  { id: 'obsidian',   name: 'Obsidian',            cat: 'Tech',         badge: 'new',   badgeLabel: 'New',     desc: 'Deep dark · Tricolour bar' },
  { id: 'neon',       name: 'Neon Green',          cat: 'Tech',         badge: 'new',   badgeLabel: 'New',     desc: 'Dark · Neon green accents' },
  { id: 'matrix',     name: 'Matrix',              cat: 'Tech',         badge: 'new',   badgeLabel: 'New',     desc: 'Terminal green · Hacker' },
  { id: 'phantom',    name: 'Phantom',             cat: 'Tech',         badge: 'new',   badgeLabel: 'New',     desc: 'Pure black · Minimal' },
  { id: 'midnight2',  name: 'Midnight II',         cat: 'Tech',         badge: 'new',   badgeLabel: 'New',     desc: 'Pure black · Stark minimal' },
  { id: 'zinc',       name: 'Zinc',                cat: 'Tech',         badge: 'new',   badgeLabel: 'New',     desc: 'Dark zinc · Grey tones' },
  { id: 'plum',       name: 'Plum Dark',           cat: 'Tech',         badge: 'new',   badgeLabel: 'New',     desc: 'Deep purple dark' },
  { id: 'ultraviolet',name: 'Ultraviolet',         cat: 'Tech',         badge: 'new',   badgeLabel: 'New',     desc: 'Black · Neon purple' },
  { id: 'blueprint',  name: 'Blueprint',           cat: 'Tech',         badge: 'new',   badgeLabel: 'New',     desc: 'Blueprint navy · Grid' },
  { id: 'futura',     name: 'Futura',              cat: 'Tech',         badge: 'new',   badgeLabel: 'New',     desc: 'Split dark/light · Geometric' },
  { id: 'moss',       name: 'Moss',                cat: 'Tech',         badge: 'new',   badgeLabel: 'New',     desc: 'Moss green sidebar · Dark' },
  { id: 'prism2',     name: 'Prism II',            cat: 'Tech',         badge: 'new',   badgeLabel: 'New',     desc: 'Rainbow top bar · Clean' },
  // UNIQUE
  { id: 'newspaper',  name: 'Newspaper',           cat: 'Unique',       badge: null,    badgeLabel: '',        desc: 'Editorial broadsheet · Serif' },
  { id: 'split',      name: 'Bold Split',          cat: 'Unique',       badge: 'new',   badgeLabel: 'New',     desc: 'Dark sidebar · Amber accents' },
  { id: 'retro',      name: 'Retro Gold',          cat: 'Unique',       badge: 'new',   badgeLabel: 'New',     desc: 'Retro gold · Bold stripes' },
  { id: 'luxe',       name: 'Luxe Gold',           cat: 'Unique',       badge: 'new',   badgeLabel: 'New',     desc: 'Dark gold luxury' },
  { id: 'mono',       name: 'Monospace',           cat: 'Unique',       badge: 'new',   badgeLabel: 'New',     desc: 'Monospace terminal' },
  { id: 'wave',       name: 'Wave',                cat: 'Unique',       badge: 'new',   badgeLabel: 'New',     desc: 'Wave cutout header' },
  { id: 'parchment',  name: 'Parchment',           cat: 'Unique',       badge: 'new',   badgeLabel: 'New',     desc: 'Cream serif · Elegant' },
]

const renderCache = new Map()
function renderSample(id) {
  if (!renderCache.has(id)) renderCache.set(id, render(id, SAMPLE))
  return renderCache.get(id)
}

const cardEls = ref({})
function getScale(id) {
  const el = cardEls.value[id]
  const w  = el ? el.clientWidth : 185
  return { zoom: String(Math.max(0.1, w / 700)), transformOrigin: 'top left' }
}

let _ro
onMounted(() => {
  _ro = new ResizeObserver(() => {})
  document.querySelectorAll('.tpl-thumb').forEach(el => _ro.observe(el))
})
onUnmounted(() => _ro?.disconnect())

const cats = ['All', 'Professional', 'Minimal', 'Creative', 'Tech', 'Unique']
const activeCat = ref('All')

const filtered = computed(() =>
  activeCat.value === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.cat === activeCat.value)
)

const grouped = computed(() => {
  const map = new Map()
  filtered.value.forEach(t => {
    if (!map.has(t.cat)) map.set(t.cat, [])
    map.get(t.cat).push(t)
  })
  return map
})

function countFor(cat) {
  return cat === 'All'
    ? TEMPLATES.length
    : TEMPLATES.filter(t => t.cat === cat).length
}

function pickTemplate(id) {
  store.template = id
  store.openWizard(true)
}
</script>
<style scoped>
.tpl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
  gap: 16px;
  margin-bottom: 8px;
}
.tpl-card {
  background: var(--c-surface);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all .2s;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}
.tpl-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,.12); transform: translateY(-2px); border-color: var(--c-border2); }
.tpl-card.sel   { border-color: var(--c-accent); box-shadow: 0 0 0 3px rgba(42,91,215,.12); }
.tpl-thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1.2;
  overflow: hidden;
  background: #f0ede8;
}
.tpl-preview-scaler {
  width: 700px;
  transform-origin: top left;
  pointer-events: none;
  user-select: none;
  display: block;
}
.tpl-selected-overlay {
  position: absolute; inset: 0;
  background: rgba(42,91,215,.08);
  display: flex; align-items: flex-start; justify-content: flex-end;
  padding: 8px; pointer-events: none;
}
.tpl-selected-check {
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--c-accent); color: #fff;
  display: flex; align-items: center; justify-content: center;
}
.tpl-selected-check svg { width: 11px; height: 11px; }
.tpl-badge {
  position: absolute; top: 7px; left: 7px;
  font-size: 9px; font-weight: 700; letter-spacing: .04em;
  text-transform: uppercase; padding: 2px 7px; border-radius: 20px;
  pointer-events: none;
}
.b-pop   { background: #fef9c3; color: #a16207; }
.b-new   { background: #dcfce7; color: #15803d; }
.b-pro   { background: #f0ebfa; color: #6236b0; }
.b-photo { background: #fce9eb; color: #c52b3d; }
.tpl-info { padding: 10px 12px; border-top: 1px solid var(--c-border); }
.tpl-name { font-size: 12.5px; font-weight: 600; color: var(--c-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tpl-cat  { font-size: 10.5px; color: var(--c-text3); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tpl-section-ttl {
  font-size: 10.5px; font-weight: 700; letter-spacing: .07em;
  text-transform: uppercase; color: var(--c-text3); margin: 22px 0 10px;
}
@media (max-width: 768px) {
  .tpl-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .tpl-thumb { aspect-ratio: 1 / 1.3; }
  .tpl-name  { font-size: 11px; }
  .tpl-cat   { font-size: 10px; }
  .tpl-info  { padding: 7px 9px; }
  .tpl-section-ttl { font-size: 9.5px; margin: 14px 0 7px; }
}
@media (max-width: 400px) {
  .tpl-grid  { gap: 8px; }
  .tpl-info  { padding: 6px 8px; }
}
</style>