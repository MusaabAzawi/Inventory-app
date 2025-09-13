<!-- src/routes/(app)/purchases/[id]/edit/+page.svelte -->
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
    Package,
    Save
  } from 'lucide-svelte';
  import BarcodeScanner from '$lib/components/barcode/BarcodeScanner.svelte';
  import type { PageData, ActionData } from './$types';
  
  export let data: PageData;
  export let form: ActionData;
  
  let showBarcodeScanner = false;
  let isSubmitting = false;
  
  // Purchase data
  let purchaseData = {
    supplierId: data.purchase.supplierId || '',
    discount: data.purchase.discount || 0,
    tax: data.purchase.tax || 0,
    purchaseDate: data.purchase.purchaseDate.split('T')[0],
    notes: data.purchase.notes || ''
  };
  
  // Purchase items
  let items: Array<{
    productId: string;
    quantity: number;
    price: number;
    total: number;
    weight?: number;
    product?: any;
    lastPurchasePrice?: number;
  }> = data.purchase.items.map(item => ({
    productId: item.product.id,
    quantity: item.quantity,
    price: item.price,
    total: item.total,
    weight: item.weight || 0,
    product: item.product,
    lastPurchasePrice: item.product.lastPurchase?.price
  }));

  // Computed values
  $: subtotal = items.reduce((sum, item) => sum + item.total, 0);
  $: netAmount = subtotal - purchaseData.discount + purchaseData.tax;

  function addItem() {
    items = [...items, {
      productId: '',
      quantity: 1,
      price: 0,
      total: 0,
      weight: 0
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

  function isFoodCategory(product: any) {
    if (!product?.category) return false;
    const categoryName = $locale === 'ar' ? product.category.nameAr : product.category.nameEn;
    return categoryName.toLowerCase().includes('food') || 
           categoryName.toLowerCase().includes('طعام') ||
           categoryName.toLowerCase().includes('غذاء');
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
          weight: 0,
          product,
          lastPurchasePrice: product.lastPurchase?.price
        }];
      }
      
      notifications.success($_('purchases.productAdded'), $_('purchases.productAddedMessage', { values: { name: $locale === 'ar' ? product.nameAr : product.nameEn } }));
    } else {
      notifications.error($_('purchases.productNotFound'), $_('purchases.noProductWithBarcode', { values: { barcode } }));
    }
  }

  function handleSubmit() {
    return async ({ result, update }) => {
      isSubmitting = false;
      
      if (result.type === 'success') {
        notifications.success($_('purchases.purchaseUpdated'), $_('purchases.purchaseUpdatedMessage'));
      } else if (result.type === 'failure') {
        notifications.error($_('purchases.purchaseFailed'), result.data?.error || $_('purchases.failedToUpdate'));
        // Update the form to show errors
        await update();
      } else if (result.type === 'redirect') {
        notifications.success($_('purchases.purchaseUpdated'), $_('purchases.purchaseUpdatedMessage'));
        // Redirect will happen automatically
      }
    };
  }

  function validateForm() {
    // Check if we have any items
    if (items.length === 0) {
      notifications.error($_('purchases.validationError'), $_('purchases.addAtLeastOneItem'));
      return false;
    }
    
    // Check if all items have products selected
    const itemsWithoutProducts = items.filter(item => !item.productId);
    if (itemsWithoutProducts.length > 0) {
      notifications.error($_('purchases.validationError'), $_('purchases.selectProductForAll'));
      return false;
    }
    
    // Check if all items have valid quantities
    const itemsWithInvalidQty = items.filter(item => !item.quantity || item.quantity <= 0);
    if (itemsWithInvalidQty.length > 0) {
      notifications.error($_('purchases.validationError'), $_('purchases.enterValidQuantities'));
      return false;
    }
    
    // Check if all items have valid prices
    const itemsWithInvalidPrice = items.filter(item => !item.price || item.price <= 0);
    if (itemsWithInvalidPrice.length > 0) {
      notifications.error($_('purchases.validationError'), $_('purchases.enterValidPrices'));
      return false;
    }
    
    // Check weight for food category items
    for (const item of items) {
      if (item.product && isFoodCategory(item.product) && (!item.weight || item.weight <= 0)) {
        notifications.error($_('purchases.validationError'), $_('purchases.weightRequiredForFood', {
          values: { product: $locale === 'ar' ? item.product.nameAr : item.product.nameEn }
        }));
        return false;
      }
    }
    
    return true;
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center gap-4">
    <a href="/purchases/{data.purchase.id}" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
      <ArrowLeft class="w-6 h-6" />
    </a>
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {$_('purchases.editPurchase')} #{data.purchase.invoiceNumber}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        {$_('purchases.editPurchaseSubtitle')}
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
            {$_('purchases.purchaseItems')}
          </h2>
          <div class="flex gap-2">
            <button
              type="button"
              on:click={() => showBarcodeScanner = true}
              class="btn-secondary btn-sm"
            >
              <Scan class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {$_('forms.scanProductBarcode')}
            </button>
            <button
              type="button"
              on:click={addItem}
              class="btn-primary btn-sm"
            >
              <Plus class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {$_('purchases.addItem')}
            </button>
          </div>
        </div>

        <!-- Items List -->
        <div class="space-y-4">
          {#each items as item, index}
            <div class="card p-4">
              <div class="grid grid-cols-1 md:grid-cols-8 gap-4 items-end">
                <!-- Product -->
                <div class="md:col-span-2">
                  <label for="product-{index}" class="label">{$_('purchases.product')}</label>
                  <select
                    id="product-{index}"
                    bind:value={item.productId}
                    on:change={(e) => updateItem(index, 'productId', e.target.value)}
                    class="input text-sm"
                    required
                  >
                    <option value="">{$_('purchases.selectProduct')}</option>
                    {#each data.products as product}
                      <option value={product.id}>
                        {$locale === 'ar' ? product.nameAr : product.nameEn} - {product.sku}
                        ({product.quantity} {$_('purchases.stock')})
                      </option>
                    {/each}
                  </select>
                </div>

                <!-- Quantity -->
                <div>
                  <label for="quantity-{index}" class="label">{$_('purchases.quantity')}</label>
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

                <!-- Weight (for food category) -->
                {#if item.product && isFoodCategory(item.product)}
                  <div>
                    <label for="weight-{index}" class="label">
                      {$_('purchases.weight')} (kg) <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="weight-{index}"
                      type="number"
                      step="0.001"
                      min="0.001"
                      bind:value={item.weight}
                      on:input={(e) => updateItem(index, 'weight', parseFloat(e.target.value) || 0)}
                      class="input"
                      required
                    />
                  </div>
                {/if}

                <!-- Price -->
                <div>
                  <label for="price-{index}" class="label">{$_('purchases.costPrice')}</label>
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
                  {#if item.lastPurchasePrice}
                    <p class="text-xs text-gray-500 mt-1">
                      {$_('purchases.lastPrice')}: ${item.lastPurchasePrice.toFixed(2)}
                    </p>
                  {/if}
                </div>

                <!-- Total -->
                <div>
                  <label class="label">{$_('purchases.total')}</label>
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
                    <span>{$_('purchases.currentStock')}: {item.product.quantity}</span>
                    <span>{$_('purchases.category')}: {item.product.category ? ($locale === 'ar' ? item.product.category.nameAr : item.product.category.nameEn) : $_('purchases.none')}</span>
                    <span>{$_('purchases.currentSellingPrice')}: ${item.product.sellingPrice.toFixed(2)}</span>
                  </div>
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
            {$_('purchases.supplier')}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label for="supplier" class="label">{$_('purchases.selectSupplier')}</label>
              <select
                id="supplier"
                bind:value={purchaseData.supplierId}
                class="input"
              >
                <option value="">{$_('purchases.noSupplierDirect')}</option>
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
              <label for="purchaseDate" class="label">{$_('purchases.date')}</label>
              <input
                id="purchaseDate"
                type="date"
                bind:value={purchaseData.purchaseDate}
                class="input"
                required
              />
            </div>
          </div>
        </div>

        <!-- Cost Details -->
        <div class="card p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calculator class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            {$_('purchases.costDetails')}
          </h3>
          
          <div class="space-y-4">
            <!-- Subtotal -->
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">{$_('purchases.subtotal')}</span>
              <span class="font-semibold">${subtotal.toFixed(2)}</span>
            </div>

            <!-- Discount -->
            <div>
              <label for="discount" class="label">{$_('purchases.discount')}</label>
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
              <label for="tax" class="label">{$_('purchases.tax')}</label>
              <input
                id="tax"
                type="number"
                step="0.01"
                min="0"
                bind:value={purchaseData.tax}
                class="input"
              />
            </div>

            <!-- Total Cost -->
            <div class="flex justify-between text-lg font-semibold border-t pt-4">
              <span>{$_('purchases.totalCost')}</span>
              <span class="text-green-600">${netAmount.toFixed(2)}</span>
            </div>

            <!-- Notes -->
            <div>
              <label for="notes" class="label">{$_('purchases.notesOptional')}</label>
              <textarea
                id="notes"
                bind:value={purchaseData.notes}
                rows="3"
                class="input"
                placeholder={$_('purchases.notesPlaceholder')}
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
            <Save class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
          {/if}
          {isSubmitting ? $_('purchases.updatingPurchase') : $_('purchases.updatePurchase')}
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
      price: item.price,
      weight: item.weight || 0
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