<script lang="ts">
  import { onMount } from 'svelte';
  import HeaderBar from './components/HeaderBar.svelte';
  import SearchBox from './components/SearchBox.svelte';
  import ChannelList from './components/ChannelList.svelte';
  import RecommendationPanel from './components/RecommendationPanel.svelte';
  import Footer from './components/Footer.svelte';
  import {
    selected, query, filteredChannels, matchingPlans, channelIds,
  } from './stores';
  import { encodeSelection, decodeSelection } from './lib/url-state';

  // Initialize selection from URL on mount.
  onMount(() => {
    const params = new URLSearchParams(location.search);
    const initial = decodeSelection(params.get('c'), channelIds);
    if (initial.size > 0) selected.set(initial);
  });

  // Whenever selection changes, update the URL.
  $effect(() => {
    const encoded = encodeSelection($selected);
    const url = new URL(location.href);
    if (encoded) url.searchParams.set('c', encoded);
    else url.searchParams.delete('c');
    if (url.toString() !== location.href) {
      history.replaceState(null, '', url.toString());
    }
  });

  function toggle(id: string) {
    selected.update(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
</script>

<main>
  <HeaderBar />

  <div class="grid">
    <section class="channels">
      <SearchBox value={$query} onInput={(v) => query.set(v)} />
      <ChannelList channels={$filteredChannels} selected={$selected} onToggle={toggle} />
    </section>
    <section class="recommendation">
      <RecommendationPanel plans={$matchingPlans} selectedCount={$selected.size} />
    </section>
  </div>

  <Footer />
</main>

<style>
  main {
    max-width: 1100px;
    margin: 0 auto;
    padding: 1rem 1.5rem 3rem;
  }
  .grid {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
    gap: 2rem;
    margin-top: 1.5rem;
  }
  .channels { display: flex; flex-direction: column; gap: 1rem; }
  @media (max-width: 800px) {
    .grid { grid-template-columns: 1fr; }
  }
</style>
