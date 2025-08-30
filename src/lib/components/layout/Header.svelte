<script lang="ts">
  import { page } from '$app/stores';
  import { _ } from 'svelte-i18n';
  import { Menu, X, Bell, User, LogOut } from 'lucide-svelte';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  
  export let sidebarOpen = false;
  
  let userMenuOpen = false;
  
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
</script>

<header class="sticky top-0 z-30 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Mobile menu button -->
      <button
        on:click={toggleSidebar}
        class="md:hidden inline-flex items-center justify-center p-3 rounded-md text-gray-400 
               hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 
               focus:ring-inset focus:ring-blue-500 touch-manipulation min-w-[44px] min-h-[44px]"
        aria-label="Toggle navigation menu"
      >
        {#if sidebarOpen}
          <X class="h-6 w-6" />
        {:else}
          <Menu class="h-6 w-6" />
        {/if}
      </button>

      <!-- Logo/Brand -->
      <div class="flex items-center">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          {$_('nav.dashboard')}
        </h1>
      </div>

      <!-- Right side items -->
      <div class="flex items-center gap-4">
        <LanguageSwitcher />
        
        <!-- Notifications -->
        <button class="p-3 text-gray-400 hover:text-gray-500 relative touch-manipulation min-w-[44px] min-h-[44px] rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Notifications">
          <Bell class="h-5 w-5" />
          <span class="absolute top-2 ltr:right-2 rtl:left-2 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
        </button>

        <!-- User menu -->
        <div class="relative">
          <button
            on:click={() => userMenuOpen = !userMenuOpen}
            on:blur={() => setTimeout(() => userMenuOpen = false, 200)}
            class="flex items-center gap-2 p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation min-h-[44px]"
            aria-label="User menu"
          >
            <User class="h-5 w-5" />
            <span class="hidden sm:block text-sm font-medium truncate max-w-32">
              {$page.data.user?.name}
            </span>
          </button>

          {#if userMenuOpen}
            <div class="absolute ltr:right-0 rtl:left-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-700">
              <div class="py-1">
                <a href="/settings/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">
                  {$_('nav.settings')}
                </a>
                <form method="POST" action="/auth/logout">
                  <button type="submit" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">
                    <LogOut class="inline h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    {$_('nav.logout')}
                  </button>
                </form>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</header>