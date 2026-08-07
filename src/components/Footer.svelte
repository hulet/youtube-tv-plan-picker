<script lang="ts">
  const REPO_URL = 'https://github.com/hulet/youtube-tv-plan-picker';
  const dataUpdated = __DATA_UPDATED__;
</script>

<footer>
  <p>
    Notice an error? Have plan lineups changed?
    <a href={REPO_URL} target="_blank" rel="noopener">Submit a pull request</a>.
  </p>
  <p class="fine">
    Not affiliated with YouTube or Google. Data current as of {dataUpdated}.
  </p>
</footer>

<style>
  footer {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid color-mix(in srgb, currentColor 10%, transparent);
    font-size: 0.85rem;
    color: color-mix(in srgb, currentColor 70%, transparent);
  }
  footer p { margin: 0 0 0.5rem; }
  footer .fine { color: color-mix(in srgb, currentColor 50%, transparent); }
</style>
