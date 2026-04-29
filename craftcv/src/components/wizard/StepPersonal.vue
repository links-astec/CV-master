<template>
  <div class="step-wrap">
    <h3 class="step-title">Personal Information</h3>
    <p class="step-sub">Your contact details shown at the top of every CV.</p>

    <!-- Photo Upload — always visible, highlighted for photo template -->
    <div class="photo-section" :class="{ 'photo-required': store.template === 'photo' }">
      <div class="photo-section-lbl">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        Profile Photo
        <span v-if="store.template === 'photo'" class="req-badge">Required for this template</span>
        <span v-else class="opt-badge">Optional</span>
      </div>

      <div class="photo-upload-row">
        <!-- Preview / placeholder -->
        <div class="photo-circle" @click="triggerPick" :class="{ 'has-photo': !!store.data.photo, 'no-photo': !store.data.photo }">
          <img v-if="store.data.photo" :src="store.data.photo" class="photo-img" />
          <div v-else class="photo-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </div>
          <div class="photo-overlay">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </div>
        </div>

        <!-- Drop zone -->
        <div
          class="photo-drop-zone"
          :class="{ dragging }"
          @click="triggerPick"
          @dragover.prevent="dragging = true"
          @dragleave="dragging = false"
          @drop.prevent="handleDrop"
        >
          <input type="file" ref="fileInput" accept="image/jpeg,image/png,image/webp" style="display:none" @change="handleFile" />
          <div v-if="!store.data.photo" class="dz-content">
            <svg class="dz-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
            <div class="dz-primary">Drop photo here or <span class="dz-link">browse</span></div>
            <div class="dz-hint">JPG, PNG or WEBP · Max 5MB · Passport or headshot style</div>
          </div>
          <div v-else class="dz-content">
            <svg class="dz-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <div class="dz-primary">Photo uploaded</div>
            <div class="dz-hint">Click to change · Drop a new photo to replace</div>
          </div>
        </div>
      </div>

      <div v-if="store.data.photo" class="photo-actions">
        <button class="photo-rm-btn" @click="store.data.photo = null">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          Remove photo
        </button>
      </div>
      <div v-if="photoError" class="photo-err">{{ photoError }}</div>
    </div>

    <div class="f-sec">Name</div>
    <div class="f-row">
      <div class="f-grp"><div class="f-lbl">First Name</div><input class="f-inp" v-model="store.data.fn" placeholder="Alexandra" autocomplete="given-name" /></div>
      <div class="f-grp"><div class="f-lbl">Last Name</div><input class="f-inp" v-model="store.data.ln" placeholder="Morrison" autocomplete="family-name" /></div>
    </div>
    <div class="f-grp"><div class="f-lbl">Job Title / Desired Role</div><input class="f-inp" v-model="store.data.title" placeholder="Senior Product Manager" /></div>

    <div class="f-sec">Contact</div>
    <div class="f-row">
      <div class="f-grp"><div class="f-lbl">Email</div><input class="f-inp" v-model="store.data.email" type="email" placeholder="you@email.com" autocomplete="email" /></div>
      <div class="f-grp"><div class="f-lbl">Phone</div><input class="f-inp" v-model="store.data.phone" placeholder="+44 7712 000 000" autocomplete="tel" /></div>
    </div>
    <div class="f-row">
      <div class="f-grp"><div class="f-lbl">Location</div><input class="f-inp" v-model="store.data.loc" placeholder="London, UK" /></div>
      <div class="f-grp"><div class="f-lbl">LinkedIn URL</div><input class="f-inp" v-model="store.data.li" placeholder="linkedin.com/in/you" /></div>
    </div>
    <div class="f-grp">
      <div class="f-lbl">Website / Portfolio <span class="opt-badge" style="margin-left:5px;">optional</span></div>
      <input class="f-inp" v-model="store.data.website" placeholder="yourportfolio.com" autocomplete="url" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCvStore } from '../../stores/cv.js'
const store = useCvStore()
const fileInput = ref(null)
const dragging = ref(false)
const photoError = ref('')

function triggerPick() { fileInput.value?.click() }

function handleFile(e) { processFile(e.target.files[0]) }

function handleDrop(e) {
  dragging.value = false
  processFile(e.dataTransfer.files[0])
}

function processFile(file) {
  photoError.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) { photoError.value = 'Please upload an image file (JPG, PNG, WEBP)'; return }
  if (file.size > 5 * 1024 * 1024) { photoError.value = 'Image must be under 5MB'; return }
  const reader = new FileReader()
  reader.onload = (e) => { store.data.photo = e.target.result }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.step-title { font-family: 'DM Serif Display', serif; font-size: 20px; color: var(--c-text); margin-bottom: 5px; }
.step-sub { font-size: 13px; color: var(--c-text2); margin-bottom: 20px; }

/* Photo section */
.photo-section {
  border: 1.5px solid var(--c-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 20px;
  transition: border-color .2s;
}
.photo-section.photo-required { border-color: var(--c-accent); background: var(--c-accent-lt); }

.photo-section-lbl {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; font-weight: 600; color: var(--c-text);
  margin-bottom: 14px;
}
.photo-section-lbl svg { width: 14px; height: 14px; color: var(--c-text2); }
.req-badge {
  margin-left: 4px; font-size: 9.5px; font-weight: 700; color: var(--c-accent);
  background: #fff; padding: 2px 7px; border-radius: 20px; border: 1px solid var(--c-accent);
}
.opt-badge { font-size: 9.5px; font-weight: 600; color: var(--c-text3); background: var(--c-bg); padding: 1px 7px; border-radius: 20px; }

.photo-upload-row { display: flex; align-items: center; gap: 14px; }

/* Circle preview */
.photo-circle {
  width: 72px; height: 72px; border-radius: 50%; flex-shrink: 0;
  overflow: hidden; cursor: pointer; position: relative;
  background: var(--c-bg); border: 2px dashed var(--c-border2);
  transition: border-color .18s;
}
.photo-circle.has-photo { border-style: solid; border-color: var(--c-accent); }
.photo-circle:hover .photo-overlay { opacity: 1; }
.photo-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.photo-empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.photo-empty svg { width: 26px; height: 26px; color: var(--c-text3); }
.photo-overlay {
  position: absolute; inset: 0; background: rgba(42,91,215,.65);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .18s; border-radius: 50%;
}
.photo-overlay svg { width: 20px; height: 20px; color: #fff; }

/* Drop zone */
.photo-drop-zone {
  flex: 1; border: 2px dashed var(--c-border2); border-radius: var(--radius);
  padding: 16px 18px; cursor: pointer; transition: all .18s;
  background: var(--c-surface);
}
.photo-drop-zone:hover, .photo-drop-zone.dragging {
  border-color: var(--c-accent); background: var(--c-accent-lt);
}
.dz-content { display: flex; flex-direction: column; gap: 4px; }
.dz-icon { width: 24px; height: 24px; color: var(--c-text3); margin-bottom: 4px; }
.dz-primary { font-size: 13px; font-weight: 500; color: var(--c-text); }
.dz-link { color: var(--c-accent); font-weight: 700; }
.dz-hint { font-size: 11px; color: var(--c-text3); }

.photo-actions { margin-top: 10px; }
.photo-rm-btn {
  display: flex; align-items: center; gap: 6px; background: none; border: none;
  font-size: 12px; font-weight: 600; color: var(--c-rose); cursor: pointer;
  font-family: 'DM Sans', sans-serif; padding: 0; transition: opacity .14s;
}
.photo-rm-btn:hover { opacity: .75; }
.photo-rm-btn svg { width: 13px; height: 13px; }
.photo-err { font-size: 11.5px; color: var(--c-rose); margin-top: 8px; font-weight: 500; }
</style>