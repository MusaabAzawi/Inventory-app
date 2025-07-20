<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { 
    Plus, 
    Search, 
    Calendar, 
    DollarSign, 
    ShoppingCart,
    Eye,
    Trash2,
    FileText,
    Filter
  } from 'lucide-svelte';
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
  import { enhance } from '$app/forms';
  import { notifications } from '$lib/stores/notifications';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  let showDeleteDialog = false;
  let saleToDelete: any = null;
  let searchQuery = data.filters.search;
  let dateFilter = data.filters.dateFilter;
  let customerId = data.filters.customerId;

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'createdAt', label: 'Date', sortable: true },
    { key: 'netAmount', label: 'Amount', sortable: true },
    { key: 'paymentStatus', label: 'Status', sortable: true }
  ];

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat($locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString($locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function applyFilters() {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (dateFilter) params.set('dateFilter', dateFilter);
    if (customerId) params.set('customer', customerId);
    
    goto(`/sales?${params.toString()}`);
  }

  function confirmDelete(sale: any) {
    saleToDelete = sale;
    showDeleteDialog = true;
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-50';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50';
      case 'CANCELLED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
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
    </div>
    
    <a href="/sales/new" class="btn-primary btn-md">
      <Plus class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
      {$_('modules.sales.newSale')}
    </a>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-blue-500 text-white">
          <ShoppingCart class="h-6 w-6" />
        </div>
        <div class="ltr:ml-4 rtl:mr-4">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            Total Sales
          </p>
          <p class="text-xl font-semibold text-gray-900 dark:text-white">
            {data.stats.totalSales}
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-green-500 text-white">
          <DollarSign class="h-6 w-6" />
        </div>
        <div class="ltr:ml-4 rtl:mr-4">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            Total Revenue
          </p>
          <p class="text-xl font-semibold text-gray-900 dark:text-white">
            {formatCurrency(data.stats.totalRevenue)}
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-yellow-500 text-white">
          <FileText class="h-6 w-6" />
        </div>
        <div class="ltr:ml-4 rtl:mr-4">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            Total Discount
          </p>
          <p class="text-xl font-semibold text-gray-900 dark:text-white">
            {formatCurrency(data.stats.totalDiscount)}
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Filters -->
  <div class="card p-4">
    <div class="flex flex-col sm:flex-row gap-4">
      <!-- Search -->
      <div class="flex-1 relative">
        <Search class="absolute ltr:left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          bind:value={searchQuery}
          on:keyup={(e) => e.key === 'Enter' && applyFilters()}
          placeholder="Search by invoice or customer..."
          class="input ltr:pl-10 rtl:pr-10"
        />
      </div>

      <!-- Date Filter -->
      <select 
        bind:value={dateFilter}
        on:change={applyFilters}
        class="input w-full sm:w-48"
      >
        <option value="today">Today</option>
        <option value="week">Last 7 Days</option>
        <option value="month">Last 30 Days</option>
        <option value="all">All Time</option>
      </select>

      <!-- Customer Filter -->
      <select 
        bind:value={customerId}
        on:change={applyFilters}
        class="input w-full sm:w-48"
      >
        <option value="">All Customers</option>
        {#each data.customers as customer}
          <option value={customer.id}>
            {$locale === 'ar' ? customer.nameAr : customer.nameEn}
          </option>
        {/each}
      </select>

      <button 
        on:click={applyFilters}
        class="btn-primary btn-md"
      >
        <Filter class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        Apply
      </button>
    </div>
  </div>

  <!-- Sales Table -->
  <div class="card">
    <DataTable data={data.sales} {columns} searchable={false}>
      <svelte:fragment slot="row" let:item>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
          {item.invoiceNumber}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          {#if item.customer}
            <div>
              <p class="font-medium">
                {$locale === 'ar' ? item.customer.nameAr : item.customer.nameEn}
              </p>
              {#if item.customer.phone}
                <p class="text-xs text-gray-500">{item.customer.phone}</p>
              {/if}
            </div>
          {:else}
            <span class="text-gray-500">Walk-in Customer</span>
          {/if}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          {formatDate(item.createdAt)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
          {formatCurrency(item.netAmount)}
          {#if item.discount > 0}
            <p class="text-xs text-gray-500">
              Discount: {formatCurrency(item.discount)}
            </p>
          {/if}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusColor(item.paymentStatus)}">
            {item.paymentStatus}
          </span>
        </td>
      </svelte:fragment>

      <div slot="actions" let:item class="flex gap-2">
        <a 
          href="/sales/{item.id}" 
          class="text-blue-600 hover:text-blue-900"
          title="View Details"
        >
          <Eye class="h-4 w-4" />
        </a>
        <button
          on:click={() => confirmDelete(item)}
          class="text-red-600 hover:text-red-900"
          title="Delete Sale"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
    </DataTable>
  </div>
</div>

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
  bind:open={showDeleteDialog}
  title="Delete Sale"
  message="Are you sure you want to delete sale #{saleToDelete?.invoiceNumber}? This will restore the product quantities."
  type="danger"
  on:confirm={() => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '?/delete';
    
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'id';
    input.value = saleToDelete.id;
    
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  }}
/>