<script lang="ts">
  import '../app.css';
  import { isLoading } from 'svelte-i18n';
  import { page } from '$app/stores';
  
  $: isAuthPage = $page.url.pathname.startsWith('/auth');
</script>

{#if $isLoading}
  <div class="min-h-screen flex items-center justify-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
{:else}
  <slot />
{/if}