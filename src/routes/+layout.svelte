<script lang="ts">
  import { onMount } from 'svelte';
  import { darkMode } from '$lib/stores/darkMode';
  import '$lib/styles/dark-mode-overrides.css';

  // Initialize dark mode on client mount so localStorage & .dark class are synced
  onMount(() => {
    darkMode.init();
  });
</script>

<slot />
