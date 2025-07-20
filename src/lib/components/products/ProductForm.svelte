<!-- src/lib/components/products/ProductForm.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { enhance } from '$app/forms';
  import { notifications } from '$lib/stores/notifications';
  import { Barcode, Scan } from 'lucide-svelte';
  import BarcodeScanner from '$lib/components/barcode/BarcodeScanner.svelte';
  
  export let product: any = null;
  export let categories: any[] = [];
  export let form: any = null;
  
  let showScanner = false;
  let isEdit = !!product;
  
  // Initialize form data
  $: formData = {
    nameEn: form?.nameEn ?? product?.nameEn ?? '',
    nameAr: form?.nameAr ?? product?.nameAr ?? '',
    sku: form?.sku ?? product?.sku ?? '',
    barcode: form?.barcode ?? product?.barcode ?? '',
    quantity: form?.quantity ?? product?.quantity ?? 0,
    minQuantity: form?.minQuantity ?? product?.minQuantity ?? 5,
    costPrice: form?.costPrice ?? product?.costPrice ?? 0,
    sellingPrice: form?.sellingPrice ?? product?.sellingPrice ?? 0,
    categoryId: form?.categoryId ?? product?.categoryId ?? '',
    location: form?.location ?? product?.location ?? ''
  };
  
  function handleBarcodeScanned(barcode: string) {
    formData.barcode = barcode;
    showScanner = false;
    
    // Update the form input
    const barcodeInput = document.querySelector('input[name="barcode"]') as HTMLInputElement;
    if (barcodeInput) {
      barcodeInput.value = barcode;
    }
  }
  
  function generateSKU() {
    const prefix = formData.nameEn.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    formData.sku = `${prefix}${timestamp}`;
    
    // Update the form input
    const skuInput = document.querySelector('input[name="sku"]') as HTMLInputElement;
    if (skuInput) {
      skuInput.value = formData.sku;
    }
  }
  
  function handleSubmit() {
    return async ({ result }: any) => {
      if (result.type === 'success') {
        notifications.success(
          `Product ${isEdit ? 'updated' : 'created'} successfully!`,
          `${formData.nameEn} has been ${isEdit ? 'updated' : 'added to inventory'}.`
        );
      } else if (result.type === 'failure') {
        notifications.error(
          'Failed to save product',
          result.data?.error || 'An error occurred while saving the product.',
          { duration: 0 }
        );
      }
    };
  }
</script>

<form method="POST" use:enhance={handleSubmit} class="space-y-6">
  {#if form?.error}
    <div class="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
      {form.error}
    </div>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- English Name -->
    <div>
      <label for="nameEn" class="label">{$_('product.nameEnglish')} *</label>
      <input
        id="nameEn"
        name="nameEn"
        type="text"
        required
        class="input"
        value={formData.nameEn}
        dir="ltr"
        placeholder="Enter product name in English"
      />
    </div>

    <!-- Arabic Name -->
    <div>
      <label for="nameAr" class="label">{$_('product.nameArabic')} *</label>
      <input
        id="nameAr"
        name="nameAr"
        type="text"
        required
        class="input"
        value={formData.nameAr}
        dir="rtl"
        placeholder="أدخل اسم المنتج بالعربية"
      />
    </div>

    <!-- SKU -->
    <div>
      <label for="sku" class="label">{$_('product.sku')} *</label>
      <div class="flex gap-2">
        <input
          id="sku"
          name="sku"
          type="text"
          required
          class="input flex-1"
          value={formData.sku}
          placeholder="Product SKU"
        />
        <button
          type="button"
          on:click={generateSKU}
          class="btn-secondary btn-md"
          title="Generate SKU"
        >
          Generate
        </button>
      </div>
    </div>

    <!-- Barcode -->
    <div>
      <label for="barcode" class="label">{$_('product.barcode')}</label>
      <div class="flex gap-2">
        <input
          id="barcode"
          name="barcode"
          type="text"
          class="input flex-1"
          value={formData.barcode}
          placeholder="Product barcode"
        />
        <button
          type="button"
          on:click={() => showScanner = true}
          class="btn-secondary btn-md"
          title="Scan Barcode"
        >
          <Scan class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Category -->
    <div>
      <label for="categoryId" class="label">{$_('product.category')}</label>
      <select
        id="categoryId"
        name="categoryId"
        class="input"
        value={formData.categoryId}
      >
        <option value="">{$_('common.select')} {$_('product.category')}</option>
        {#each categories as category}
          <option value={category.id}>
            {$_('svelte-i18n').locale === 'ar' ? category.nameAr : category.nameEn}
          </option>
        {/each}
      </select>
    </div>

    <!-- Location -->
    <div>
      <label for="location" class="label">{$_('product.location')}</label>
      <input
        id="location"
        name="location"
        type="text"
        class="input"
        value={formData.location}
        placeholder="Storage location"
      />
    </div>

    <!-- Quantity -->
    <div>
      <label for="quantity" class="label">{$_('product.quantity')} *</label>
      <input
        id="quantity"
        name="quantity"
        type="number"
        min="0"
        required
        class="input"
        value={formData.quantity}
      />
    </div>

    <!-- Minimum Quantity -->
    <div>
      <label for="minQuantity" class="label">{$_('product.minQuantity')} *</label>
      <input
        id="minQuantity"
        name="minQuantity"
        type="number"
        min="0"
        required
        class="input"
        value={formData.minQuantity}
      />
    </div>

    <!-- Cost Price -->
    <div>
      <label for="costPrice" class="label">{$_('product.costPrice')} *</label>
      <input
        id="costPrice"
        name="costPrice"
        type="number"
        step="0.01"
        min="0"
        required
        class="input"
        value={formData.costPrice}
      />
    </div>

    <!-- Selling Price -->
    <div>
      <label for="sellingPrice" class="label">{$_('product.sellingPrice')} *</label>
      <input
        id="sellingPrice"
        name="sellingPrice"
        type="number"
        step="0.01"
        min="0"
        required
        class="input"
        value={formData.sellingPrice}
      />
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
    <a href="/inventory" class="btn-secondary btn-md">
      {$_('common.cancel')}
    </a>
    <button type="submit" class="btn-primary btn-md">
      {$_('common.save')}
    </button>
  </div>
</form>

<!-- Barcode Scanner Modal -->
{#if showScanner}
  <BarcodeScanner
    onScan={handleBarcodeScanned}
    onClose={() => showScanner = false}
    title="Scan Product Barcode"
  />
{/if}