<template>
  <span class="brand" :class="[{ 'brand-sm': small, 'brand-lg': large }, { 'brand-dark': dark }]" aria-label="CVMaster">
    <!-- The mark: a CV page with a tick (same drawing as brand/cvmaster-mark.svg) -->
    <svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="#4338CA"/>
      <path d="M21 11h15l11 11v27a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4V15a4 4 0 0 1 4-4z" fill="#FFFFFF"/>
      <path d="M36 11v7.5a3.5 3.5 0 0 0 3.5 3.5H47z" fill="#A5B4FC"/>
      <path d="M23 19.5h8" stroke="#C7D2FE" stroke-width="3" stroke-linecap="round"/>
      <path d="M23.5 37.5l6.5 6.5 12-12.5" fill="none" stroke="#4338CA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span v-if="!markOnly" class="brand-name" aria-hidden="true"><span class="brand-cv">CV</span>Master</span>
  </span>
</template>

<script setup>
defineProps({ small: Boolean, large: Boolean, markOnly: Boolean, dark: Boolean })
</script>

<style scoped>
.brand{display:inline-flex;align-items:center;gap:10px;text-decoration:none;font-family:'Plus Jakarta Sans',system-ui,sans-serif}
.brand-mark{width:32px;height:32px;flex-shrink:0;display:block}
.brand-name{font-size:19px;font-weight:800;letter-spacing:-.035em;color:#14142B;line-height:1}
.brand-cv{color:#4338CA}
.brand-sm .brand-mark{width:28px;height:28px}
.brand-sm .brand-name{font-size:17px}
.brand-lg{gap:14px}
.brand-lg .brand-mark{width:44px;height:44px}
.brand-lg .brand-name{font-size:26px}
.brand-dark .brand-name{color:#FFFFFF}
.brand-dark .brand-cv{color:#A5B4FC}
:global([data-theme="dark"]) .brand .brand-name{color:#F3F4F6}
:global([data-theme="dark"]) .brand .brand-cv{color:#A5B4FC}
</style>
