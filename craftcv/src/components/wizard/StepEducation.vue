<template>
  <div class="step-wrap">
    <div class="step-intro">
      <div class="step-icon">🎓</div>
      <h3>Education, Projects & Languages</h3>
      <p>Add your qualifications, personal projects, certifications, and languages.</p>
    </div>

    <!-- EDUCATION -->
    <div class="f-sec-hd">
      Education
    </div>
    <div class="edu-list">
      <div v-for="(edu, i) in store.data.education" :key="i" class="edu-card">
        <div class="edu-card-hd">
          <span class="edu-num">{{ i === 0 ? 'Primary' : 'Additional' }}</span>
          <button v-if="i > 0" class="rm-btn" @click="store.data.education.splice(i, 1)" title="Remove">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="f-grp">
          <div class="f-lbl">Degree / Qualification</div>
          <input class="f-inp" v-model="edu.degree" placeholder="MSc Product Management" />
        </div>
        <div class="f-row">
          <div class="f-grp">
            <div class="f-lbl">School / University</div>
            <input class="f-inp" v-model="edu.school" placeholder="UCL" />
          </div>
          <div class="f-grp" style="flex:0 0 110px;">
            <div class="f-lbl">Year</div>
            <input class="f-inp" v-model="edu.year" placeholder="2016" />
          </div>
        </div>
      </div>
    </div>
    <button class="add-btn" @click="store.data.education.push({ degree: '', school: '', year: '' })">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px;height:12px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Add Another Qualification
    </button>

    <!-- PROJECTS -->
    <div class="f-sec-hd">
      Projects <span class="opt-badge">optional</span>
    </div>
    <p class="f-sec-sub">Great for developers, designers, or anyone with side projects worth showcasing.</p>
    <div class="proj-list">
      <div v-for="(proj, i) in store.data.projects" :key="proj.id" class="proj-card">
        <div class="proj-card-hd">
          <span class="proj-num">Project {{ i + 1 }}</span>
          <button class="rm-btn" @click="store.data.projects.splice(i, 1)" title="Remove project">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="f-grp">
          <div class="f-lbl">Project Name</div>
          <input class="f-inp" v-model="proj.name" placeholder="e.g. Portfolio Website, Open Source Tool" />
        </div>
        <div class="f-grp">
          <div class="f-lbl">Tech / Stack <span class="opt-badge">optional</span></div>
          <input class="f-inp" v-model="proj.tech" placeholder="e.g. Vue, Node.js, PostgreSQL" />
        </div>
        <div class="f-grp">
          <div class="f-lbl">Description</div>
          <textarea class="f-inp f-area" v-model="proj.desc" placeholder="What did you build? What problem did it solve? Any key results?" rows="2" />
        </div>
        <div class="f-grp">
          <div class="f-lbl">URL <span class="opt-badge">optional</span></div>
          <input class="f-inp" v-model="proj.url" placeholder="https://github.com/you/project" />
        </div>
      </div>
    </div>
    <button class="add-btn" @click="addProject">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px;height:12px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Add Project
    </button>

    <!-- CERTIFICATIONS -->
    <div class="f-sec-hd">
      Certifications <span class="opt-badge">optional</span>
    </div>
    <div class="cert-list">
      <div v-for="(cert, i) in store.data.certifications" :key="i" class="cert-row">
        <input class="f-inp" v-model="store.data.certifications[i]" placeholder="e.g. AWS Certified, PMP, PSPO II" />
        <button class="rm-btn" @click="store.data.certifications.splice(i, 1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <button class="add-btn" @click="store.data.certifications.push('')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px;height:12px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Add Certification
    </button>

    <!-- LANGUAGES -->
    <div class="f-sec-hd">
      Languages <span class="opt-badge">optional</span>
    </div>
    <div class="lang-list">
      <div v-for="(lang, i) in store.data.languages" :key="i" class="lang-card">
        <div class="lang-fields">
          <div class="f-grp" style="flex:1;">
            <div class="f-lbl">Language</div>
            <input class="f-inp" v-model="lang.name" placeholder="e.g. French" />
          </div>
          <div class="f-grp" style="flex:1;">
            <div class="f-lbl">Level</div>
            <select class="f-inp f-select" v-model="lang.level">
              <option value="">Select level</option>
              <option value="Native">Native</option>
              <option value="Fluent (C2)">Fluent (C2)</option>
              <option value="Advanced (C1)">Advanced (C1)</option>
              <option value="Upper-Intermediate (B2)">Upper-Intermediate (B2)</option>
              <option value="Intermediate (B1)">Intermediate (B1)</option>
              <option value="Basic (A2)">Basic (A2)</option>
              <option value="Beginner (A1)">Beginner (A1)</option>
            </select>
          </div>
          <button class="rm-btn lang-rm" @click="store.data.languages.splice(i, 1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>
    <button class="add-btn" @click="store.data.languages.push({ name: '', level: '' })">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px;height:12px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Add Language
    </button>
  </div>
</template>

<script setup>
import { useCvStore } from '../../stores/cv.js'
const store = useCvStore()
defineEmits(['next'])

// Ensure all arrays exist and education is array
if (!Array.isArray(store.data.education) || store.data.education.length === 0) {
  const old = store.data.education
  store.data.education = (old && !Array.isArray(old) && old.degree !== undefined)
    ? [old]
    : [{ degree: '', school: '', year: '' }]
}
if (!Array.isArray(store.data.projects))      store.data.projects = []
if (!Array.isArray(store.data.certifications)) store.data.certifications = []
if (!Array.isArray(store.data.languages))      store.data.languages = []

function addProject() {
  store.data.projects.push({ id: Date.now(), name: '', desc: '', url: '', tech: '' })
}
</script>

<style scoped>
.step-intro { margin-bottom: 20px; }
.step-icon  { font-size: 28px; margin-bottom: 8px; }
h3  { font-size: 18px; font-weight: 700; color: var(--c-text); margin-bottom: 5px; font-family: 'DM Serif Display', serif; }
p   { font-size: 13px; color: var(--c-text2); line-height: 1.5; }

.f-sec-hd {
  font-size: 13px; font-weight: 700; color: var(--c-text);
  margin: 20px 0 6px; display: flex; align-items: center; gap: 8px;
}
.f-sec-sub { font-size: 12px; color: var(--c-text3); margin: -4px 0 10px; }

.opt-badge {
  font-size: 9.5px; font-weight: 600; color: var(--c-text3);
  background: var(--c-bg); padding: 1px 6px; border-radius: 20px;
}

/* Education cards */
.edu-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 8px; }
.edu-card {
  background: var(--c-bg); border: 1px solid var(--c-border);
  border-radius: 10px; padding: 14px;
}
.edu-card-hd {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.edu-num {
  font-size: 10.5px; font-weight: 700; color: var(--c-accent);
  text-transform: uppercase; letter-spacing: .06em;
}

/* Project cards */
.proj-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 8px; }
.proj-card {
  background: var(--c-bg); border: 1px solid var(--c-border);
  border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px;
}
.proj-card-hd {
  display: flex; align-items: center; justify-content: space-between;
}
.proj-num {
  font-size: 10.5px; font-weight: 700; color: var(--c-accent);
  text-transform: uppercase; letter-spacing: .06em;
}

/* Certifications */
.cert-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
.cert-row  { display: flex; align-items: center; gap: 6px; }

/* Languages */
.lang-list   { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
.lang-card   { background: var(--c-bg); border: 1px solid var(--c-border); border-radius: 10px; padding: 12px; }
.lang-fields { display: flex; align-items: flex-end; gap: 8px; }
.lang-rm     { flex-shrink: 0; }
@media (max-width: 480px) {
  .lang-fields { flex-direction: column; }
  .lang-rm     { align-self: flex-end; }
}

/* Remove button */
.rm-btn {
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 8px;
  background: none; border: 1px solid var(--c-border);
  color: var(--c-text3); cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all .15s;
}
.rm-btn svg { width: 13px; height: 13px; }
.rm-btn:hover { background: var(--c-rose-lt); border-color: var(--c-rose); color: var(--c-rose); }

/* Add button */
.add-btn {
  display: flex; align-items: center; gap: 6px; background: none; border: none;
  font-size: 12.5px; font-weight: 700; color: var(--c-accent); cursor: pointer;
  font-family: 'DM Sans', sans-serif; padding: 0; margin-bottom: 4px;
}
.add-btn:hover { text-decoration: underline; }

.f-select { cursor: pointer; }
.f-area   { resize: vertical; min-height: 60px; }
</style>