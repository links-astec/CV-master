<template>
  <div class="lang-sw" role="group" :aria-label="$t('Language')">
    <button v-for="l in LANGS" :key="l.code" type="button" :class="{ on: lang === l.code }"
            :aria-pressed="lang === l.code" :title="l.label" :lang="l.code" @click="setLang(l.code)">{{ l.short }}</button>
  </div>
</template>

<script setup>
import { LANGS, lang, setLang } from '../i18n/index.js'
</script>

<style scoped>
.lang-sw{display:inline-flex;padding:2px;border:1px solid var(--c-border);border-radius:9px;background:var(--c-surface);flex-shrink:0}
.lang-sw button{border:none;background:none;padding:4px 8px;border-radius:7px;font-size:12px;font-weight:700;letter-spacing:.02em;color:var(--c-text3);cursor:pointer;line-height:1.2}
.lang-sw button:hover{color:var(--c-text)}
.lang-sw button.on{background:var(--c-accent-lt);color:var(--c-accent)}
</style>
