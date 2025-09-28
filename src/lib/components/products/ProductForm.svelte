<!-- src/lib/components/products/ProductForm.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { enhance } from '$app/forms';
  import { notifications } from '$lib/stores/notifications';
  import { ArrowLeft, Save, Scan, Barcode } from 'lucide-svelte';
  import BarcodeScanner from '$lib/components/barcode/BarcodeScanner.svelte';
  import { currentCurrency } from '$lib/stores/currency';
  
  export let product: any = null;
  export let categories: any[] = [];
  export let form: any = null;
  
  let showBarcodeScanner = false;
  let isSubmitting = false;
  
  $: isEdit = !!product;
  
  // Form data with defaults (mutable for category selection)
  let formData = {
    nameEn: form?.nameEn ?? product?.nameEn ?? '',
    nameAr: form?.nameAr ?? product?.nameAr ?? '',
    sku: form?.sku ?? product?.sku ?? '',
    barcode: form?.barcode ?? product?.barcode ?? '',
    quantity: form?.quantity ?? product?.quantity ?? 0,
    minQuantity: form?.minQuantity ?? product?.minQuantity ?? 5,
    costPrice: form?.costPrice ?? product?.costPrice ?? 0,
    sellingPrice: form?.sellingPrice ?? product?.sellingPrice ?? 0,
    categoryId: form?.categoryId ?? product?.categoryId ?? '',
    location: form?.location ?? product?.location ?? '',
    expiryDate: form?.expiryDate ?? (product?.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : ''),
    weight: form?.weight ?? product?.weight ?? 0,
    unit: form?.unit ?? product?.unit ?? 'kg'
  };

  // Update formData when form prop changes (for server-side validation errors)
  $: if (form) {
    formData = {
      nameEn: form?.nameEn ?? product?.nameEn ?? '',
      nameAr: form?.nameAr ?? product?.nameAr ?? '',
      sku: form?.sku ?? product?.sku ?? '',
      barcode: form?.barcode ?? product?.barcode ?? '',
      quantity: form?.quantity ?? product?.quantity ?? 0,
      minQuantity: form?.minQuantity ?? product?.minQuantity ?? 5,
      costPrice: form?.costPrice ?? product?.costPrice ?? 0,
      sellingPrice: form?.sellingPrice ?? product?.sellingPrice ?? 0,
      categoryId: form?.categoryId ?? product?.categoryId ?? '',
      location: form?.location ?? product?.location ?? '',
      expiryDate: form?.expiryDate ?? (product?.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : ''),
      weight: form?.weight ?? product?.weight ?? 0,
      unit: form?.unit ?? product?.unit ?? 'kg'
    };
  }

  // Check if selected category is Food
  $: selectedCategory = categories.find(cat => cat.id === formData.categoryId);
  $: isFoodCategory = selectedCategory && selectedCategory.nameEn === 'Food';
  

  function handleBarcodeScanned(barcode: string) {
    formData.barcode = barcode;
    showBarcodeScanner = false;
    
    // Update the actual form field
    const barcodeInput = document.querySelector('input[name="barcode"]') as HTMLInputElement;
    if (barcodeInput) {
      barcodeInput.value = barcode;
    }
  }

  function generateSKU() {
    // Simple SKU generation - in real app this might be more sophisticated
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    formData.sku = `PRD-${randomStr}-${timestamp}`;
    
    // Update the actual form field
    const skuInput = document.querySelector('input[name="sku"]') as HTMLInputElement;
    if (skuInput) {
      skuInput.value = formData.sku;
    }
  }

  function validateForm() {
    if (!formData.nameEn.trim()) {
      notifications.error('Validation Error', 'English name is required');
      return false;
    }
    if (!formData.nameAr.trim()) {
      notifications.error('Validation Error', 'Arabic name is required');
      return false;
    }
    if (!formData.sku.trim()) {
      notifications.error('Validation Error', 'SKU is required');
      return false;
    }
    if (formData.costPrice <= 0) {
      notifications.error('Validation Error', 'Cost price must be greater than 0');
      return false;
    }
    if (formData.sellingPrice <= 0) {
      notifications.error('Validation Error', 'Selling price must be greater than 0');
      return false;
    }
    // Validate expiry date for food category
    if (isFoodCategory && !formData.expiryDate?.trim()) {
      notifications.error('Validation Error', 'Expiry date is required for food items');
      return false;
    }
    return true;
  }

  function handleSubmit() {
    return async ({ result }) => {
      isSubmitting = false;
      
      if (result.type === 'success') {
        notifications.success(
          isEdit ? 'Product Updated' : 'Product Created',
          `${formData.nameEn} has been ${isEdit ? 'updated' : 'created'} successfully.`
        );
      } else if (result.type === 'failure') {
        notifications.error(
          'Error',
          result.data?.error || 'An error occurred while saving the product'
        );
      } else if (result.type === 'redirect') {
        // Success redirect - clear any error states
        form = null;
        notifications.success(
          'Product Created',
          `${formData.nameEn} has been created successfully.`
        );
      }
    };
  }
</script>

<form 
  method="POST" 
  use:enhance={handleSubmit}
  on:submit|preventDefault={() => {
    if (validateForm()) {
      isSubmitting = true;
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

  <div class="mobile-grid-stack gap-4 sm:gap-6">
    <!-- English Name -->
    <div>
      <label for="nameEn" class="label">
        {$_('product.nameEnglish')} <span class="text-red-500">*</span>
      </label>
      <input
        id="nameEn"
        name="nameEn"
        type="text"
        required
        class="input"
        bind:value={formData.nameEn}
        dir="ltr"
        placeholder="Enter product name in English"
      />
    </div>

    <!-- Arabic Name -->
    <div>
      <label for="nameAr" class="label">
        {$_('product.nameArabic')} <span class="text-red-500">*</span>
      </label>
      <input
        id="nameAr"
        name="nameAr"
        type="text"
        required
        class="input"
        bind:value={formData.nameAr}
        dir="rtl"
        placeholder="أدخل اسم المنتج بالعربية"
      />
    </div>

    <!-- SKU -->
    <div>
      <label for="sku" class="label">
        {$_('product.sku')} <span class="text-red-500">*</span>
      </label>
      <div class="flex gap-2">
        <input
          id="sku"
          name="sku"
          type="text"
          required
          class="input flex-1"
          bind:value={formData.sku}
          placeholder="PRD-XXX-123456"
        />
        <button
          type="button"
          on:click={generateSKU}
          class="btn-secondary btn-md touch-manipulation"
          title="Generate SKU"
          aria-label="Generate SKU"
        >
          <span class="hidden sm:inline">Generate</span>
          <span class="sm:hidden">Gen</span>
        </button>
      </div>
    </div>

    <!-- Barcode -->
    <div>
      <label for="barcode" class="label">
        {$_('product.barcode')}
      </label>
      <div class="flex gap-2">
        <input
          id="barcode"
          name="barcode"
          type="text"
          class="input flex-1"
          bind:value={formData.barcode}
          placeholder="Scan or enter barcode"
        />
        <button
          type="button"
          on:click={() => showBarcodeScanner = true}
          class="btn-secondary btn-md touch-manipulation"
          title="Scan Barcode"
          aria-label="Scan Barcode"
        >
          <Scan class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Category -->
    <div>
      <label for="categoryId" class="label">
        {$_('product.category')}
      </label>
      <select
        id="categoryId"
        name="categoryId"
        class="input"
        bind:value={formData.categoryId}
      >
        <option value="">{$_('common.select')} {$_('product.category')}</option>
        {#each categories as category}
          <option value={category.id}>
            {category.nameEn} / {category.nameAr}
          </option>
        {/each}
      </select>
    </div>

    <!-- Location -->
    <div>
      <label for="location" class="label">
        {$_('product.location')}
      </label>
      <input
        id="location"
        name="location"
        type="text"
        class="input"
        bind:value={formData.location}
        placeholder="Shelf A1, Warehouse 1, etc."
      />
    </div>

    <!-- Expiry Date (for Food category only) -->
    {#if isFoodCategory}
      <div>
        <label for="expiryDate" class="label">
          {$_('product.expiryDate')} <span class="text-red-500">*</span>
        </label>
        <input
          id="expiryDate"
          name="expiryDate"
          type="date"
          required={isFoodCategory}
          class="input"
          bind:value={formData.expiryDate}
        />
        <p class="text-sm text-gray-500 mt-1">
          Expiry date is required for food items
        </p>
      </div>
    {/if}

    <!-- Quantity -->
    <div>
      <label for="quantity" class="label">
        {$_('product.quantity')} {isFoodCategory ? '(pieces)' : ''} <span class="text-red-500">*</span>
      </label>
      <input
        id="quantity"
        name="quantity"
        type="number"
        min="0"
        required
        class="input"
        bind:value={formData.quantity}
      />
    </div>

    <!-- Weight for Food Category -->
    {#if isFoodCategory}
      <div>
        <label for="weight" class="label">
          Weight (kg) per unit
        </label>
        <div class="flex gap-2">
          <input
            id="weight"
            name="weight"
            type="number"
            step="0.001"
            min="0"
            class="input flex-1"
            bind:value={formData.weight}
            placeholder="0.000"
          />
          <span class="flex items-center px-3 bg-gray-100 border border-gray-300 rounded-md text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
            kg
          </span>
        </div>
        <p class="text-sm text-gray-500 mt-1">
          Specify the weight per unit in kilograms (e.g., 0.5 kg per package)
        </p>
      </div>
    {/if}

    <!-- Minimum Quantity -->
    <div>
      <label for="minQuantity" class="label">
        {$_('product.minQuantity')} <span class="text-red-500">*</span>
      </label>
      <input
        id="minQuantity"
        name="minQuantity"
        type="number"
        min="0"
        required
        class="input"
        bind:value={formData.minQuantity}
      />
    </div>

    <!-- Cost Price -->
    <div>
      <label for="costPrice" class="label">
        {$_('product.costPrice')} <span class="text-red-500">*</span>
      </label>
      <div class="relative">
        <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">{$currentCurrency.symbol}</span>
        <input
          id="costPrice"
          name="costPrice"
          type="number"
          step="1"
          min="1"
          required
          class="input pl-10"
          bind:value={formData.costPrice}
        />
      </div>
    </div>

    <!-- Selling Price -->
    <div>
      <label for="sellingPrice" class="label">
        {$_('product.sellingPrice')} <span class="text-red-500">*</span>
      </label>
      <div class="relative">
        <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">{$currentCurrency.symbol}</span>
        <input
          id="sellingPrice"
          name="sellingPrice"
          type="number"
          step="1"
          min="1"
          required
          class="input pl-10"
          bind:value={formData.sellingPrice}
        />
      </div>
    </div>
  </div>

  <!-- Profit Margin Display -->
  {#if formData.costPrice > 0 && formData.sellingPrice > 0}
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900 dark:border-blue-700">
      <div class="flex justify-between items-center">
        <span class="text-sm font-medium text-blue-800 dark:text-blue-200">Profit Margin:</span>
        <span class="text-lg font-semibold text-blue-900 dark:text-blue-100">
          ${(formData.sellingPrice - formData.costPrice).toFixed(2)} 
          ({(((formData.sellingPrice - formData.costPrice) / formData.costPrice) * 100).toFixed(1)}%)
        </span>
      </div>
    </div>
  {/if}

  <!-- Hidden fields for food category -->
  {#if isFoodCategory}
    <input type="hidden" name="weight" value={formData.weight} />
    <input type="hidden" name="unit" value={formData.unit} />
  {/if}

  <!-- Form Actions -->
  <div class="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
    <a href="/inventory" class="btn-secondary btn-md touch-manipulation order-2 sm:order-1">
      <ArrowLeft class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
      {$_('common.cancel')}
    </a>
    <button 
      type="submit" 
      class="btn-primary btn-md touch-manipulation order-1 sm:order-2"
      disabled={isSubmitting}
    >
      {#if isSubmitting}
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current ltr:mr-2 rtl:ml-2"></div>
      {:else}
        <Save class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
      {/if}
      {$_(isEdit ? 'common.update' : 'common.save')}
    </button>
  </div>
</form>

<!-- Barcode Scanner Modal -->
{#if showBarcodeScanner}
  <BarcodeScanner
    onScan={handleBarcodeScanned}
    onClose={() => showBarcodeScanner = false}
    title="Scan Product Barcode"
  />
{/if}