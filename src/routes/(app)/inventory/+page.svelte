<!-- src/routes/(app)/inventory/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { Plus, Search, Barcode, Download } from 'lucide-svelte';
  import type { PageData } from './$types';
  import ProductList from '$lib/components/products/ProductList.svelte';
  import BarcodeScanner from '$lib/components/barcode/BarcodeScanner.svelte';
  
  export let data: PageData;
  
  let showScanner = false;
  let searchQuery = '';
  let selectedCategory = '';
  
  async function handleBarcodeScan(barcode: string) {
    try {
      const response = await fetch(`/api/products/barcode/${barcode}`);
      if (response.ok) {
        const product = await response.json();
        // Navigate to product or show details
        window.location.href = `/inventory/products/${product.id}`;
      } else {
        alert('Product not found');
      }
    } catch (error) {
      console.error('Barcode scan error:', error);
      alert('Error scanning barcode');
    }
    showScanner = false;
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
      {$_('modules.inventory.title')}
    </h1>
    
    <div class="flex gap-2">
      <button
        on:click={() => showScanner = true}
        class="btn-secondary btn-md"
      >
        <Barcode class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        {$_('modules.inventory.scanBarcode')}
      </button>
      
      <a href="/inventory/products/new" class="btn-primary btn-md">
        <Plus class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        {$_('modules.inventory.addProduct')}
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

{#if showScanner}
  <BarcodeScanner
    onScan={handleBarcodeScan}
    onClose={() => showScanner = false}
  />
{/if}