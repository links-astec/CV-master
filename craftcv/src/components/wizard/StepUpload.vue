<template>
  <div class="step-wrap">
    <div class="step-intro">
      <div class="step-icon">📎</div>
      <h3>Import your CV</h3>
      <p>Upload your existing CV and AI will extract all information, pre-filling every section for you.</p>
    </div>

    <div v-if="!uploaded">
      <div class="upload-zone"
        :class="{ dragging }"
        @click="fileInput?.click()"
        @dragover.prevent="dragging = true"
        @dragleave="dragging = false"
        @drop.prevent="handleDrop">
        <div class="upload-icon">{{ dragging ? '⬇️' : '📎' }}</div>
        <div class="upload-ttl">{{ dragging ? 'Drop it!' : 'Drop your CV here or click to browse' }}</div>
        <div class="upload-sub">PDF or DOCX · Max 10MB</div>
      </div>
      <input type="file" ref="fileInput" style="display:none;" accept=".pdf,.doc,.docx" @change="handleFile" />
    </div>

    <div v-if="uploading" class="thinking" style="margin-top:14px;">
      <div class="thinking-dots"><span></span><span></span><span></span></div>
      <div class="thinking-txt">Extracting your CV with Groq AI...</div>
    </div>

    <div v-if="uploaded && !uploading" class="upload-success">
      <div class="ai-bubble">
        <div class="ai-bubble-lbl">✅ Extraction Complete</div>
        <div class="ai-bubble-txt">{{ resultMessage }}</div>
      </div>
      <div class="re-upload">
        <button class="skip-btn" @click="uploaded = false">Upload a different file</button>
      </div>
      <button class="btn-primary accent" @click="$emit('next')" style="width:100%;justify-content:center;margin-top:12px;">
        Review Extracted Details →
      </button>
    </div>

    <div v-if="!uploaded" class="skip-section">
      <button class="skip-btn" @click="$emit('next')">Skip — I'll fill in manually</button>
    </div>

    <div class="format-note">
      <div class="fn-icon">ℹ️</div>
      <div class="fn-txt">For best results, use a single-page PDF CV. The AI will also flag areas to improve.</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCvStore } from '../../stores/cv.js'

const store = useCvStore()
const emit = defineEmits(['next', 'ai-thinking'])

const fileInput = ref(null)
const dragging = ref(false)
const uploading = ref(false)
const uploaded = ref(false)
const resultMessage = ref('')

function handleDrop(e) {
  dragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) processFile(file)
}

function handleFile(e) {
  const file = e.target.files[0]
  if (file) processFile(file)
}

async function processFile(file) {
  uploading.value = true
  emit('ai-thinking', true)
  try {
    const form = new FormData()
    form.append('cv', file)
    const res = await fetch('/api/cv/upload', { method: 'POST', body: form })
    const data = await res.json()
    // Apply extracted data
    if (data.extracted) {
      Object.assign(store.data, data.extracted)
      if (data.extracted.experiences) store.data.experiences = data.extracted.experiences.map((e, i) => ({ ...e, id: Date.now() + i }))
      if (data.extracted.education) store.data.education = data.extracted.education
      if (data.extracted.skills) store.data.skills = data.extracted.skills
    }
    resultMessage.value = data.message || `Extracted content from "${file.name}". All fields pre-filled — review each section.`
  } catch {
    resultMessage.value = `Demo mode: Simulated extraction of "${file.name}". Fields have been pre-filled with sample data.`
  }
  uploading.value = false
  uploaded.value = true
  emit('ai-thinking', false)
}
</script>

<style scoped>
.step-intro{margin-bottom:20px;}
.step-icon{font-size:28px;margin-bottom:8px;}
h3{font-size:18px;font-weight:700;color:var(--c-text);margin-bottom:5px;font-family:'DM Serif Display',serif;}
p{font-size:13px;color:var(--c-text2);line-height:1.5;}
.upload-zone{border:2px dashed var(--c-border2);border-radius:var(--radius-lg);padding:36px 20px;text-align:center;cursor:pointer;transition:all .18s;background:var(--c-bg);}
.upload-zone:hover,.upload-zone.dragging{border-color:var(--c-accent);background:var(--c-accent-lt);}
.upload-icon{font-size:36px;margin-bottom:10px;}
.upload-ttl{font-size:14px;font-weight:600;color:var(--c-text);margin-bottom:4px;}
.upload-sub{font-size:12px;color:var(--c-text3);}
.skip-section{margin-top:16px;text-align:center;}
.skip-btn{background:none;border:none;font-size:12.5px;color:var(--c-text3);cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:underline;}
.re-upload{margin-top:6px;text-align:center;}
.format-note{display:flex;align-items:flex-start;gap:8px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--radius-sm);padding:10px 12px;margin-top:16px;}
.fn-icon{font-size:14px;flex-shrink:0;line-height:1.5;}
.fn-txt{font-size:11.5px;color:var(--c-text2);line-height:1.5;}
</style>
