<script lang="ts">
  import { page } from '$app/stores';
  import { _ } from 'svelte-i18n';
  import { 
    Home, 
    ShoppingCart, 
    Package, 
    ShoppingBag, 
    DollarSign, 
    Users, 
    FileText, 
    Settings 
  } from 'lucide-svelte';
  
  export let open = true;
  
  const navigation = [
    { name: 'nav.dashboard', href: '/dashboard', icon: Home },
    { name: 'nav.sales', href: '/sales', icon: ShoppingCart },
    { name: 'nav.inventory', href: '/inventory', icon: Package },
    { name: 'nav.purchases', href: '/purchases', icon: ShoppingBag },
    { name: 'nav.cash', href: '/cash', icon: DollarSign },
    { name: 'nav.accounts', href: '/accounts', icon: Users },
    { name: 'nav.reports', href: '/reports', icon: FileText },
    { name: 'nav.settings', href: '/settings', icon: Settings },
  ];
  
  $: currentPath = $page.url.pathname;
</script>

<aside class="fixed inset-y-0 ltr:left-0 rtl:right-0 z-20 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out
             {open ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'}
             md:translate-x-0 md:static md:inset-0">
  <div class="flex flex-col h-full">
    <!-- Logo -->
    <div class="flex items-center justify-center h-16 bg-gray-800">
      <h2 class="text-xl font-bold text-white">StockSync</h2>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
      {#each navigation as item}
        <a
          href={item.href}
          class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors
                 {currentPath.startsWith(item.href)
                   ? 'bg-gray-800 text-white'
                   : 'text-gray-300 hover:bg-gray-700 hover:text-white'}"
        >
          <svelte:component this={item.icon} class="h-5 w-5 flex-shrink-0" />
          <span>{$_(item.name)}</span>
        </a>
      {/each}
    </nav>

    <!-- User role indicator -->
    <div class="p-4 border-t border-gray-700">
      <p class="text-xs text-gray-400">{$_('auth.role')}</p>
      <p class="text-sm font-medium text-white capitalize">{$page.data.user?.role.toLowerCase()}</p>
    </div>
  </div>
</aside>