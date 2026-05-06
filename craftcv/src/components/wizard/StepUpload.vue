<template>
  <div class="step-wrap">
    <h3 class="step-title">Import Existing CV</h3>
    <p class="step-sub">Upload your CV and Groq AI will extract all the information and pre-fill every section.</p>

    <div v-if="!uploaded && !uploading">
      <div class="upload-zone" :class="{ dragging }"
        @click="fileInput?.click()"
        @dragover.prevent="dragging = true"
        @dragleave="dragging = false"
        @drop.prevent="handleDrop">
        <input type="file" ref="fileInput" style="display:none;" accept=".pdf,.doc,.docx,.txt" @change="handleFile" />
        <div class="upload-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
        </div>
        <div class="upload-ttl">{{ dragging ? 'Drop your CV here' : 'Drop your CV here or click to browse' }}</div>
        <div class="upload-sub">PDF, DOCX or TXT · Max 10MB</div>
      </div>
    </div>

    <!-- Uploading state -->
    <div v-if="uploading" class="upload-progress">
      <div class="up-spinner"></div>
      <div class="up-title">Extracting your CV with Groq AI...</div>
      <div class="up-sub">Reading {{ uploadingFile }}...</div>
    </div>

    <!-- Success state -->
    <div v-if="uploaded && !uploading" class="upload-success">
      <div class="success-header">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <div class="success-title">Extraction complete</div>
          <div class="success-sub">{{ resultMessage }}</div>
        </div>
      </div>
      <div class="extracted-preview">
        <div class="ep-row" v-if="store.data.fn"><span class="ep-lbl">Name</span><span class="ep-val">{{ store.data.fn }} {{ store.data.ln }}</span></div>
        <div class="ep-row" v-if="store.data.title"><span class="ep-lbl">Title</span><span class="ep-val">{{ store.data.title }}</span></div>
        <div class="ep-row" v-if="store.data.email"><span class="ep-lbl">Email</span><span class="ep-val">{{ store.data.email }}</span></div>
        <div class="ep-row" v-if="store.data.skills?.length"><span class="ep-lbl">Skills</span><span class="ep-val">{{ store.data.skills.slice(0,4).join(', ') }}{{ store.data.skills.length > 4 ? ` +${store.data.skills.length - 4} more` : '' }}</span></div>
        <div class="ep-row" v-if="store.data.experiences?.length"><span class="ep-lbl">Roles</span><span class="ep-val">{{ store.data.experiences.length }} position{{ store.data.experiences.length !== 1 ? 's' : '' }} found</span></div>
      </div>
      <button class="re-upload-btn" @click="uploaded = false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
        Upload a different file
      </button>
      <button class="btn-primary accent" @click="$emit('next')" style="width:100%;justify-content:center;margin-top:10px;">
        Review Extracted Details
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:13px;height:13px;"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>

    <!-- Error state -->
    <div v-if="uploadError" class="upload-error">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ uploadError }}
    </div>

    <div v-if="!uploaded" class="skip-section">
      <button class="skip-btn" @click="$emit('next')">Skip — I'll fill in manually</button>
    </div>

    <div class="format-note">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:14px;height:14px;flex-shrink:0;color:var(--c-text3);"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <div class="fn-txt">For best results use a text-based PDF (not a scanned image). Groq AI reads the text content and structures it into your CV.</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCvStore } from '../../stores/cv.js'

const store  = useCvStore()
const emit   = defineEmits(['next', 'ai-thinking'])

const fileInput     = ref(null)
const dragging      = ref(false)
const uploading     = ref(false)
const uploaded      = ref(false)
const uploadingFile = ref('')
const resultMessage = ref('')
const uploadError   = ref('')

function handleDrop(e) { dragging.value = false; const f = e.dataTransfer.files[0]; if (f) processFile(f) }
function handleFile(e) { const f = e.target.files[0]; if (f) processFile(f) }

async function processFile(file) {
  uploadError.value = ''
  uploadingFile.value = file.name
  uploading.value = true
  emit('ai-thinking', true)
  try {
    const formData = new FormData()
    formData.append('cv', file)
    const r = await fetch('/api/cv/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || 'Upload failed')
    if (data.extracted) {
      store.applyExtracted(data.extracted)
    }
    resultMessage.value = data.message || `Extracted from "${file.name}" successfully.`
    uploaded.value = true
  } catch (e) {
    uploadError.value = e.message || 'Failed to extract CV. Try a different file or fill in manually.'
  }
  uploading.value = false
  emit('ai-thinking', false)
}
</script>

<style scoped>
.step-title { font-family:'DM Serif Display',serif;font-size:20px;color:var(--c-text);margin-bottom:5px; }
.step-sub { font-size:13px;color:var(--c-text2);margin-bottom:20px;line-height:1.5; }
.upload-zone { border:2px dashed var(--c-border2);border-radius:var(--radius-lg);padding:36px 20px;text-align:center;cursor:pointer;transition:all .18s;background:var(--c-bg); }
.upload-zone:hover,.upload-zone.dragging { border-color:var(--c-accent);background:var(--c-accent-lt); }
.upload-icon { width:48px;height:48px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px; }
.upload-icon svg { width:24px;height:24px;color:var(--c-text2); }
.upload-ttl { font-size:14px;font-weight:600;color:var(--c-text);margin-bottom:4px; }
.upload-sub { font-size:12px;color:var(--c-text3); }
.upload-progress { display:flex;flex-direction:column;align-items:center;padding:40px 20px;text-align:center;gap:12px; }
.up-spinner { width:36px;height:36px;border:3px solid var(--c-border);border-top-color:var(--c-accent);border-radius:50%;animation:spin .8s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.up-title { font-size:14px;font-weight:600;color:var(--c-text); }
.up-sub { font-size:12px;color:var(--c-text3); }
.upload-success { border:1.5px solid var(--c-green-lt);border-radius:var(--radius-lg);padding:16px;background:var(--c-green-lt); }
.success-header { display:flex;align-items:flex-start;gap:12px;margin-bottom:14px; }
.success-icon { width:36px;height:36px;border-radius:50%;background:var(--c-green);display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.success-icon svg { color:#fff; }
.success-title { font-size:13.5px;font-weight:700;color:var(--c-green);margin-bottom:2px; }
.success-sub { font-size:12px;color:var(--c-text2); }
.extracted-preview { background:var(--c-surface);border-radius:var(--radius-sm);padding:12px;margin-bottom:12px;display:flex;flex-direction:column;gap:6px; }
.ep-row { display:flex;align-items:center;gap:8px;font-size:12px; }
.ep-lbl { font-weight:600;color:var(--c-text3);min-width:50px; }
.ep-val { color:var(--c-text);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.re-upload-btn { display:flex;align-items:center;gap:6px;background:none;border:none;font-size:12px;font-weight:600;color:var(--c-text2);cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:underline; }
.upload-error { display:flex;align-items:flex-start;gap:8px;background:var(--c-rose-lt);border:1px solid #f5c0c8;color:var(--c-rose);font-size:12.5px;padding:10px 12px;border-radius:var(--radius-sm);margin-top:12px; }
.skip-section { margin-top:14px;text-align:center; }
.skip-btn { background:none;border:none;font-size:12.5px;color:var(--c-text3);cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:underline; }
.format-note { display:flex;align-items:flex-start;gap:8px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--radius-sm);padding:10px 12px;margin-top:14px; }
.fn-txt { font-size:11.5px;color:var(--c-text2);line-height:1.5; }
</style>