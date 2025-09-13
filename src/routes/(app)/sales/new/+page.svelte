<!-- src/routes/(app)/sales/new/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { enhance } from '$app/forms';
  import { notifications } from '$lib/stores/notifications';
  import { 
    ArrowLeft, 
    Plus, 
    Trash2, 
    ShoppingCart, 
    User, 
    Scan,
    Calculator
  } from 'lucide-svelte';
  import BarcodeScanner from '$lib/components/barcode/BarcodeScanner.svelte';
  import type { PageData, ActionData } from './$types';
  
  export let data: PageData;
  export let form: ActionData;
  
  let showBarcodeScanner = false;
  let isSubmitting = false;
  
  // Sale data
  let saleData = {
    customerId: '',
    paymentMethod: 'CASH',
    discount: 0,
    tax: 0,
    notes: ''
  };
  
  // Sale items
  let items: Array<{
    productId: string;
    quantity: number;
    price: number;
    total: number;
    product?: any;
  }> = [];

  // Computed values
  $: subtotal = items.reduce((sum, item) => sum + item.total, 0);
  $: netAmount = subtotal - saleData.discount + saleData.tax;

  function addItem() {
    items = [...items, {
      productId: '',
      quantity: 1,
      price: 0,
      total: 0
    }];
  }

  function removeItem(index: number) {
    items = items.filter((_, i) => i !== index);
  }

  function updateItem(index: number, field: string, value: any) {
    items[index] = { ...items[index], [field]: value };
    
    if (field === 'productId') {
      const product = data.products.find(p => p.id === value);
      if (product) {
        items[index].product = product;
        items[index].price = product.sellingPrice;
        updateItemTotal(index);
      }
    } else if (field === 'quantity' || field === 'price') {
      updateItemTotal(index);
    }
    
    items = items; // Trigger reactivity
  }

  function updateItemTotal(index: number) {
    items[index].total = items[index].quantity * items[index].price;
  }

  function handleBarcodeScanned(barcode: string) {
    showBarcodeScanner = false;
    
    // Find product by barcode
    const product = data.products.find(p => p.barcode === barcode);
    if (product) {
      // Check if item already exists
      const existingIndex = items.findIndex(item => item.productId === product.id);
      
      if (existingIndex >= 0) {
        // Increase quantity
        updateItem(existingIndex, 'quantity', items[existingIndex].quantity + 1);
      } else {
        // Add new item
        items = [...items, {
          productId: product.id,
          quantity: 1,  
          price: product.sellingPrice,
          total: product.sellingPrice,
          product
        }];
      }
      
      notifications.success($_('sales.productAdded'), $_('sales.productAddedMessage', {
        values: { product: $locale === 'ar' ? product.nameAr : product.nameEn }
      }));
    } else {
      notifications.error($_('sales.productNotFound'), $_('sales.noProductWithBarcode', {
        values: { barcode }
      }));
    }
  }

  function handleSubmit() {
    return async ({ result, update }) => {
      isSubmitting = false;
      
      if (result.type === 'success') {
        notifications.success($_('sales.saleCreated'), $_('sales.saleCreatedMessage'));
      } else if (result.type === 'failure') {
        notifications.error($_('sales.saleFailed'), result.data?.error || $_('sales.failedToCreate'));
        // Update the form to show errors
        await update();
      } else if (result.type === 'redirect') {
        notifications.success($_('sales.saleCreated'), $_('sales.saleCreatedMessage'));
        // Redirect will happen automatically
      }
    };
  }

  function validateForm() {
    // Check if we have any items
    if (items.length === 0) {
      notifications.error($_('sales.validationError'), $_('sales.addAtLeastOneItem'));
      return false;
    }
    
    // Check if all items have products selected
    const itemsWithoutProducts = items.filter(item => !item.productId);
    if (itemsWithoutProducts.length > 0) {
      notifications.error($_('sales.validationError'), $_('sales.selectProductForAll'));
      return false;
    }
    
    // Check if all items have valid quantities
    const itemsWithInvalidQty = items.filter(item => !item.quantity || item.quantity <= 0);
    if (itemsWithInvalidQty.length > 0) {
      notifications.error($_('sales.validationError'), $_('sales.enterValidQuantities'));
      return false;
    }
    
    // Check if all items have valid prices
    const itemsWithInvalidPrice = items.filter(item => !item.price || item.price <= 0);
    if (itemsWithInvalidPrice.length > 0) {
      notifications.error($_('sales.validationError'), $_('sales.enterValidPrices'));
      return false;
    }
    
    // Check payment method
    if (!saleData.paymentMethod) {
      notifications.error($_('sales.validationError'), $_('sales.selectPaymentMethod'));
      return false;
    }
    
    // Check stock availability
    for (const item of items) {
      if (item.product && item.product.quantity < item.quantity) {
        notifications.error($_('sales.stockError'), $_('sales.insufficientStock', { 
          values: { 
            product: $locale === 'ar' ? item.product.nameAr : item.product.nameEn,
            available: item.product.quantity,
            requested: item.quantity
          }
        }));
        return false;
      }
    }
    
    return true;
  }

  // Initialize with one empty item
  if (items.length === 0) {
    addItem();
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center gap-4">
    <a href="/sales" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
      <ArrowLeft class="w-6 h-6" />
    </a>
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {$_('modules.sales.newSale')}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        {$_('sales.newSaleSubtitle')}
      </p>
    </div>
  </div>

  <form 
    method="POST" 
    use:enhance={handleSubmit}
    on:submit|preventDefault={() => {
      if (validateForm()) {
        isSubmitting = true;
        // Let the form submit naturally
        return true;
      }
      return false;
    }}
    class="space-y-6"
  >
    {#if form?.error}
      <div class="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
        {form.error}
      </div>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Sale Items -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Items Header -->
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {$_('sales.saleItems')}
          </h2>
          <div class="flex gap-2">
            <button
              type="button"
              on:click={() => showBarcodeScanner = true}
              class="btn-secondary btn-sm"
            >
              <Scan class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {$_('sales.scanBarcode')}
            </button>
            <button
              type="button"
              on:click={addItem}
              class="btn-primary btn-sm"
            >
              <Plus class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {$_('sales.addItem')}
            </button>
          </div>
        </div>

        <!-- Items List -->
        <div class="space-y-4">
          {#each items as item, index}
            <div class="card p-4">
              <div class="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <!-- Product -->
                <div class="md:col-span-2">
                  <label for="product-{index}" class="label">{$_('sales.product')}</label>
                  <select
                    id="product-{index}"
                    bind:value={item.productId}
                    on:change={(e) => updateItem(index, 'productId', e.target.value)}
                    class="input text-sm"
                    required
                  >
                    <option value="">{$_('sales.selectProduct')}</option>
                    {#each data.products as product}
                      <option value={product.id}>
                        {$locale === 'ar' ? product.nameAr : product.nameEn} - {product.sku}
                        ({product.quantity} in stock)
                      </option>
                    {/each}
                  </select>
                </div>

                <!-- Quantity -->
                <div>
                  <label for="quantity-{index}" class="label">{$_('sales.quantity')}</label>
                  <input
                    id="quantity-{index}"
                    type="number"
                    min="1"
                    max={item.product?.quantity || 999}
                    bind:value={item.quantity}
                    on:input={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    class="input"
                    required
                  />
                </div>

                <!-- Price -->
                <div>
                  <label for="price-{index}" class="label">{$_('sales.price')}</label>
                  <input
                    id="price-{index}"
                    type="number"
                    step="0.01"
                    min="0.01"
                    bind:value={item.price}
                    on:input={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                    class="input"
                    required
                  />
                </div>

                <!-- Total -->
                <div>
                  <label class="label">{$_('sales.total')}</label>
                  <div class="input bg-gray-50 dark:bg-gray-700">
                    ${item.total.toFixed(2)}
                  </div>
                </div>

                <!-- Actions -->
                <div>
                  <button
                    type="button"
                    on:click={() => removeItem(index)}
                    class="btn-danger btn-sm w-full"
                    disabled={items.length === 1}
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <!-- Product Info -->
              {#if item.product}
                <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{$_('sales.available')}: {item.product.quantity}</span>
                    <span>{$_('sales.category')}: {item.product.category ? ($locale === 'ar' ? item.product.category.nameAr : item.product.category.nameEn) : $_('sales.none')}</span>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <!-- Sale Summary -->
      <div class="space-y-6">
        <!-- Customer Selection -->
        <div class="card p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <User class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            {$_('sales.customer')}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label for="customer" class="label">{$_('sales.selectCustomer')}</label>
              <select
                id="customer"
                bind:value={saleData.customerId}
                class="input"
              >
                <option value="">{$_('sales.walkInCustomer')}</option>
                {#each data.customers as customer}
                  <option value={customer.id}>
                    {$locale === 'ar' ? customer.nameAr : customer.nameEn}
                    {#if customer.phone} - {customer.phone}{/if}
                  </option>
                {/each}
              </select>
            </div>
          </div>
        </div>

        <!-- Payment & Totals -->
        <div class="card p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calculator class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            {$_('sales.paymentDetails')}
          </h3>
          
          <div class="space-y-4">
            <!-- Subtotal -->
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">{$_('sales.subtotal')}:</span>
              <span class="font-semibold">${subtotal.toFixed(2)}</span>
            </div>

            <!-- Discount -->
            <div>
              <label for="discount" class="label">{$_('sales.discount')}</label>
              <input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                max={subtotal}
                bind:value={saleData.discount}
                class="input"
              />
            </div>

            <!-- Tax -->
            <div>
              <label for="tax" class="label">{$_('sales.tax')}</label>
              <input
                id="tax"
                type="number"
                step="0.01"
                min="0"
                bind:value={saleData.tax}
                class="input"
              />
            </div>

            <!-- Net Amount -->
            <div class="flex justify-between text-lg font-semibold border-t pt-4">
              <span>{$_('sales.netAmount')}:</span>
              <span class="text-green-600">${netAmount.toFixed(2)}</span>
            </div>

            <!-- Payment Method -->
            <div>
              <label for="payment-method" class="label">{$_('sales.paymentMethod')}</label>
              <select
                id="payment-method"
                bind:value={saleData.paymentMethod}
                class="input"
                required
              >
                <option value="CASH">{$_('sales.cash')}</option>
                <option value="CREDIT">{$_('sales.credit')}</option>
                <option value="CARD">{$_('sales.card')}</option>
              </select>
            </div>

            <!-- Notes -->
            <div>
              <label for="notes" class="label">{$_('sales.notes')}</label>
              <textarea
                id="notes"
                bind:value={saleData.notes}
                rows="3"
                class="input"
                placeholder={$_('sales.notesPlaceholder')}
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="btn-primary btn-lg w-full"
          disabled={isSubmitting || items.length === 0}
        >
          {#if isSubmitting}
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-current ltr:mr-2 rtl:ml-2"></div>
          {:else}
            <ShoppingCart class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
          {/if}
          {isSubmitting ? $_('sales.creatingSale') : $_('sales.createSale')}
        </button>
      </div>
    </div>

    <!-- Hidden fields for form submission -->
    <input type="hidden" name="customerId" value={saleData.customerId} />
    <input type="hidden" name="paymentMethod" value={saleData.paymentMethod} />
    <input type="hidden" name="discount" value={saleData.discount} />
    <input type="hidden" name="tax" value={saleData.tax} />
    <input type="hidden" name="notes" value={saleData.notes} />
    <input type="hidden" name="items" value={JSON.stringify(items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    })).filter(item => item.productId && item.quantity > 0 && item.price > 0))} />
  </form>
</div>

<!-- Barcode Scanner Modal -->
{#if showBarcodeScanner}
  <BarcodeScanner
    onScan={handleBarcodeScanned}
    onClose={() => showBarcodeScanner = false}
    title={$_('forms.scanProductBarcode')}
  />
{/if}