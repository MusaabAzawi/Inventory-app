<!-- src/routes/(app)/sales/[id]/return/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { enhance } from '$app/forms';
  import { notifications } from '$lib/stores/notifications';
  import {
    ArrowLeft,
    RotateCcw,
    AlertTriangle,
    Package,
    Calculator,
    Save
  } from 'lucide-svelte';
  import { displayAmount } from '$lib/utils/currencyHelper';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  let isSubmitting = false;
  let reason = '';

  // Return items - track which items and quantities to return
  let returnItems: Array<{
    saleItemId: string;
    productId: string;
    quantity: number;
    maxQuantity: number;
    price: number;
    product: any;
    selected: boolean;
  }> = data.sale.items.map(item => {
    // Calculate how much has already been returned for this sale item
    const alreadyReturnedQuantity = (item.returns || []).reduce((sum, ret) => sum + ret.quantity, 0);
    const maxQuantity = item.quantity - alreadyReturnedQuantity;

    return {
      saleItemId: item.id,
      productId: item.product.id,
      quantity: 0,
      maxQuantity,
      price: item.price,
      product: item.product,
      selected: false
    };
  }).filter(item => item.maxQuantity > 0); // Only show items that can still be returned

  // Computed values
  $: selectedItems = returnItems.filter(item => item.selected && item.quantity > 0);
  $: totalReturnAmount = selectedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  function toggleItemSelection(index: number) {
    returnItems[index].selected = !returnItems[index].selected;
    if (returnItems[index].selected && returnItems[index].quantity === 0) {
      returnItems[index].quantity = 1;
    } else if (!returnItems[index].selected) {
      returnItems[index].quantity = 0;
    }
    returnItems = returnItems; // Trigger reactivity
  }

  function updateQuantity(index: number, quantity: number) {
    returnItems[index].quantity = Math.max(0, Math.min(quantity, returnItems[index].maxQuantity));
    returnItems[index].selected = returnItems[index].quantity > 0;
    returnItems = returnItems; // Trigger reactivity
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

  function handleSubmit() {
    return async ({ result, update }) => {
      isSubmitting = false;

      console.log('Return form submission result:', result);

      if (result.type === 'redirect') {
        // Store success message in sessionStorage to show after redirect
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('return_success', JSON.stringify({
            title: $_('sales.returnProcessed'),
            message: $_('sales.returnProcessedMessage')
          }));
        }
        // Let SvelteKit handle the redirect
        return;
      } else if (result.type === 'failure') {
        const errorMessage = result.data?.error || $_('sales.failedToProcessReturn');
        console.error('Return processing failed:', errorMessage);
        notifications.error($_('sales.returnFailed'), errorMessage);
        await update();
      } else if (result.type === 'error') {
        console.error('Return processing error:', result);
        notifications.error($_('sales.returnFailed'), $_('sales.failedToProcessReturn'));
        await update();
      }
    };
  }

  function validateForm() {
    if (!reason.trim()) {
      notifications.error($_('sales.validationError'), $_('sales.returnReasonRequired'));
      return false;
    }

    if (selectedItems.length === 0) {
      notifications.error($_('sales.validationError'), $_('sales.selectItemsToReturn'));
      return false;
    }

    return true;
  }
</script>

<div class="space-y-6" dir={$locale === 'ar' ? 'rtl' : 'ltr'}>
  <!-- Header -->
  <div class="flex items-center gap-4">
    <a href="/sales/{data.sale.id}" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
      <ArrowLeft class="w-6 h-6 {$locale === 'ar' ? 'rotate-180' : ''}" />
    </a>
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {$_('sales.processReturn')} #{data.sale.invoiceNumber}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        {$_('sales.processReturnSubtitle')}
      </p>
    </div>
  </div>

  <!-- Sale Info -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
          {$_('sales.originalSale')}
        </h3>
        <p class="text-sm text-blue-600 dark:text-blue-300 mt-1">
          {$_('sales.date')}: {formatDate(data.sale.createdAt)}
        </p>
        <p class="text-sm text-blue-600 dark:text-blue-300">
          {$_('sales.customer')}: {data.sale.customer ? ($locale === 'ar' ? data.sale.customer.nameAr : data.sale.customer.nameEn) : $_('sales.walkInCustomer')}
        </p>
      </div>
      <div class="text-right">
        <p class="text-sm text-blue-600 dark:text-blue-300">{$_('sales.originalAmount')}</p>
        <p class="text-lg font-semibold text-blue-800 dark:text-blue-200">
          {displayAmount(data.sale.netAmount)}
        </p>
      </div>
    </div>
  </div>

  <!-- Previous Returns -->
  {#if data.sale.returns && data.sale.returns.length > 0}
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
      <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
        {$_('sales.previousReturns')}
      </h3>
      <div class="space-y-2">
        {#each data.sale.returns as returnRecord}
          <div class="flex justify-between text-sm">
            <span class="text-yellow-700 dark:text-yellow-300">
              {formatDate(returnRecord.createdAt)} - {returnRecord.reason}
            </span>
            <span class="font-medium text-yellow-800 dark:text-yellow-200">
              {displayAmount(returnRecord.amount)}
            </span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if returnItems.length === 0}
    <!-- No items available for return -->
    <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 dark:bg-gray-800 dark:border-gray-700">
      <div class="text-center">
        <Package class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {$_('sales.noItemsAvailableForReturn')}
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          {$_('sales.allItemsAlreadyReturned')}
        </p>
      </div>
    </div>
  {:else}
    <form
      method="POST"
      use:enhance={handleSubmit}
      on:submit={(e) => {
        if (!validateForm()) {
          e.preventDefault();
          return false;
        }
        isSubmitting = true;
        return true;
      }}
      class="space-y-6"
    >
      {#if form?.error}
        <div class="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {form.error}
        </div>
      {/if}

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Return Items -->
        <div class="lg:col-span-2 space-y-6">
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {$_('sales.selectItemsToReturn')}
            </h2>

            <div class="space-y-4">
              {#each returnItems as item, index}
                <div class="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                  <div class="flex items-start gap-4">
                    <!-- Selection checkbox -->
                    <div class="flex items-center h-5">
                      <input
                        id="item-{index}"
                        type="checkbox"
                        checked={item.selected}
                        on:change={() => toggleItemSelection(index)}
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <!-- Product Info -->
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <Package class="h-4 w-4 text-gray-400" />
                        <h3 class="font-medium text-gray-900 dark:text-white">
                          {$locale === 'ar' ? item.product.nameAr : item.product.nameEn}
                        </h3>
                      </div>

                      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span class="font-medium">{$_('sales.sku')}:</span>
                          {item.product.sku}
                        </div>
                        <div>
                          <span class="font-medium">{$_('sales.availableForReturn')}:</span>
                          {item.maxQuantity}
                        </div>
                        <div>
                          <span class="font-medium">{$_('sales.price')}:</span>
                          {displayAmount(item.price)}
                        </div>
                        <div>
                          <span class="font-medium">{$_('sales.maxRefund')}:</span>
                          {displayAmount(item.price * item.maxQuantity)}
                        </div>
                      </div>
                    </div>

                    <!-- Return Quantity -->
                    <div class="w-32">
                      <label for="quantity-{index}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {$_('sales.returnQty')}
                      </label>
                      <input
                        id="quantity-{index}"
                        type="number"
                        min="0"
                        max={item.maxQuantity}
                        value={item.quantity}
                        on:input={(e) => updateQuantity(index, parseInt((e.target as HTMLInputElement).value) || 0)}
                        disabled={!item.selected}
                        class="input text-sm"
                      />
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Return Summary -->
        <div class="space-y-6">
          <!-- Return Details -->
          <div class="card p-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Calculator class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
              {$_('sales.returnSummary')}
            </h3>

            <div class="space-y-4">
              <!-- Items Count -->
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">{$_('sales.itemsToReturn')}</span>
                <span class="font-semibold">{selectedItems.length}</span>
              </div>

              <!-- Total Quantity -->
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">{$_('sales.totalQuantity')}</span>
                <span class="font-semibold">{selectedItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>

              <!-- Total Return Amount -->
              <div class="flex justify-between text-lg font-semibold border-t pt-4 dark:border-gray-700">
                <span>{$_('sales.totalReturnAmount')}</span>
                <span class="text-red-600">{displayAmount(totalReturnAmount)}</span>
              </div>

              <!-- Return Reason -->
              <div>
                <label for="reason" class="label">{$_('sales.returnReason')} *</label>
                <select
                  id="reason"
                  bind:value={reason}
                  class="input"
                  required
                >
                  <option value="">{$_('sales.selectReturnReason')}</option>
                  <option value="defective">{$_('sales.defective')}</option>
                  <option value="wrong_item">{$_('sales.wrongItem')}</option>
                  <option value="customer_request">{$_('sales.customerRequest')}</option>
                  <option value="damaged">{$_('sales.damaged')}</option>
                  <option value="expired">{$_('sales.expired')}</option>
                  <option value="other">{$_('sales.other')}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Warning -->
          <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 dark:bg-orange-900/20 dark:border-orange-800">
            <div class="flex">
              <AlertTriangle class="h-5 w-5 text-orange-400 ltr:mr-2 rtl:ml-2 flex-shrink-0" />
              <div>
                <h3 class="text-sm font-medium text-orange-800 dark:text-orange-200">
                  {$_('sales.returnWarningTitle')}
                </h3>
                <p class="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  {$_('sales.returnWarningMessage')}
                </p>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-danger btn-lg w-full"
            disabled={isSubmitting || selectedItems.length === 0 || !reason}
          >
            {#if isSubmitting}
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-current ltr:mr-2 rtl:ml-2"></div>
            {:else}
              <RotateCcw class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            {/if}
            {isSubmitting ? $_('sales.processingReturn') : $_('sales.processReturn')}
          </button>
        </div>
      </div>

      <!-- Hidden fields for form submission -->
      <input type="hidden" name="reason" value={reason} />
      <input type="hidden" name="returnItems" value={JSON.stringify(selectedItems.map(item => ({
        saleItemId: item.saleItemId,
        quantity: item.quantity
      })))} />
    </form>
  {/if}
</div>