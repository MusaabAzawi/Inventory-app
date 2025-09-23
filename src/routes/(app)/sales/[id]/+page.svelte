<!-- src/routes/(app)/sales/[id]/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import {
    ArrowLeft,
    Edit,
    RotateCcw,
    Printer,
    Calendar,
    User as UserIcon,
    Package,
    DollarSign,
    CreditCard,
    CheckCircle,
    Clock
  } from 'lucide-svelte';
  import { displayAmount } from '$lib/utils/currencyHelper';
  import type { PageData } from './$types';

  export let data: PageData;

  $: sale = data.sale;

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString($locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getPaymentMethodIcon(method: string) {
    switch (method?.toUpperCase()) {
      case 'CASH':
        return DollarSign;
      case 'CARD':
        return CreditCard;
      case 'CREDIT':
        return Clock;
      default:
        return DollarSign;
    }
  }

  function getPaymentMethodColor(method: string) {
    switch (method?.toUpperCase()) {
      case 'CASH':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CARD':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'CREDIT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  function getPaymentMethodLabel(method: string) {
    switch (method?.toUpperCase()) {
      case 'CASH':
        return $_('sales.cash');
      case 'CARD':
        return $_('sales.card');
      case 'CREDIT':
        return $_('sales.credit');
      default:
        return method;
    }
  }

  // Check if sale is recent enough to edit (within 24 hours)
  $: canEdit = (() => {
    const saleDate = new Date(sale.createdAt);
    const hoursDiff = (Date.now() - saleDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  })();

  // Check if sale can be returned (within 30 days)
  $: canReturn = (() => {
    const saleDate = new Date(sale.createdAt);
    const daysDiff = (Date.now() - saleDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30;
  })();
</script>

<div class="space-y-6" dir={$locale === 'ar' ? 'rtl' : 'ltr'}>
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <a href="/sales" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
        <ArrowLeft class="w-6 h-6 {$locale === 'ar' ? 'rotate-180' : ''}" />
      </a>
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {$_('sales.saleDetails')} #{sale.invoiceNumber}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          {formatDate(sale.createdAt)}
        </p>
      </div>
    </div>

    <div class="flex gap-2">
      {#if canEdit}
        <a href="/sales/{sale.id}/edit" class="btn-secondary btn-sm">
          <Edit class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {$_('sales.editSale')}
        </a>
      {/if}

      {#if canReturn}
        <a href="/sales/{sale.id}/return" class="btn-warning btn-sm">
          <RotateCcw class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {$_('sales.processReturn')}
        </a>
      {/if}

      <button class="btn-secondary btn-sm">
        <Printer class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        {$_('sales.printReceipt')}
      </button>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Sale Information -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Customer Information -->
      <div class="bg-white rounded-lg shadow dark:bg-gray-800">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <UserIcon class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            {$_('sales.customerInformation')}
          </h3>
        </div>
        <div class="p-6">
          {#if sale.customer}
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">{$_('sales.customer')}</label>
                <p class="text-gray-900 dark:text-white">
                  {$locale === 'ar' ? sale.customer.nameAr : sale.customer.nameEn}
                </p>
              </div>
              {#if sale.customer.phone}
                <div>
                  <label class="text-sm font-medium text-gray-500 dark:text-gray-400">{$_('sales.phone')}</label>
                  <p class="text-gray-900 dark:text-white">{sale.customer.phone}</p>
                </div>
              {/if}
              {#if sale.customer.email}
                <div>
                  <label class="text-sm font-medium text-gray-500 dark:text-gray-400">{$_('sales.email')}</label>
                  <p class="text-gray-900 dark:text-white">{sale.customer.email}</p>
                </div>
              {/if}
            </div>
          {:else}
            <p class="text-gray-500 dark:text-gray-400">{$_('sales.walkInCustomer')}</p>
          {/if}
        </div>
      </div>

      <!-- Sale Items -->
      <div class="bg-white rounded-lg shadow dark:bg-gray-800">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Package class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            {$_('sales.saleItems')}
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {$_('sales.product')}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {$_('sales.sku')}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {$_('sales.quantity')}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {$_('sales.price')}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {$_('sales.total')}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {#each sale.items as item}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {$locale === 'ar' ? item.product.nameAr : item.product.nameEn}
                    </div>
                    {#if item.product.category}
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {$locale === 'ar' ? item.product.category.nameAr : item.product.category.nameEn}
                      </div>
                    {/if}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.product.sku}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.quantity}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {displayAmount(item.price)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {displayAmount(item.total)}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Returns History -->
      {#if sale.returns && sale.returns.length > 0}
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <RotateCcw class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
              {$_('sales.returnsHistory')}
            </h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              {#each sale.returns as returnItem}
                <div class="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">
                        {$_('sales.returnReason')}: {returnItem.reason}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(returnItem.createdAt)}
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-medium text-red-600 dark:text-red-400">
                        -{displayAmount(returnItem.amount)}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        {$_('sales.quantity')}: {returnItem.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Sale Summary -->
    <div class="space-y-6">
      <!-- Payment Information -->
      <div class="bg-white rounded-lg shadow dark:bg-gray-800">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {$_('sales.paymentInformation')}
          </h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">{$_('sales.subtotal')}:</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {displayAmount(sale.netAmount + (sale.discount || 0) - (sale.tax || 0))}
            </span>
          </div>

          {#if sale.discount && sale.discount > 0}
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">{$_('sales.discount')}:</span>
              <span class="font-medium text-green-600 dark:text-green-400">
                -{displayAmount(sale.discount)}
              </span>
            </div>
          {/if}

          {#if sale.tax && sale.tax > 0}
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">{$_('sales.tax')}:</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {displayAmount(sale.tax)}
              </span>
            </div>
          {/if}

          <div class="flex justify-between border-t pt-4 dark:border-gray-700">
            <span class="text-lg font-semibold text-gray-900 dark:text-white">{$_('sales.netAmount')}:</span>
            <span class="text-lg font-semibold text-green-600 dark:text-green-400">
              {displayAmount(sale.netAmount)}
            </span>
          </div>

          <div class="mt-4">
            <span class="text-sm text-gray-600 dark:text-gray-400">{$_('sales.paymentMethod')}:</span>
            <div class="mt-1">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getPaymentMethodColor(sale.paymentMethod)}">
                <svelte:component this={getPaymentMethodIcon(sale.paymentMethod)} class="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                {getPaymentMethodLabel(sale.paymentMethod)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sale Details -->
      <div class="bg-white rounded-lg shadow dark:bg-gray-800">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {$_('sales.saleDetails')}
          </h3>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">{$_('sales.invoiceNumber')}</label>
            <p class="text-gray-900 dark:text-white">{sale.invoiceNumber}</p>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">{$_('sales.date')}</label>
            <p class="text-gray-900 dark:text-white">{formatDate(sale.createdAt)}</p>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">{$_('sales.staff')}</label>
            <p class="text-gray-900 dark:text-white">{sale.user.name}</p>
          </div>

          {#if sale.notes}
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">{$_('sales.notes')}</label>
              <p class="text-gray-900 dark:text-white">{sale.notes}</p>
            </div>
          {/if}
        </div>
      </div>

      <!-- Action Notes -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
        <div class="flex items-start">
          <CheckCircle class="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 ltr:mr-2 rtl:ml-2" />
          <div class="text-sm">
            <p class="font-medium text-blue-900 dark:text-blue-100">{$_('sales.actionNotes')}</p>
            <ul class="text-blue-700 dark:text-blue-300 mt-1 space-y-1 list-disc list-inside">
              {#if canEdit}
                <li>{$_('sales.canEditWithin24Hours')}</li>
              {:else}
                <li>{$_('sales.cannotEditAfter24Hours')}</li>
              {/if}
              {#if canReturn}
                <li>{$_('sales.canReturnWithin30Days')}</li>
              {:else}
                <li>{$_('sales.cannotReturnAfter30Days')}</li>
              {/if}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>