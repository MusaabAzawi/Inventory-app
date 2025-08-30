<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { Plus, Search, Barcode, Download, Scan } from 'lucide-svelte';
  import type { PageData } from './$types';
  import ProductList from '$lib/components/products/ProductList.svelte';
  import BarcodeScanner from '$lib/components/barcode/BarcodeScanner.svelte';
  import { notifications } from '$lib/stores/notifications';
  import { onMount } from 'svelte';
  
  export let data: PageData;
  
  // Show success message if present
  onMount(() => {
    if (data.successMessage) {
      notifications.success(data.successMessage.title, data.successMessage.message);
    }
  });
  
  let showScanner = false;
  let searchQuery = '';
  let selectedCategory = '';
  let scanResult = '';
  
  async function handleBarcodeScan(barcode: string) {
    scanResult = barcode;
    showScanner = false;
    
    try {
      const response = await fetch(`/api/products/barcode/${barcode}`);
      const result = await response.json();
      
      if (result.success && result.product) {
        // Product found - highlight it or navigate to it
        const productName = $locale === 'ar' ? result.product.nameAr : result.product.nameEn;
        
        if (confirm(`Product found: "${productName}" (${result.product.sku})\n\nOpen product details?`)) {
          window.location.href = `/inventory/products/${result.product.id}`;
        } else {
          // Set search to highlight the product
          searchQuery = result.product.sku;
        }
      } else {
        // Product not found - offer to create new one
        if (confirm(`Product with barcode "${barcode}" not found.\n\nCreate new product with this barcode?`)) {
          window.location.href = `/inventory/products/new?barcode=${encodeURIComponent(barcode)}`;
        }
      }
    } catch (error) {
      console.error('Barcode lookup error:', error);
      alert('Error looking up product. Please try again.');
    }
  }
  
  function openBarcodeScanner() {
    showScanner = true;
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {$_('modules.inventory.title')}
      </h1>
      {#if scanResult}
        <p class="text-sm text-gray-500 mt-1">
          Last scanned: {scanResult}
        </p>
      {/if}
    </div>
    
    <div class="flex gap-2">
      <!-- Barcode Scanner Button -->
      <button
        on:click={openBarcodeScanner}
        class="btn-secondary btn-md touch-manipulation"
      >
        <Scan class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        <span class="hidden sm:inline">{$_('modules.inventory.scanBarcode')}</span>
        <span class="sm:hidden">Scan</span>
      </button>
      
      <a href="/inventory/products/new" class="btn-primary btn-md touch-manipulation">
        <Plus class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        <span class="hidden sm:inline">{$_('modules.inventory.addProduct')}</span>
        <span class="sm:hidden">Add</span>
      </a>
    </div>
  </div>

  <!-- Search and filters -->
  <div class="card p-4">
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1 relative">
        <Search class="absolute ltr:left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder={$_('common.search')}
          class="input ltr:pl-10 rtl:pr-10"
        />
      </div>
      
      <select class="input w-full sm:w-48" bind:value={selectedCategory}>
        <option value="">{$_('common.all')} {$_('product.category')}</option>
        {#each data.categories as category}
          <option value={category.id}>
            {$locale === 'ar' ? category.nameAr : category.nameEn}
          </option>
        {/each}
      </select>
      
      <button class="btn-secondary btn-md">
        <Download class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        {$_('common.export')}
      </button>
    </div>
  </div>

  <!-- Products list -->
  <div class="card">
    <ProductList products={data.products} {searchQuery} {selectedCategory} />
  </div>
</div>

<!-- Barcode Scanner Modal -->
{#if showScanner}
  <BarcodeScanner
    onScan={handleBarcodeScan}
    onClose={() => showScanner = false}
    title="Scan to Find Product"
  />
{/if}