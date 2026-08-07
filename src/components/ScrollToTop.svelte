<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let visible = $state(false);
  let observer: IntersectionObserver | null = null;
  let scrollHandler: (() => void) | null = null;
  let scrollTicking = false;

  onMount(() => {
    const anchor = document.querySelector<HTMLElement>('[data-scroll-top-anchor]');

    if (anchor && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            // Button is visible when the anchor is NOT intersecting the viewport.
            visible = !entry.isIntersecting;
          }
        },
        { threshold: 0 },
      );
      observer.observe(anchor);
    } else {
      // Fallback: fixed scrollY threshold.
      const onScroll = () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
          visible = window.scrollY > 400;
          scrollTicking = false;
        });
      };
      scrollHandler = onScroll;
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  });

  onDestroy(() => {
    if (observer) observer.disconnect();
    if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
  });

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<button
  type="button"
  class="scroll-top"
  class:visible
  onclick={scrollToTop}
  aria-label="Scroll to top"
  tabindex={visible ? 0 : -1}
>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  </svg>
</button>

<style>
  .scroll-top {
    position: fixed;
    bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
    right: calc(1.5rem + env(safe-area-inset-right, 0px));
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
    background: color-mix(in srgb, canvas 90%, currentColor 10%);
    color: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    opacity: 0;
    transform: translateY(8px);
    pointer-events: none;
    transition: opacity 200ms ease, transform 200ms ease;
    z-index: 100;
  }
  .scroll-top.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
  .scroll-top:hover {
    background: color-mix(in srgb, canvas 80%, currentColor 20%);
  }
  .scroll-top:focus-visible {
    outline: 2px solid color-mix(in srgb, currentColor 60%, transparent);
    outline-offset: 2px;
  }
</style>
