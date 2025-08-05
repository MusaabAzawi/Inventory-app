<!-- src/routes/(app)/purchases/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { 
    Plus, 
    ShoppingBag, 
    DollarSign, 
    TrendingDown, 
    Eye, 
    Edit, 
    Truck,
    Calendar,
    Package
  } from 'lucide-svelte';
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import type { PageData } from './$types';
  
  export let data: PageData;

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #', sortable: true },
    { key: 'supplier', label: 'Supplier', sortable: false },
    { key: 'netAmount', label: 'Amount', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'purchaseDate', label: 'Date', sortable: true },
    { key: 'user.name', label: 'Ordered By', sortable: true }
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

  function getStatusColor(status: string) {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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
        {$_('modules.purchases.title')}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        Manage purchase orders and supplier relationships
      </p>
    </div>
    
    <div class="flex gap-2">
      <a href="/purchases/new" class="btn-primary btn-md">
        <Plus class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        {$_('modules.purchases.newPurchase')}
      </a>
    </div>
  </div>

  <!-- Stats Cards -->
  {#if data.stats}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Today's Purchases -->
      <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-500 text-white">
            <ShoppingBag class="h-6 w-6" />
          </div>
          <div class="ltr:ml-4 rtl:mr-4 flex-1">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
              Today's Purchases
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {formatCurrency(data.stats.today.amount)}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {data.stats.today.count} orders
            </p>
          </div>
        </div>
      </div>

      <!-- This Month -->
      <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-orange-500 text-white">
            <TrendingDown class="h-6 w-6" />
          </div>
          <div class="ltr:ml-4 rtl:mr-4 flex-1">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
              This Month
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {formatCurrency(data.stats.thisMonth.amount)}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {data.stats.thisMonth.count} orders
            </p>
          </div>
        </div>
      </div>

      <!-- Total Purchases -->
      <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-500 text-white">
            <DollarSign class="h-6 w-6" />
          </div>
          <div class="ltr:ml-4 rtl:mr-4 flex-1">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Purchases
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {formatCurrency(data.stats.total.amount)}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {data.stats.total.count} orders
            </p>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Purchases Table -->
  <div class="card">
    <DataTable data={data.purchases} {columns}>
      <svelte:fragment slot="row" let:item>
        <!-- Invoice Number -->
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
          #{item.invoiceNumber}
        </td>
        
        <!-- Supplier -->
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          {#if item.supplier}
            <div class="flex items-center">
              <Truck class="h-4 w-4 text-gray-400 ltr:mr-2 rtl:ml-2" />
              <div>
                <p class="font-medium">
                  {$locale === 'ar' ? item.supplier.nameAr : item.supplier.nameEn}
                </p>
                {#if item.supplier.phone}
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {item.supplier.phone}
                  </p>
                {/if}
              </div>
            </div>
          {:else}
            <span class="text-gray-500 italic">No supplier</span>
          {/if}
        </td>

        <!-- Amount -->
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          <div>
            <p class="font-semibold text-blue-600 dark:text-blue-400">
              {formatCurrency(item.netAmount)}
            </p>
            {#if item.discount > 0}
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Discount: {formatCurrency(item.discount)}
              </p>
            {/if}
          </div>
        </td>

        <!-- Status -->
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <span class="px-2 py-1 text-xs font-medium rounded-full {getStatusColor(item.status)}">
            {item.status}
          </span>
        </td>

        <!-- Date -->
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center">
            <Calendar class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {formatDate(item.purchaseDate)}
          </div>
        </td>

        <!-- Ordered By -->
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          {item.user.name}
        </td>
      </svelte:fragment>

      <!-- Actions -->
      <svelte:fragment slot="actions" let:item>
        <div class="flex justify-end gap-2">
          <a 
            href="/purchases/{item.id}" 
            class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
            title="View details"
          >
            <Eye class="h-4 w-4" />
          </a>
          <a 
            href="/purchases/{item.id}/edit" 
            class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
            title="Edit purchase"
          >
            <Edit class="h-4 w-4" />
          </a>
        </div>
      </svelte:fragment>
    </DataTable>
  </div>

  <!-- Quick Actions -->
  <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      Quick Actions
    </h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <a href="/purchases/new" class="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors dark:bg-blue-900 dark:hover:bg-blue-800">
        <Plus class="h-8 w-8 text-blue-600 mb-2" />
        <span class="text-sm font-medium text-blue-900 dark:text-blue-100">New Purchase</span>
      </a>
      
      <a href="/suppliers" class="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors dark:bg-green-900 dark:hover:bg-green-800">
        <Truck class="h-8 w-8 text-green-600 mb-2" />
        <span class="text-sm font-medium text-green-900 dark:text-green-100">Manage Suppliers</span>
      </a>
      
      <a href="/inventory" class="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors dark:bg-purple-900 dark:hover:bg-purple-800">
        <Package class="h-8 w-8 text-purple-600 mb-2" />
        <span class="text-sm font-medium text-purple-900 dark:text-purple-100">Check Inventory</span>
      </a>
      
      <a href="/reports?type=purchases" class="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors dark:bg-orange-900 dark:hover:bg-orange-800">
        <TrendingDown class="h-8 w-8 text-orange-600 mb-2" />
        <span class="text-sm font-medium text-orange-900 dark:text-orange-100">Purchase Reports</span>
      </a>
    </div>
  </div>
</div>