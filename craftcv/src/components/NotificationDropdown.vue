<template>
  <div class="notif-wrap" ref="wrap">
    <button class="icon-btn" @click="toggle" :title="open ? 'Close notifications' : 'Notifications'">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
      <span v-if="notifStore.unreadCount > 0" class="notif-dot"></span>
    </button>

    <Transition name="notif-fade">
      <div v-if="open" class="notif-dropdown">
        <div class="notif-hd">
          <div class="notif-hd-title">
            Notifications
            <span v-if="notifStore.unreadCount" class="notif-count-badge">{{ notifStore.unreadCount }}</span>
          </div>
          <button v-if="notifStore.unreadCount" class="notif-mark-all" @click="notifStore.markAllRead()">Mark all read</button>
        </div>

        <div class="notif-list">
          <div v-if="!notifStore.items.length" class="notif-empty">
            <svg style="width:28px;height:28px;color:var(--c-border2);margin-bottom:8px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            <div>No notifications yet</div>
          </div>

          <div v-for="n in notifStore.items" :key="n.id"
            class="notif-item" :class="{ unread: !n.read }"
            @click="read(n)">
            <div class="notif-icon" :style="{ background: iconBg(n.type) }">
              <svg :style="{ color: iconColor(n.type) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" v-html="iconPath(n.type)"></svg>
            </div>
            <div class="notif-content">
              <div class="notif-title">{{ n.title }}</div>
              <div class="notif-body">{{ n.body }}</div>
              <div class="notif-time">{{ timeAgo(n.time) }}</div>
            </div>
            <div v-if="!n.read" class="notif-unread-pip"></div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotifStore } from '../stores/notifications.js'

const notifStore = useNotifStore()
const open = ref(false)
const wrap = ref(null)

function toggle() { open.value = !open.value }
function read(n) { notifStore.markRead(n.id) }

function iconPath(type) {
  const p = {
    welcome: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>',
    tip:     '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    feature: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    payment: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    review:  '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    system:  '<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>',
  }
  return p[type] || p.system
}

function iconBg(type) {
  return { welcome:'#fce9eb', tip:'#fdf0dc', feature:'#f0ebfa', payment:'#e8eefb', review:'#e6f5ed', system:'#f5f4f0' }[type] || '#f5f4f0'
}
function iconColor(type) {
  return { welcome:'#c52b3d', tip:'#b56a0e', feature:'#6236b0', payment:'#2a5bd7', review:'#1a7a4a', system:'#6b6860' }[type] || '#6b6860'
}

function timeAgo(ts) {
  const d = Date.now() - ts
  if (d < 60000) return 'just now'
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`
  return `${Math.floor(d / 86400000)}d ago`
}

function onClickOutside(e) { if (wrap.value && !wrap.value.contains(e.target)) open.value = false }
onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.notif-icon { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.notif-icon svg { width: 14px; height: 14px; }
.notif-count-badge { background: var(--c-accent); color: #fff; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 20px; margin-left: 7px; }
.notif-empty { padding: 32px 20px; text-align: center; color: var(--c-text3); font-size: 13px; display: flex; flex-direction: column; align-items: center; }
</style>