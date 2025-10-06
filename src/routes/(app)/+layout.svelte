<script lang="ts">
  import { _ } from 'svelte-i18n';
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

<style>
  @media print {
    :global(.sidebar),
    :global(.header),
    :global(nav),
    :global(.no-print) {
      display: none !important;
    }

    :global(.print-only) {
      display: block !important;
    }

    :global(body) {
      margin: 0;
      padding: 0;
      background: white !important;
    }

    :global(.flex-1) {
      padding: 0 !important;
      margin: 0 !important;
    }

    :global(main) {
      padding: 0 !important;
      margin: 0 !important;
      max-width: 100% !important;
    }
  }
</style>

<div class="min-h-screen bg-gray-50 flex dark:bg-gray-900">
  <!-- Sidebar (always visible on desktop) -->
  <div class="hidden md:flex md:w-64 md:flex-col sidebar no-print">
    <Sidebar bind:open={sidebarOpen} />
  </div>

  <!-- Main content area -->
  <div class="flex-1 flex flex-col min-w-0">
    <div class="header no-print">
      <Header bind:sidebarOpen />
    </div>

    <main class="flex-1 p-4 sm:p-6 overflow-auto">
      <div class="max-w-7xl mx-auto">
        <slot />
      </div>
    </main>
  </div>
</div>

<!-- Mobile sidebar overlay -->
{#if sidebarOpen}
  <div 
    class="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity" 
    on:click={() => sidebarOpen = false}
    on:keydown={(e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        sidebarOpen = false;
      }
    }}
    role="button"
    tabindex="0"
    aria-label={$_('ui.closeSidebar')}
  >
    <Sidebar bind:open={sidebarOpen} />
  </div>
{/if}

<!-- Global Notifications -->
<NotificationContainer />