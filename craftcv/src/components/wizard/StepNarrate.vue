<template>
  <div class="step-wrap">
    <div class="step-intro">
      <div class="step-icon">🎙️</div>
      <h3>Tell your story</h3>
      <p>Write freely about your career. AI will generate a customised form for each section based on what you share.</p>
    </div>

    <div v-if="!started">
      <div class="f-grp">
        <div class="f-lbl">Your career story</div>
        <textarea class="f-ta" v-model="story" rows="8"
          placeholder="e.g. I've been in product management for 8 years. I started at a startup in London where I built their first mobile app from scratch. Then I moved to a fintech where I led a team of 12 and grew our user base from 50K to 2M. I'm passionate about data-driven product decisions and I've shipped about 20 major features over my career..."
          style="line-height:1.65;"></textarea>
        <div class="f-hint">Be as detailed as you like — more context = better AI questions.</div>
      </div>

      <div v-if="aiLoading" class="thinking" style="margin-top:8px;">
        <div class="thinking-dots"><span></span><span></span><span></span></div>
        <div class="thinking-txt">Reading your story and preparing questions...</div>
      </div>

      <div class="start-controls">
        <button class="btn-primary accent" @click="startNarrate" :disabled="!story.trim() || aiLoading" style="width:100%;justify-content:center;">
          {{ aiLoading ? 'Processing...' : 'Generate My CV Questions →' }}
        </button>
        <button class="skip-btn" @click="$emit('next')">Skip — fill manually instead</button>
      </div>
    </div>

    <div v-else>
      <div class="ai-bubble">
        <div class="ai-bubble-lbl">Groq AI · Story Processed</div>
        <div class="ai-bubble-txt">I've read your story. I've pre-filled fields where I could find information, and the following steps will include custom questions based on your specific background. Continue to each section!</div>
      </div>

      <div class="story-preview">
        <div class="sp-lbl">Your story</div>
        <div class="sp-txt">{{ story.slice(0, 200) }}{{ story.length > 200 ? '...' : '' }}</div>
        <button class="sp-edit" @click="started = false">Edit story</button>
      </div>

      <div class="proceed-btn-wrap">
        <button class="btn-primary accent" @click="$emit('next')" style="width:100%;justify-content:center;">
          Continue — Fill Each Section →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCvStore } from '../../stores/cv.js'

const store = useCvStore()
const emit = defineEmits(['next', 'ai-thinking'])

const story = ref('')
const aiLoading = ref(false)
const started = ref(false)

async function startNarrate() {
  if (!story.value.trim()) return
  aiLoading.value = true
  emit('ai-thinking', true)

  try {
    // Ask Groq to extract info from the story and pre-fill the CV
    const prompt = `Extract structured information from this career story and return ONLY valid JSON (no markdown):
"${story.value}"

Return this exact structure:
{
  "fn": "first name if mentioned",
  "ln": "last name if mentioned", 
  "title": "job title/role",
  "sum": "2-sentence professional summary based on story",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "experiences": [{"title": "role", "company": "company", "period": "dates", "desc": "key achievement"}]
}`

    const result = await store.callAi(prompt)
    const parsed = JSON.parse(result.replace(/```json|```/g, '').trim())

    // Pre-fill store with extracted data
    if (parsed.fn) store.data.fn = parsed.fn
    if (parsed.ln) store.data.ln = parsed.ln
    if (parsed.title) store.data.title = parsed.title
    if (parsed.sum) store.data.sum = parsed.sum
    if (parsed.skills?.length) store.data.skills = parsed.skills
    if (parsed.experiences?.length) {
      store.data.experiences = parsed.experiences.map((e, i) => ({ ...e, id: Date.now() + i }))
    }
  } catch {
    // Demo fallback: pre-fill with some derived data
    store.data.sum = `Experienced professional with a proven track record across multiple organisations. Known for building products from the ground up and scaling them to significant user bases with measurable business impact.`
  }

  aiLoading.value = false
  emit('ai-thinking', false)
  started.value = true
}
</script>

<style scoped>
.step-intro{margin-bottom:20px;}
.step-icon{font-size:28px;margin-bottom:8px;}
h3{font-size:18px;font-weight:700;color:var(--c-text);margin-bottom:5px;font-family:'DM Serif Display',serif;}
p{font-size:13px;color:var(--c-text2);line-height:1.5;}
.start-controls{margin-top:12px;display:flex;flex-direction:column;gap:8px;}
.skip-btn{background:none;border:none;font-size:12.5px;color:var(--c-text3);cursor:pointer;font-family:'DM Sans',sans-serif;text-align:center;text-decoration:underline;}
.story-preview{background:var(--c-surface2);border:1px solid var(--c-border);border-radius:var(--radius);padding:14px;margin-bottom:14px;}
.sp-lbl{font-size:9.5px;font-weight:800;color:var(--c-text3);letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px;}
.sp-txt{font-size:12.5px;color:var(--c-text2);line-height:1.6;margin-bottom:8px;}
.sp-edit{background:none;border:none;font-size:11.5px;color:var(--c-accent);font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:underline;}
.proceed-btn-wrap{margin-top:8px;}
</style>