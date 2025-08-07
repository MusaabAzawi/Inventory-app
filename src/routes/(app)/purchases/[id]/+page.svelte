<!-- src/routes/(app)/purchases/[id]/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { 
    ArrowLeft, 
    Edit, 
    Printer, 
    Calendar, 
    Truck, 
    Package,
    DollarSign,
    User,
    CheckCircle
  } from 'lucide-svelte';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  $: purchase = data.purchase;

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat($locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString($locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
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

  function printPurchaseOrder() {
    window.print();
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <a href="/purchases" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
        <ArrowLeft class="w-6 h-6" />
      </a>
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Purchase Order #{purchase.invoiceNumber}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Created on {formatDate(purchase.createdAt)}
        </p>
      </div>
    </div>
    
    <div class="flex gap-2">
      <button
        on:click={printPurchaseOrder}
        class="btn-secondary btn-md"
      >
        <Printer class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        Print
      </button>
      <a href="/purchases/{purchase.id}/edit" class="btn-primary btn-md">
        <Edit class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        Edit
      </a>
    </div>
  </div>

  <!-- Purchase Overview -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Purchase Info -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Status and Basic Info -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Purchase Information
          </h2>
          <span class="px-3 py-1 text-sm font-medium rounded-full {getStatusColor(purchase.status)}">
            {purchase.status}
          </span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="flex items-center">
              <Calendar class="h-5 w-5 text-gray-400 ltr:mr-3 rtl:ml-3" />
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Purchase Date</p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {formatDate(purchase.purchaseDate)}
                </p>
              </div>
            </div>
            
            <div class="flex items-center">
              <User class="h-5 w-5 text-gray-400 ltr:mr-3 rtl:ml-3" />
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Ordered By</p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {purchase.user.name}
                </p>
              </div>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-center">
              <DollarSign class="h-5 w-5 text-gray-400 ltr:mr-3 rtl:ml-3" />
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                <p class="font-semibold text-xl text-blue-600 dark:text-blue-400">
                  {formatCurrency(purchase.netAmount)}
                </p>
              </div>
            </div>
            
            <div class="flex items-center">
              <Package class="h-5 w-5 text-gray-400 ltr:mr-3 rtl:ml-3" />
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Items</p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {purchase.items.length} items
                </p>
              </div>
            </div>
          </div>
        </div>

        {#if purchase.notes}
          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Notes</p>
            <p class="text-gray-900 dark:text-white">{purchase.notes}</p>
          </div>
        {/if}
      </div>

      <!-- Purchase Items -->
      <div class="card">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Purchase Items
          </h3>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Product
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Quantity
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Unit Price
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Total
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {#each purchase.items as item}
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {$locale === 'ar' ? item.product.nameAr : item.product.nameEn}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        SKU: {item.product.sku}
                      </p>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.quantity}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(item.price)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Supplier Info & Summary -->
    <div class="space-y-6">
      <!-- Supplier Information -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Truck class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
          Supplier
        </h3>
        
        {#if purchase.supplier}
          <div class="space-y-3">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {$locale === 'ar' ? purchase.supplier.nameAr : purchase.supplier.nameEn}
              </p>
            </div>
            
            {#if purchase.supplier.phone}
              <div class="flex items-center text-sm">
                <span class="text-gray-600 dark:text-gray-400">Phone:</span>
                <span class="ltr:ml-2 rtl:mr-2 text-gray-900 dark:text-white">
                  {purchase.supplier.phone}
                </span>
              </div>
            {/if}
            
            {#if purchase.supplier.email}
              <div class="flex items-center text-sm">
                <span class="text-gray-600 dark:text-gray-400">Email:</span>
                <span class="ltr:ml-2 rtl:mr-2 text-gray-900 dark:text-white">
                  {purchase.supplier.email}
                </span>
              </div>
            {/if}
            
            {#if purchase.supplier.address}
              <div class="text-sm">
                <p class="text-gray-600 dark:text-gray-400">Address:</p>
                <p class="text-gray-900 dark:text-white mt-1">
                  {purchase.supplier.address}
                </p>
              </div>
            {/if}
          </div>
        {:else}
          <p class="text-gray-500 dark:text-gray-400 italic">
            No supplier assigned
          </p>
        {/if}
      </div>

      <!-- Purchase Summary -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Order Summary
        </h3>
        
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {formatCurrency(purchase.totalAmount)}
            </span>
          </div>
          
          {#if purchase.discount > 0}
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Discount:</span>
              <span class="font-medium text-red-600 dark:text-red-400">
                -{formatCurrency(purchase.discount)}
              </span>
            </div>
          {/if}
          
          {#if purchase.tax > 0}
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Tax:</span>
              <span class="font-medium text-gray-900 dark:text-white">
                +{formatCurrency(purchase.tax)}
              </span>
            </div>
          {/if}
          
          <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div class="flex justify-between items-center">
              <span class="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
              <span class="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(purchase.netAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        
        <div class="space-y-3">
          <a href="/purchases/{purchase.id}/edit" class="btn-secondary btn-md w-full">
            <Edit class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            Edit Purchase Order
          </a>
          
          {#if purchase.status === 'PENDING'}
            <button class="btn-primary btn-md w-full">
              <CheckCircle class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              Mark as Received
            </button>
          {/if}
          
          <button 
            on:click={printPurchaseOrder}
            class="btn-secondary btn-md w-full"
          >
            <Printer class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            Print Order
          </button>
        </div>
      </div>
    </div>
  </div>
</div>