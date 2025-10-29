<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import '$lib/i18n';
  import { darkMode } from '$lib/stores/darkMode';

  let isLoading = true;

  onMount(() => {
    // Initialize dark mode from localStorage
    darkMode.init();

    // Small delay to ensure i18n is loaded
    setTimeout(() => {
      isLoading = false;
    }, 100);
  });

  $: isAuthPage = $page.url.pathname.startsWith('/auth');
</script>

{#if isLoading}
  <div class="min-h-screen flex items-center justify-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
{:else}
  <slot />
{/if}