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
          <!-- Live CV preview thumbnail -->
          <div class="tpl-thumb">
            <div class="tpl-preview-scroll">
              <div class="tpl-preview-scaler" :style="{ transform: `scale(${thumbScale})` }">
                <div v-html="renderSample(t.id)"></div>
              </div>
            </div>
            <!-- Selected check -->
            <div v-if="store.template === t.id" class="tpl-selected-overlay">
              <div class="tpl-selected-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            <!-- Badge -->
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
import { ref, computed } from 'vue'
import { useCvStore } from '../stores/cv.js'
import { useCvRenderer } from '../composables/cvRenderer.js'

const store = useCvStore()
const { render } = useCvRenderer()

// Sample data used for ALL template previews so they look good
const SAMPLE = {
  fn: 'Alexandra', ln: 'Morrison',
  title: 'Senior Product Manager',
  email: 'a.morrison@email.com',
  phone: '+44 7712 345 678',
  loc: 'London, UK',
  li: 'linkedin.com/in/amorrison',
  photo: null,
  sum: 'Results-driven Product Manager with 8+ years delivering SaaS products used by 2M+ users. Expert in 0→1 development, cross-functional leadership and data-driven roadmapping.',
  experiences: [
    { title: 'Head of Product', company: 'TechFlow Ltd', period: '2021–Present', desc: 'Led product strategy for flagship B2B analytics suite, growing ARR by £2.4M and reducing churn by 18%.' },
    { title: 'Senior PM', company: 'Nexus Digital', period: '2018–2021', desc: 'Launched 3 product lines generating £1.1M new revenue across 4 squads.' },
  ],
  skills: ['Product Strategy', 'SQL & Analytics', 'Figma', 'Agile/Scrum', 'OKRs & KPIs', 'Stakeholder Mgmt'],
  education: { degree: 'MSc Product Management', school: 'UCL London', year: '2016' },
  certifications: ['PSPO II – Scrum Alliance'],
  languages: [{ name: 'English', level: 'Native' }, { name: 'French', level: 'B2' }],
}

const TEMPLATES = [
  { id: 'executive',   name: 'Executive Slate',    cat: 'Professional', badge: 'pop',   badgeLabel: 'Popular', desc: 'Dark header · Sidebar · Skill bars' },
  { id: 'modern',      name: 'Modern Azure',        cat: 'Professional', badge: null,    badgeLabel: '',        desc: 'Gradient header · Photo · Chips' },
  { id: 'gradient',    name: 'Gradient Flow',       cat: 'Professional', badge: 'new',   badgeLabel: 'New',     desc: 'Rich overlay · Photo ready' },
  { id: 'swiss',       name: 'Swiss Design',        cat: 'Professional', badge: null,    badgeLabel: '',        desc: 'Bauhaus geometric · Structured' },
  { id: 'elegant',     name: 'Elegant Gold',        cat: 'Professional', badge: 'pro',   badgeLabel: 'Pro',     desc: 'Dark gold header · Refined' },
  { id: 'photo',       name: 'Photo Professional',  cat: 'Professional', badge: 'photo', badgeLabel: 'Photo',   desc: 'Requires profile photo' },
  { id: 'minimal',     name: 'Minimal Editorial',   cat: 'Minimal',      badge: null,    badgeLabel: '',        desc: 'Serif editorial · Clean' },
  { id: 'compact',     name: 'Compact Grid',        cat: 'Minimal',      badge: 'new',   badgeLabel: 'New',     desc: 'Dense two-column layout' },
  { id: 'academic',    name: 'Academic',            cat: 'Minimal',      badge: null,    badgeLabel: '',        desc: 'Timeline layout · Traditional' },
  { id: 'creative',    name: 'Creative Violet',     cat: 'Creative',     badge: null,    badgeLabel: '',        desc: 'Bold sidebar · Dot-skill rating' },
  { id: 'teal',        name: 'Teal Sidebar',        cat: 'Creative',     badge: 'new',   badgeLabel: 'New',     desc: 'Teal sidebar · Skill bars' },
  { id: 'pastel',      name: 'Pastel Rose',         cat: 'Creative',     badge: null,    badgeLabel: '',        desc: 'Soft gradient · Feminine' },
  { id: 'infographic', name: 'Infographic',         cat: 'Creative',     badge: 'pro',   badgeLabel: 'Pro',     desc: 'Stats cards · Visual data' },
  { id: 'bold',        name: 'Bold Noir',           cat: 'Tech',         badge: 'pop',   badgeLabel: 'Popular', desc: 'Full dark · Gradient stripe' },
  { id: 'tech',        name: 'Tech Dark',           cat: 'Tech',         badge: 'new',   badgeLabel: 'New',     desc: 'Terminal monospace · Dark' },
  { id: 'newspaper',   name: 'Newspaper',           cat: 'Unique',       badge: 'new',   badgeLabel: 'New',     desc: 'Editorial broadsheet · Serif' },
]

// Cache rendered HTML so we don't re-render on every reactive update
const renderCache = new Map()
function renderSample(id) {
  if (!renderCache.has(id)) renderCache.set(id, render(id, SAMPLE))
  return renderCache.get(id)
}

// Scale the 700px CV to fit the thumbnail width (185px card - 2px border = 183px usable → scale ≈ 0.262)
const thumbScale = 0.261

const cats = ['All', 'Professional', 'Minimal', 'Creative', 'Tech', 'Unique']
const activeCat = ref('All')
const filtered = computed(() => activeCat.value === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.cat === activeCat.value))
const grouped = computed(() => {
  const map = new Map()
  filtered.value.forEach(t => { if (!map.has(t.cat)) map.set(t.cat, []); map.get(t.cat).push(t) })
  return map
})
function countFor(cat) { return cat === 'All' ? TEMPLATES.length : TEMPLATES.filter(t => t.cat === cat).length }

function pickTemplate(id) {
  store.template = id
  store.openWizard()
}
</script>

<style scoped>
.tpl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
  gap: 14px;
  margin-bottom: 4px;
}
.tpl-card {
  background: var(--c-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all .2s;
  box-shadow: var(--shadow-xs);
}
.tpl-card:hover { box-shadow: var(--shadow); transform: translateY(-3px); border-color: var(--c-border2); }
.tpl-card.sel { border-color: var(--c-accent); }

/* Thumbnail — clips the scaled-down CV */
.tpl-thumb {
  height: 200px;
  overflow: hidden;
  position: relative;
  background: #f5f4f0;
}
.tpl-preview-scroll {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.tpl-preview-scaler {
  transform-origin: top left;
  width: 700px; /* actual CV width */
  pointer-events: none;
  user-select: none;
}

/* Selected overlay */
.tpl-selected-overlay {
  position: absolute; inset: 0;
  background: rgba(42,91,215,.12);
  display: flex; align-items: flex-start; justify-content: flex-end;
  padding: 8px;
}
.tpl-selected-check {
  width: 24px; height: 24px; border-radius: 50%;
  background: var(--c-accent); color: #fff;
  display: flex; align-items: center; justify-content: center;
}
.tpl-selected-check svg { width: 12px; height: 12px; }

/* Badge */
.tpl-badge {
  position: absolute; top: 8px; left: 8px;
  font-size: 9px; font-weight: 700; letter-spacing: .05em;
  text-transform: uppercase; padding: 2px 8px; border-radius: 20px;
}
.b-pop { background: #fef9c3; color: #a16207; }
.b-new { background: #dcfce7; color: #15803d; }
.b-pro { background: #f0ebfa; color: #6236b0; }
.b-photo { background: #fce9eb; color: #c52b3d; }

.tpl-info { padding: 11px 13px; border-top: 1px solid var(--c-border); }
.tpl-name { font-size: 12.5px; font-weight: 600; color: var(--c-text); }
.tpl-cat { font-size: 11px; color: var(--c-text3); margin-top: 2px; }

.tpl-section-ttl {
  font-size: 10.5px; font-weight: 700; color: var(--c-text3);
  text-transform: uppercase; letter-spacing: .07em;
  margin: 22px 0 11px;
}
</style>