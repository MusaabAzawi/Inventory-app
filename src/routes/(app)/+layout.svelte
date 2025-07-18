<script lang="ts">
  import Header from '$lib/components/layout/Header.svelte';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import NotificationContainer from '$lib/components/ui/NotificationContainer.svelte';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { setLocale } from '$lib/i18n';
  
  let sidebarOpen = true;
  
  onMount(() => {
    if ($page.data.user?.preferredLanguage) {
      setLocale($page.data.user.preferredLanguage);
    }
  });
</script>

<div class="min-h-screen bg-gray-50 flex dark:bg-gray-900">
  <!-- Sidebar (always visible on desktop) -->
  <div class="hidden md:flex md:w-64 md:flex-col">
    <Sidebar bind:open={sidebarOpen} />
  </div>

  <!-- Main content area -->
  <div class="flex-1 flex flex-col">
    <Header bind:sidebarOpen />
    
    <main class="flex-1 p-6 overflow-auto">
      <slot />
    </main>
  </div>
</div>

<!-- Mobile sidebar overlay -->
{#if sidebarOpen}
  <div class="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" on:click={() => sidebarOpen = false}>
    <div class="w-64 bg-white h-full dark:bg-gray-800">
      <Sidebar bind:open={sidebarOpen} />
    </div>
  </div>
{/if}

<!-- Global Notifications -->
<NotificationContainer />