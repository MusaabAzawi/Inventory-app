<script lang="ts">
  import Header from '$lib/components/layout/Header.svelte';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { setLocale } from '$lib/i18n';
  
  let sidebarOpen = false;
  
  onMount(() => {
    // Set user's preferred language
    if ($page.data.user?.preferredLanguage) {
      setLocale($page.data.user.preferredLanguage);
    }
  });
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <Sidebar bind:open={sidebarOpen} />
  
  <div class="md:ltr:pl-64 md:rtl:pr-64">
    <Header bind:sidebarOpen />
    
    <main class="p-4 sm:p-6 lg:p-8">
      <slot />
    </main>
  </div>
</div>

<!-- Mobile sidebar overlay -->
{#if sidebarOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
    on:click={() => sidebarOpen = false}
  ></div>
{/if}