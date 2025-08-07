<!-- src/routes/(app)/purchases/new/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { enhance } from '$app/forms';
  import { notifications } from '$lib/stores/notifications';
  import { 
    ArrowLeft, 
    Plus, 
    Trash2, 
    ShoppingBag, 
    Truck, 
    Scan,
    Calculator,
    Calendar,
    DollarSign,
    Info,
    Package
  } from 'lucide-svelte';
  import BarcodeScanner from '$lib/components/barcode/BarcodeScanner.svelte';
  import type { PageData, ActionData } from './$types';
  
  export let data: PageData;
  export let form: ActionData;
  
  let showBarcodeScanner = false;
  let isSubmitting = false;
  
  // Purchase data
  let purchaseData = {
    supplierId: '',
    discount: 0,
    tax: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: ''
  };
  
  // Purchase items
  let items: Array<{
    productId: string;
    quantity: number;
    price: number;
    total: number;
    product?: any;
    lastPurchasePrice?: number;
  }> = [];

  // Computed values
  $: subtotal = items.reduce((sum, item) => sum + item.total, 0);
  $: netAmount = subtotal - purchaseData.discount + purchaseData.tax;

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
        // Use last purchase price if available, otherwise use cost price
        if (product.lastPurchase?.price) {
          items[index].price = product.lastPurchase.price;
          items[index].lastPurchasePrice = product.lastPurchase.price;
        } else {
          items[index].price = product.costPrice;
        }
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
        const price = product.lastPurchase?.price || product.costPrice;
        items = [...items, {
          productId: product.id,
          quantity: 1,  
          price: price,
          total: price,
          product,
          lastPurchasePrice: product.lastPurchase?.price
        }];
      }
      
      notifications.success('Product Added', `${$locale === 'ar' ? product.nameAr : product.nameEn} added to purchase`);
    } else {
      notifications.error('Product Not Found', `No product found with barcode: ${barcode}`);
    }
  }

  function handleSubmit() {
    return async ({ result, update }) => {
      isSubmitting = false;
      
      if (result.type === 'success') {
        notifications.success('Purchase Created', 'Purchase order has been created successfully');
      } else if (result.type === 'failure') {
        notifications.error('Purchase Failed', result.data?.error || 'Failed to create purchase');
        // Update the form to show errors
        await update();
      } else if (result.type === 'redirect') {
        notifications.success('Purchase Created', 'Purchase order has been created successfully');
        // Redirect will happen automatically
      }
    };
  }

  function validateForm() {
    // Check if we have any items
    if (items.length === 0) {
      notifications.error('Validation Error', 'Please add at least one item to the purchase');
      return false;
    }
    
    // Check if all items have products selected
    const itemsWithoutProducts = items.filter(item => !item.productId);
    if (itemsWithoutProducts.length > 0) {
      notifications.error('Validation Error', 'Please select a product for all items');
      return false;
    }
    
    // Check if all items have valid quantities
    const itemsWithInvalidQty = items.filter(item => !item.quantity || item.quantity <= 0);
    if (itemsWithInvalidQty.length > 0) {
      notifications.error('Validation Error', 'Please enter valid quantities for all items');
      return false;
    }
    
    // Check if all items have valid prices
    const itemsWithInvalidPrice = items.filter(item => !item.price || item.price <= 0);
    if (itemsWithInvalidPrice.length > 0) {
      notifications.error('Validation Error', 'Please enter valid prices for all items');
      return false;
    }
    
    return true;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString($locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat($locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  // Initialize with one empty item
  if (items.length === 0) {
    addItem();
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center gap-4">
    <a href="/purchases" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
      <ArrowLeft class="w-6 h-6" />
    </a>
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {$_('modules.purchases.newPurchase')}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        Create a new purchase order from supplier
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
      <!-- Purchase Items -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Items Header -->
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Purchase Items
          </h2>
          <div class="flex gap-2">
            <button
              type="button"
              on:click={() => showBarcodeScanner = true}
              class="btn-secondary btn-sm"
            >
              <Scan class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              Scan
            </button>
            <button
              type="button"
              on:click={addItem}
              class="btn-primary btn-sm"
            >
              <Plus class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              Add Item
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
                  <label for="product-{index}" class="label">Product</label>
                  <select
                    id="product-{index}"
                    bind:value={item.productId}
                    on:change={(e) => updateItem(index, 'productId', e.target.value)}
                    class="input text-sm"
                    required
                  >
                    <option value="">Select product...</option>
                    {#each data.products as product}
                      <option value={product.id}>
                        {$locale === 'ar' ? product.nameAr : product.nameEn} - {product.sku}
                        (Stock: {product.quantity})
                      </option>
                    {/each}
                  </select>
                </div>

                <!-- Quantity -->
                <div>
                  <label for="quantity-{index}" class="label">Qty</label>
                  <input
                    id="quantity-{index}"
                    type="number"
                    min="1"
                    bind:value={item.quantity}
                    on:input={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    class="input"
                    required
                  />
                </div>

                <!-- Price -->
                <div>
                  <label for="price-{index}" class="label">Cost Price</label>
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
                  <label class="label">Total</label>
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

              <!-- Product Info & Last Purchase Details -->
              {#if item.product}
                <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span class="text-gray-500 dark:text-gray-400">Current Stock:</span>
                      <span class="font-medium ltr:ml-2 rtl:mr-2">{item.product.quantity}</span>
                    </div>
                    <div>
                      <span class="text-gray-500 dark:text-gray-400">Category:</span>
                      <span class="font-medium ltr:ml-2 rtl:mr-2">
                        {item.product.category ? ($locale === 'ar' ? item.product.category.nameAr : item.product.category.nameEn) : 'None'}
                      </span>
                    </div>
                    <div>
                      <span class="text-gray-500 dark:text-gray-400">Current Selling Price:</span>
                      <span class="font-medium ltr:ml-2 rtl:mr-2">{formatCurrency(item.product.sellingPrice)}</span>
                    </div>
                  </div>
                  
                  {#if item.product.lastPurchase}
                    <div class="mt-2 p-2 bg-blue-50 rounded-lg dark:bg-blue-900">
                      <div class="flex items-start gap-2">
                        <Info class="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div class="text-sm">
                          <p class="font-medium text-blue-900 dark:text-blue-100">
                            {$_('modules.purchases.lastPrice')}: {formatCurrency(item.product.lastPurchase.price)}
                          </p>
                          <p class="text-blue-700 dark:text-blue-300">
                            Date: {formatDate(item.product.lastPurchase.date)} | 
                            Supplier: {$locale === 'ar' ? item.product.lastPurchase.supplier?.nameAr : item.product.lastPurchase.supplier?.nameEn}
                          </p>
                        </div>
                      </div>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <!-- Purchase Summary -->
      <div class="space-y-6">
        <!-- Supplier Selection -->
        <div class="card p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Truck class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            {$_('modules.purchases.supplier')}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label for="supplier" class="label">Select Supplier</label>
              <select
                id="supplier"
                bind:value={purchaseData.supplierId}
                class="input"
              >
                <option value="">No Supplier (Direct Purchase)</option>
                {#each data.suppliers as supplier}
                  <option value={supplier.id}>
                    {$locale === 'ar' ? supplier.nameAr : supplier.nameEn}
                    {#if supplier.phone} - {supplier.phone}{/if}
                  </option>
                {/each}
              </select>
            </div>

            <!-- Purchase Date -->
            <div>
              <label for="purchase-date" class="label flex items-center">
                <Calendar class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {$_('modules.purchases.purchaseDate')}
              </label>
              <input
                id="purchase-date"
                type="date"
                bind:value={purchaseData.purchaseDate}
                class="input"
                required
              />
            </div>
          </div>
        </div>

        <!-- Cost Calculation -->
        <div class="card p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calculator class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            Cost Details
          </h3>
          
          <div class="space-y-4">
            <!-- Subtotal -->
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span class="font-semibold">${subtotal.toFixed(2)}</span>
            </div>

            <!-- Discount -->
            <div>
              <label for="discount" class="label">Discount</label>
              <input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                max={subtotal}
                bind:value={purchaseData.discount}
                class="input"
              />
            </div>

            <!-- Tax -->
            <div>
              <label for="tax" class="label">Tax</label>
              <input
                id="tax"
                type="number"
                step="0.01"
                min="0"
                bind:value={purchaseData.tax}
                class="input"
              />
            </div>

            <!-- Net Amount -->
            <div class="flex justify-between text-lg font-semibold border-t pt-4">
              <span>Total Cost:</span>
              <span class="text-blue-600">${netAmount.toFixed(2)}</span>
            </div>

            <!-- Notes -->
            <div>
              <label for="notes" class="label">Notes (Optional)</label>
              <textarea
                id="notes"
                bind:value={purchaseData.notes}
                rows="3"
                class="input"
                placeholder="Additional notes about this purchase..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Stock Impact Summary -->
        <div class="card p-4 bg-green-50 dark:bg-green-900">
          <h3 class="text-lg font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center">
            <Package class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            Stock Impact
          </h3>
          <div class="space-y-2 text-sm">
            {#each items.filter(item => item.product) as item}
              <div class="flex justify-between text-green-700 dark:text-green-200">
                <span>{$locale === 'ar' ? item.product.nameAr : item.product.nameEn}:</span>
                <span class="font-medium">
                  {item.product.quantity} → {item.product.quantity + item.quantity} (+{item.quantity})
                </span>
              </div>
            {/each}
            {#if items.filter(item => item.product).length === 0}
              <p class="text-green-600 dark:text-green-300">Select products to see stock impact</p>
            {/if}
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
            <ShoppingBag class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
          {/if}
          {isSubmitting ? 'Creating Purchase...' : 'Create Purchase Order'}
        </button>
      </div>
    </div>

    <!-- Hidden fields for form submission -->
    <input type="hidden" name="supplierId" value={purchaseData.supplierId} />
    <input type="hidden" name="discount" value={purchaseData.discount} />
    <input type="hidden" name="tax" value={purchaseData.tax} />
    <input type="hidden" name="purchaseDate" value={purchaseData.purchaseDate} />
    <input type="hidden" name="notes" value={purchaseData.notes} />
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
    title="Scan Product Barcode"
  />
{/if}

<style>
  /* Add this if you need to import the Package icon */
  :global(.dark) input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
</style>