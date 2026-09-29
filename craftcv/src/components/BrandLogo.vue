<template>
  <span class="brand" :class="{ 'brand-sm': small }">
    <span class="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" fill="#fff" opacity=".95"/><path d="M14 3v5h5" fill="none" stroke="#c7c4ff" stroke-width="1.4"/><path d="M8.5 12.5h7M8.5 15.5h5" stroke="#4f46e5" stroke-width="1.6" stroke-linecap="round"/></svg>
    </span>
    <span v-if="!markOnly" class="brand-name">CVMaster</span>
  </span>
</template>

<script setup>
defineProps({ small: Boolean, markOnly: Boolean })
</script>

<style scoped>
.brand{display:inline-flex;align-items:center;gap:10px;text-decoration:none}
.brand-mark{width:32px;height:32px;border-radius:9px;background:linear-gradient(145deg,#6366f1,#4338ca);display:flex;align-items:center;justify-content:center;box-shadow:0 1px 2px rgba(67,56,202,.35),inset 0 1px 0 rgba(255,255,255,.18);flex-shrink:0}
.brand-mark svg{width:20px;height:20px}
.brand-name{font-size:16.5px;font-weight:700;letter-spacing:-.02em;color:var(--c-text)}
.brand-sm .brand-mark{width:28px;height:28px;border-radius:8px}
.brand-sm .brand-mark svg{width:17px;height:17px}
.brand-sm .brand-name{font-size:15px}
</style>
