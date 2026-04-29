<template>
  <div class="step-wrap">
    <div class="step-intro">
      <div class="step-icon">🎓</div>
      <h3>Education</h3>
      <p>Your most recent or relevant educational qualification.</p>
    </div>

    <div class="f-grp">
      <div class="f-lbl">Degree / Qualification</div>
      <input class="f-inp" v-model="store.data.education.degree" placeholder="MSc Product Management" />
    </div>
    <div class="f-row">
      <div class="f-grp">
        <div class="f-lbl">School / University</div>
        <input class="f-inp" v-model="store.data.education.school" placeholder="UCL" />
      </div>
      <div class="f-grp">
        <div class="f-lbl">Year Graduated</div>
        <input class="f-inp" v-model="store.data.education.year" placeholder="2016" style="width:100%;" />
      </div>
    </div>

    <div class="f-sec">Certifications <span class="opt-badge">optional</span></div>
    <div class="cert-list">
      <div v-for="(cert, i) in certs" :key="i" class="cert-row">
        <input class="f-inp" v-model="certs[i]" :placeholder="`e.g. AWS Certified, PSPO II`" />
        <button class="cert-rm" @click="certs.splice(i,1)">×</button>
      </div>
    </div>
    <button class="add-cert-btn" @click="certs.push('')">
      + Add Certification
    </button>

    <div class="f-sec">Languages <span class="opt-badge">optional</span></div>
    <div class="lang-grid">
      <div v-for="(lang, i) in langs" :key="i" class="lang-row">
        <input class="f-inp" v-model="lang.name" placeholder="Language" />
        <select class="f-inp" v-model="lang.level" style="flex:0 0 120px;">
          <option value="">Level</option>
          <option>Native</option>
          <option>Fluent (C2)</option>
          <option>Advanced (C1)</option>
          <option>Upper-Int (B2)</option>
          <option>Intermediate (B1)</option>
          <option>Basic (A2)</option>
        </select>
        <button class="cert-rm" @click="langs.splice(i,1)">×</button>
      </div>
    </div>
    <button class="add-cert-btn" @click="langs.push({name:'',level:''})">
      + Add Language
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCvStore } from '../../stores/cv.js'

const store = useCvStore()
defineEmits(['next'])

const certs = ref(['PSPO II — Scrum Alliance'])
const langs = ref([{ name: 'English', level: 'Native' }, { name: 'French', level: 'Upper-Int (B2)' }])
</script>

<style scoped>
.step-intro{margin-bottom:20px;}
.step-icon{font-size:28px;margin-bottom:8px;}
h3{font-size:18px;font-weight:700;color:var(--c-text);margin-bottom:5px;font-family:'DM Serif Display',serif;}
p{font-size:13px;color:var(--c-text2);line-height:1.5;}
.opt-badge{font-size:9.5px;font-weight:600;color:var(--c-text3);background:var(--c-bg);padding:1px 6px;border-radius:20px;margin-left:5px;vertical-align:middle;}
.cert-list,.lang-grid{display:flex;flex-direction:column;gap:6px;margin-bottom:8px;}
.cert-row,.lang-row{display:flex;align-items:center;gap:6px;}
.cert-rm{background:none;border:none;font-size:18px;color:var(--c-text3);cursor:pointer;padding:0 4px;flex-shrink:0;}
.cert-rm:hover{color:var(--c-rose);}
.add-cert-btn{background:none;border:none;font-size:12px;font-weight:700;color:var(--c-accent);cursor:pointer;font-family:'DM Sans',sans-serif;padding:0;margin-bottom:4px;}
.add-cert-btn:hover{text-decoration:underline;}
</style>