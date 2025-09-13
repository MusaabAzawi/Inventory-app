<!-- src/routes/(app)/reports/+page.svelte -->
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
    Filter,
    UserCheck
  } from 'lucide-svelte';
  import type { PageData } from './$types';
  
  export let data: PageData;

  let reportType = $page.url.searchParams.get('type') || 'overview';
  let startDate = $page.url.searchParams.get('startDate') || '';
  let endDate = $page.url.searchParams.get('endDate') || '';

  $: reportTypes = [
    { id: 'overview', label: $_('reports.overviewReport'), icon: TrendingUp },
    { id: 'sales', label: $_('reports.salesReport'), icon: ShoppingCart },
    { id: 'inventory', label: $_('reports.inventoryReport'), icon: Package },
    { id: 'products', label: $_('reports.productsReport'), icon: FileText },
    { id: 'employees', label: $_('reports.employeesReport'), icon: UserCheck }
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
    alert($_('reports.exportFunctionality'));
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
        {$_('reports.subtitle')}
      </p>
    </div>
    
    <div class="flex gap-2">
      <button
        on:click={exportReport}
        class="btn-secondary btn-md"
      >
        <Download class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
{$_('reports.export')}
      </button>
    </div>
  </div>

  <!-- Report Controls -->
  <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {$_('reports.reportSettings')}
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Report Type -->
      <div>
        <label for="report-type-select" class="label">{$_('reports.reportType')}</label>
        <select id="report-type-select" bind:value={reportType} class="input">
          {#each reportTypes as type}
            <option value={type.id}>{type.label}</option>
          {/each}
        </select>
      </div>

      <!-- Start Date -->
      <div>
        <label for="start-date-input" class="label">{$_('reports.startDate')}</label>
        <input id="start-date-input" type="date" bind:value={startDate} class="input" />
      </div>

      <!-- End Date -->
      <div>
        <label for="end-date-input" class="label">{$_('reports.endDate')}</label>
        <input id="end-date-input" type="date" bind:value={endDate} class="input" />
      </div>

      <!-- Generate Button -->
      <div class="flex items-end">
        <button
          on:click={generateReport}
          class="btn-primary btn-md w-full"
          aria-describedby="generate-report-description"
        >
          <Filter class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
{$_('reports.generateReport')}
        </button>
      </div>
    </div>
    
    <p id="generate-report-description" class="sr-only">
      {$_('reports.generateReportDescription')}
    </p>
  </div>

  <!-- Report Content -->
  {#if data.type === 'overview'}
    <!-- Overview Report -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Sales Summary -->
      <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{$_('reports.salesSummary')}</h3>
          <ShoppingCart class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">{$_('reports.totalSales')}:</span>
            <span class="font-semibold">{data.data?.sales?._count || 0}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">{$_('reports.revenue')}:</span>
            <span class="font-semibold">{formatCurrency(data.data?.sales?._sum?.netAmount || 0)}</span>
          </div>
        </div>
      </div>

      <!-- Inventory Summary -->
      <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{$_('reports.inventorySummary')}</h3>
          <Package class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">{$_('reports.totalProducts')}:</span>
            <span class="font-semibold">{data.data?.inventory?._count || 0}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">{$_('reports.totalStock')}:</span>
            <span class="font-semibold">{data.data?.inventory?._sum?.quantity || 0}</span>
          </div>
        </div>
      </div>

      <!-- Performance -->
      <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{$_('reports.performance')}</h3>
          <TrendingUp class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">{$_('reports.avgSaleValue')}:</span>
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
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{$_('reports.topSellingProducts')}</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" role="table">
            <thead>
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{$_('reports.product')}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{$_('reports.quantitySold')}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{$_('reports.revenue')}</th>
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
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{$_('reports.salesReport')}</h3>
      </div>
      
      {#if data.data?.sales?.length}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" role="table">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{$_('reports.invoice')}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{$_('reports.customer')}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{$_('common.date')}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{$_('sales.amount')}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{$_('reports.staff')}</th>
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
                      {$_('reports.walkInCustomer')}
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
          {$_('reports.noSalesDataFound')}
        </div>
      {/if}
    </div>

  {:else if data.type === 'employees'}
    <!-- Employee Report -->
    <div class="bg-white rounded-lg shadow dark:bg-gray-800">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{$_('reports.employeeReport')}</h3>
      </div>
      
      {#if data.data?.employees?.length}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" role="table">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{$_('reports.name')}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{$_('reports.position')}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{$_('auth.email')}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{$_('reports.phone')}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{$_('reports.salary')}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{$_('common.status')}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{$_('reports.hireDate')}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {#each data.data.employees as employee}
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">
                        {$locale === 'ar' ? employee.nameAr : employee.nameEn}
                      </p>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {employee.position || '-'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {employee.email || '-'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {employee.phone || '-'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {#if employee.salary}
                      {new Intl.NumberFormat('ar-IQ', {
                        style: 'decimal',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(employee.salary)} د.ع
                    {:else}
                      -
                    {/if}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {employee.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}">
                      {employee.isActive ? $_('employees.active') : $_('employees.inactive')}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(employee.hireDate)}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        
        <!-- Employee Summary -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-600 dark:text-gray-300">{$_('reports.totalEmployees')}:</span>
              <span class="font-semibold text-gray-900 dark:text-white ml-2">{data.data.employees.length}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-300">{$_('reports.activeEmployees')}:</span>
              <span class="font-semibold text-green-600 dark:text-green-400 ml-2">{data.data.employees.filter(e => e.isActive).length}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-300">{$_('reports.totalMonthlyPayroll')}:</span>
              <span class="font-semibold text-gray-900 dark:text-white ml-2">
                {new Intl.NumberFormat('ar-IQ', {
                  style: 'decimal',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(data.data.employees.filter(e => e.isActive && e.salary).reduce((sum, e) => sum + (e.salary || 0), 0))} د.ع
              </span>
            </div>
          </div>
        </div>
      {:else}
        <div class="p-6 text-center text-gray-500 dark:text-gray-400">
          {$_('reports.noEmployeeDataFound')}
        </div>
      {/if}
    </div>

  {:else}
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800 text-center">
      <FileText class="mx-auto h-12 w-12 text-gray-300 mb-4" aria-hidden="true" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">{$_('reports.reportNotAvailable')}</h3>
      <p class="text-gray-500 dark:text-gray-400">{$_('reports.reportNotImplemented')}</p>
    </div>
  {/if}
</div>