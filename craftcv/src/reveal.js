// v-reveal: an element fades up gently the first time it scrolls into view.
// v-reveal="120" delays it by 120 ms (for items in a row). Off when the visitor prefers less motion.
const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
let io = null
const observer = () => io || (io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }))

export default {
  mounted(el, binding) {
    if (reduce || typeof IntersectionObserver === 'undefined') return
    el.classList.add('rv')
    if (binding.value) el.style.transitionDelay = `${Number(binding.value) || 0}ms`
    observer().observe(el)
  },
  unmounted(el) { io?.unobserve(el) },
}
