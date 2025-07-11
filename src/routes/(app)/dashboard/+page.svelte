<!-- src/routes/(app)/dashboard/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { ShoppingCart, Package, DollarSign, TrendingUp, Users, AlertTriangle } from 'lucide-svelte';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  const stats = [
    {
      title: 'modules.sales.title',
      value: data.stats?.totalSales || '0',
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'modules.inventory.title', 
      value: data.stats?.totalProducts || '0',
      icon: Package,
      color: 'bg-green-500'
    },
    {
      title: 'modules.cash.title',
      value: `$${data.stats?.totalCash || '0'}`,
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      title: 'product.lowStock',
      value: data.stats?.lowStockItems || '0',
      icon: AlertTriangle,
      color: 'bg-red-500'
    }
  ];
</script>

<div class="space-y-6">
  <!-- Welcome Header -->
  <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
      {$_('nav.dashboard')}
    </h1>
    <p class="text-gray-600 dark:text-gray-300 mt-2">
      Welcome back, {data.user?.name}!
    </p>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {#each stats as stat}
      <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center">
          <div class="p-3 rounded-full {stat.color} text-white">
            <svelte:component this={stat.icon} class="h-6 w-6" />
          </div>
          <div class="ltr:ml-4 rtl:mr-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
              {$_(stat.title)}
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Quick Actions -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Recent Sales -->
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Sales
      </h3>
      {#if data.recentSales?.length}
        <div class="space-y-3">
          {#each data.recentSales as sale}
            <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {sale.invoiceNumber}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(sale.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span class="font-semibold text-gray-900 dark:text-white">
                ${sale.netAmount}
              </span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-gray-500 dark:text-gray-400">No recent sales</p>
      {/if}
    </div>

    <!-- Low Stock Items -->
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Low Stock Alert
      </h3>
      {#if data.lowStockProducts?.length}
        <div class="space-y-3">
          {#each data.lowStockProducts as product}
            <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {product.nameEn}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  SKU: {product.sku}
                </p>
              </div>
              <span class="text-red-600 font-semibold">
                {product.quantity} left
              </span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-gray-500 dark:text-gray-400">All items are well stocked</p>
      {/if}
    </div>
  </div>
</div>