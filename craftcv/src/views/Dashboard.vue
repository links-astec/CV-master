<template>
  <div class="view-page">
    <div class="filter-row">
      <button v-for="t in tabs" :key="t.id" class="filter-tab" :class="{ active: activeTab === t.id }" @click="activeTab = t.id">
        {{ t.label }} <span class="f-count">{{ t.count }}</span>
      </button>
    </div>
    <div class="cards-grid">
      <div
        v-for="(p, i) in projects" :key="p.title"
        class="proj-card anim-up"
        :style="{ animationDelay: `${i * 0.06}s` }"
        @click="store.openWizard()"
      >
        <div class="card-icon" :style="{ background: p.bg }">{{ p.icon }}</div>
        <div class="card-ttl">{{ p.title }}</div>
        <div class="card-meta">{{ p.sub }}</div>
        <div class="card-sep"></div>
        <div class="card-foot">
          <div class="ava-stack">
            <div v-for="(c, j) in p.ac" :key="j" class="ava-sm" :style="{ background: c }">{{ 'ABCD'[j] }}</div>
          </div>
          <div class="prog-num">{{ p.prog }}%</div>
        </div>
        <div class="prog-track">
          <div class="prog-fill" :style="{ width: p.prog + '%', background: p.ac[0] }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCvStore } from '../stores/cv.js'
const store = useCvStore()

const activeTab = ref('all')
const tabs = [
  { id: 'all', label: 'All', count: 6 },
  { id: 'active', label: 'Active', count: 4 },
  { id: 'drafts', label: 'Drafts', count: 1 },
  { id: 'done', label: 'Completed', count: 1 },
]

const projects = [
  { title:'Software Engineer CV', sub:'Tech Team · 2 Days Left', icon:'💻', bg:'#e8eefb', prog:72, ac:['#2a5bd7','#4338ca','#0891b2'] },
  { title:'Product Manager CV',   sub:'PM Team · 1 Week Left',   icon:'📋', bg:'#f0ebfa', prog:88, ac:['#6236b0','#2a5bd7'] },
  { title:'UX Designer CV',       sub:'Design · 3 Days Left',    icon:'🎨', bg:'#fce9eb', prog:45, ac:['#c52b3d','#be185d'] },
  { title:'Data Scientist CV',    sub:'Data · 2 Weeks Left',     icon:'📊', bg:'#e6f5f4', prog:91, ac:['#0d7a72','#1a7a4a'] },
  { title:'Marketing Lead CV',    sub:'Marketing · 1 Month',     icon:'📣', bg:'#fdf0dc', prog:34, ac:['#b56a0e'] },
  { title:'Finance Analyst CV',   sub:'Finance · Completed',     icon:'💹', bg:'#e6f5ed', prog:100, ac:['#0d7a72','#1a7a4a'] },
]
</script>