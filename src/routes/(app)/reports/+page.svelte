<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { page } from '$app/stores';
  import { 
    FileText, 
    Download, 
    Calendar, 
    TrendingUp, 
    Package, 
    ShoppingCart,
    Filter
  } from 'lucide-svelte';
  import type { PageData } from './$types';
  
  export let data: PageData;

  let reportType = $page.url.searchParams.get('type') || 'overview';
  let startDate = $page.url.searchParams.get('startDate') || '';
  let endDate = $page.url.searchParams.get('endDate') || '';

  const reportTypes = [
    { id: 'overview', label: 'Overview Report', icon: TrendingUp },
    { id: 'sales', label: 'Sales Report', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory Report', icon: Package },
    { id: 'products', label: 'Products Report', icon: FileText }
  ];

  function generateReport() {
    const params = new URLSearchParams();
    params.set('type', reportType);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    
    window.location.href = `/reports?${params.toString()}`;
  }

  function exportReport() {
    // Implement export functionality
    alert('Export functionality would be implemented here');
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat($locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString($locale === 'ar' ? 'ar-SA' : 'en-US');
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {$_('nav.reports')}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        Generate and view detailed business reports
      </p>
    </div>
    
    <div class="flex gap-2">
      <button
        on:click={exportReport}
        class="btn-secondary btn-md"
      >
        <Download class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        Export
      </button>
    </div>
  </div>

  <!-- Report Controls -->
  <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      Report Settings
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Report Type -->
      <div>
        <label class="label">Report Type</label>
        <select bind:value={reportType} class="input">
          {#each reportTypes as type}
            <option value={type.id}>{type.label}</option>
          {/each}
        </select>
      </div>

      <!-- Start Date -->
      <div>
        <label class="label">Start Date</label>
        <input type="date" bind:value={startDate} class="input" />
      </div>

      <!-- End Date -->
      <div>
        <label class="label">End Date</label>
        <input type="date" bind:value={endDate} class="input" />
      </div>

      <!-- Generate Button -->
      <div class="flex items-end">
        <button
          on:click={generateReport}
          class="btn-primary btn-md w-full"
        >
          <Filter class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          Generate
        </button>
      </div>
    </div>
  </div>

  <!-- Report Content -->
  {#if data.type === 'overview'}
    <!-- Overview Report -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Sales Summary -->
      <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Sales Summary</h3>
          <ShoppingCart class="h-5 w-5 text-gray-400" />
        </div>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Total Sales:</span>
            <span class="font-semibold">{data.data?.sales?._count || 0}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Revenue:</span>
            <span class="font-semibold">{formatCurrency(data.data?.sales?._sum?.netAmount || 0)}</span>
          </div>
        </div>
      </div>

      <!-- Inventory Summary -->
      <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Inventory Summary</h3>
          <Package class="h-5 w-5 text-gray-400" />
        </div>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Total Products:</span>
            <span class="font-semibold">{data.data?.inventory?._count || 0}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Total Stock:</span>
            <span class="font-semibold">{data.data?.inventory?._sum?.quantity || 0}</span>
          </div>
        </div>
      </div>

      <!-- Performance -->
      <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Performance</h3>
          <TrendingUp class="h-5 w-5 text-gray-400" />
        </div>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Avg. Sale Value:</span>
            <span class="font-semibold">
              {formatCurrency((data.data?.sales?._sum?.netAmount || 0) / Math.max(data.data?.sales?._count || 1, 1))}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Products -->
    {#if data.data?.topProducts?.length}
      <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Selling Products</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Product</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Quantity Sold</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Revenue</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              {#each data.data.topProducts as item}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {$locale === 'ar' ? item.product?.nameAr : item.product?.nameEn}
                      </p>
                      <p class="text-sm text-gray-500">SKU: {item.product?.sku}</p>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                    {item._sum?.quantity || 0}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                    {formatCurrency(item._sum?.total || 0)}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

  {:else if data.type === 'sales'}
    <!-- Sales Report -->
    <div class="bg-white rounded-lg shadow dark:bg-gray-800">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Sales Report</h3>
      </div>
      
      {#if data.data?.sales?.length}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Invoice</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Customer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Staff</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {#each data.data.sales as sale}
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #{sale.invoiceNumber}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {#if sale.customer}
                      {$locale === 'ar' ? sale.customer.nameAr : sale.customer.nameEn}
                    {:else}
                      Walk-in Customer
                    {/if}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(sale.createdAt)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(sale.netAmount)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {sale.user.name}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <div class="p-6 text-center text-gray-500 dark:text-gray-400">
          No sales data found for the selected period.
        </div>
      {/if}
    </div>

  {:else}
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800 text-center">
      <FileText class="mx-auto h-12 w-12 text-gray-300 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Report Not Available</h3>
      <p class="text-gray-500 dark:text-gray-400">This report type is not yet implemented.</p>
    </div>
  {/if}
</div>