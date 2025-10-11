<!-- src/routes/(app)/sales/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import {
    Plus,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    Eye,
    Edit,
    RotateCcw,
    Calendar
  } from 'lucide-svelte';
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import { displayAmountFrom } from '$lib/utils/currencyHelper';
  import type { PageData } from './$types';
  
  export let data: PageData;

  $: columns = [
    { key: 'invoiceNumber', label: $_('sales.invoiceNumber'), sortable: true },
    { key: 'customer', label: $_('sales.customer'), sortable: false },
    { key: 'netAmount', label: $_('sales.amount'), sortable: true },
    { key: 'paymentMethod', label: $_('sales.payment'), sortable: true },
    { key: 'createdAt', label: $_('sales.date'), sortable: true },
    { key: 'user.name', label: $_('sales.staff'), sortable: true }
  ];


  function formatDate(date: string) {
    return new Date(date).toLocaleDateString($locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getPaymentMethodColor(method: string) {
    switch (method.toUpperCase()) {
      case 'CASH':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CREDIT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'CARD':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {$_('modules.sales.title')}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        {$_('sales.subtitle')}
      </p>
    </div>
    
    <div class="flex gap-2">
      <a href="/sales/new" class="btn-primary btn-md">
        <Plus class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        {$_('modules.sales.newSale')}
      </a>
    </div>
  </div>

  <!-- Stats Cards -->
  {#if data.stats}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Today's Sales -->
      <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-500 text-white">
            <DollarSign class="h-6 w-6" />
          </div>
          <div class="ltr:ml-4 rtl:mr-4 flex-1">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
              {$_('sales.todaysSales')}
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {displayAmountFrom(data.stats.today.amount, 'USD')}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {$_('sales.transactions', { values: { count: data.stats.today.count } })}
            </p>
          </div>
        </div>
      </div>

      <!-- This Month -->
      <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-500 text-white">
            <TrendingUp class="h-6 w-6" />
          </div>
          <div class="ltr:ml-4 rtl:mr-4 flex-1">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
              {$_('sales.thisMonth')}
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {displayAmountFrom(data.stats.thisMonth.amount, 'USD')}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {$_('sales.transactions', { values: { count: data.stats.thisMonth.count } })}
            </p>
          </div>
        </div>
      </div>

      <!-- Total Sales -->
      <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-500 text-white">
            <ShoppingCart class="h-6 w-6" />
          </div>
          <div class="ltr:ml-4 rtl:mr-4 flex-1">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
              {$_('sales.totalSales')}
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {displayAmountFrom(data.stats.total.amount, 'USD')}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {$_('sales.transactions', { values: { count: data.stats.total.count } })}
            </p>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Sales Table -->
  <div class="card">
    <DataTable data={data.sales} {columns}>
      <svelte:fragment slot="row" let:item>
        <!-- Invoice Number -->
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
          #{item.invoiceNumber}
        </td>
        
        <!-- Customer -->
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          {#if item.customer}
            <div>
              <p class="font-medium">
                {$locale === 'ar' ? item.customer.nameAr : item.customer.nameEn}
              </p>
              {#if item.customer.phone}
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {item.customer.phone}
                </p>
              {/if}
            </div>
          {:else}
            <span class="text-gray-500 italic">{$_('sales.walkInCustomer')}</span>
          {/if}
        </td>

        <!-- Amount -->
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          <div>
            <p class="font-semibold text-green-600 dark:text-green-400">
              {displayAmountFrom(item.netAmount, item.currency || 'USD')}
            </p>
            {#if item.discount > 0}
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {$_('sales.discount', { values: { amount: displayAmountFrom(item.discount, item.currency || 'USD') } })}
              </p>
            {/if}
          </div>
        </td>

        <!-- Payment Method -->
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <span class="px-2 py-1 text-xs font-medium rounded-full {getPaymentMethodColor(item.paymentMethod)}">
            {item.paymentMethod === 'CASH' ? $_('sales.cash') : item.paymentMethod === 'CREDIT' ? $_('sales.credit') : item.paymentMethod === 'CARD' ? $_('sales.card') : item.paymentMethod}
          </span>
        </td>

        <!-- Date -->
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center">
            <Calendar class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {formatDate(item.createdAt)}
          </div>
        </td>

        <!-- Staff -->
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          {item.user.name}
        </td>
      </svelte:fragment>

      <!-- Actions -->
      <svelte:fragment slot="actions" let:item>
        <div class="flex justify-end gap-2">
          <a 
            href="/sales/{item.id}" 
            class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
            title={$_('sales.viewDetails')}
          >
            <Eye class="h-4 w-4" />
          </a>
          <a 
            href="/sales/{item.id}/edit" 
            class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
            title={$_('sales.editSale')}
          >
            <Edit class="h-4 w-4" />
          </a>
          <a 
            href="/sales/{item.id}/return" 
            class="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
            title={$_('sales.processReturn')}
          >
            <RotateCcw class="h-4 w-4" />
          </a>
        </div>
      </svelte:fragment>
    </DataTable>
  </div>

  <!-- Quick Actions -->
  <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {$_('sales.quickActions')}
    </h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <a href="/sales/new" class="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors dark:bg-green-900 dark:hover:bg-green-800">
        <Plus class="h-8 w-8 text-green-600 mb-2" />
        <span class="text-sm font-medium text-green-900 dark:text-green-100">{$_('sales.newSale')}</span>
      </a>
      
      <a href="/sales/returns" class="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors dark:bg-orange-900 dark:hover:bg-orange-800">
        <RotateCcw class="h-8 w-8 text-orange-600 mb-2" />
        <span class="text-sm font-medium text-orange-900 dark:text-orange-100">{$_('sales.processReturns')}</span>
      </a>
      
      <a href="/customers" class="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors dark:bg-blue-900 dark:hover:bg-blue-800">
        <ShoppingCart class="h-8 w-8 text-blue-600 mb-2" />
        <span class="text-sm font-medium text-blue-900 dark:text-blue-100">{$_('sales.viewCustomers')}</span>
      </a>
      
      <a href="/reports?type=sales" class="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors dark:bg-purple-900 dark:hover:bg-purple-800">
        <TrendingUp class="h-8 w-8 text-purple-600 mb-2" />
        <span class="text-sm font-medium text-purple-900 dark:text-purple-100">{$_('sales.salesReports')}</span>
      </a>
    </div>
  </div>
</div>