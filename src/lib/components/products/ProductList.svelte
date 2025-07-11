<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { Edit, Trash2, AlertTriangle } from 'lucide-svelte';
  
  export let products: any[] = [];
  export let searchQuery = '';
  export let selectedCategory = '';
  
  $: filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameAr.includes(searchQuery) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  function getStockStatus(product: any) {
    if (product.quantity === 0) {
      return { text: $_('product.outOfStock'), class: 'text-red-600 bg-red-50' };
    } else if (product.quantity <= product.minQuantity) {
      return { text: $_('product.lowStock'), class: 'text-yellow-600 bg-yellow-50' };
    }
    return { text: $_('common.active'), class: 'text-green-600 bg-green-50' };
  }
</script>

<div class="overflow-x-auto">
  {#if filteredProducts.length === 0}
    <div class="text-center py-8 text-gray-500">
      {$_('common.none')}
    </div>
  {:else}
    <table class="table">
      <thead class="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
            {$_('product.sku')}
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
            {$_('product.name')}
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
            {$_('product.category')}
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
            {$_('product.quantity')}
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
            {$_('product.price')}
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
            {$_('common.status')}
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
            {$_('common.actions')}
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
        {#each filteredProducts as product}
          {@const status = getStockStatus(product)}
          <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              {product.sku}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              <div>
                <p class="font-medium">{$locale === 'ar' ? product.nameAr : product.nameEn}</p>
                {#if product.barcode}
                  <p class="text-xs text-gray-500">{product.barcode}</p>
                {/if}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {#if product.category}
                {$locale === 'ar' ? product.category.nameAr : product.category.nameEn}
              {:else}
                -
              {/if}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              <div class="flex items-center">
                {product.quantity}
                {#if product.quantity <= product.minQuantity && product.quantity > 0}
                  <AlertTriangle class="h-4 w-4 text-yellow-500 ltr:ml-2 rtl:mr-2" />
                {/if}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              ${product.sellingPrice}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {status.class}">
                {status.text}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex gap-2">
                <a href="/inventory/products/{product.id}" class="text-blue-600 hover:text-blue-900">
                  <Edit class="h-4 w-4" />
                </a>
                <button class="text-red-600 hover:text-red-900">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>