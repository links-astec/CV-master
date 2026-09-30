<template>
  <div class="roc">
    <span class="roc-grip" title="Drag to reorder" aria-hidden="true" @mousedown="$emit('arm')" @mouseup="$emit('disarm')">
      <svg viewBox="0 0 24 24"><circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/></svg>
    </span>
    <button type="button" class="roc-btn" :disabled="index === 0" aria-label="Move up" title="Move up" @click="$emit('move', -1)">
      <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
    </button>
    <button type="button" class="roc-btn" :disabled="index >= total - 1" aria-label="Move down" title="Move down" @click="$emit('move', 1)">
      <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
  </div>
</template>

<script setup>
defineProps({ index: { type: Number, required: true }, total: { type: Number, required: true } })
defineEmits(['move', 'arm', 'disarm'])
</script>

<style scoped>
.roc{display:inline-flex;align-items:center;gap:2px}
.roc-grip{width:22px;height:26px;display:inline-flex;align-items:center;justify-content:center;cursor:grab;color:var(--c-text3);border-radius:6px}
.roc-grip:hover{background:var(--c-surface2);color:var(--c-text2)}
.roc-grip:active{cursor:grabbing}
.roc-grip svg{width:14px;height:14px;fill:currentColor}
.roc-btn{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;border:none;background:none;border-radius:6px;color:var(--c-text3);padding:0}
.roc-btn:hover:not(:disabled){background:var(--c-surface2);color:var(--c-text)}
.roc-btn:disabled{opacity:.3;cursor:default}
.roc-btn svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.2}
@media (hover:none){ .roc-grip{display:none} }
</style>
