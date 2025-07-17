<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { Edit, Trash2, AlertTriangle } from 'lucide-svelte';
  import DataTable from '$lib/components/ui/DataTable.svelte';
  
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

  const columns = [
    { key: 'sku', label: 'product.sku', sortable: true },
    { key: 'nameEn', label: 'product.name', sortable: true },
    { key: 'category.nameEn', label: 'product.category', sortable: true },
    { key: 'quantity', label: 'product.quantity', sortable: true },
    { key: 'sellingPrice', label: 'product.price', sortable: true },
    { key: 'status', label: 'common.status', sortable: false }
  ];
  
  function getStockStatus(product: any) {
    if (product.quantity === 0) {
      return { text: $_('product.outOfStock'), class: 'text-red-600 bg-red-50' };
    } else if (product.quantity <= product.minQuantity) {
      return { text: $_('product.lowStock'), class: 'text-yellow-600 bg-yellow-50' };
    }
    return { text: $_('common.active'), class: 'text-green-600 bg-green-50' };
  }
</script>

<DataTable data={filteredProducts} {columns} searchable={false}>
  <svelte:fragment slot="row" let:item>
    {@const status = getStockStatus(item)}
    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
      {item.sku}
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
      <div>
        <p class="font-medium">{$locale === 'ar' ? item.nameAr : item.nameEn}</p>
        {#if item.barcode}
          <p class="text-xs text-gray-500">{item.barcode}</p>
        {/if}
      </div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
      {#if item.category}
        {$locale === 'ar' ? item.category.nameAr : item.category.nameEn}
      {:else}
        -
      {/if}
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
      <div class="flex items-center">
        {item.quantity}
        {#if item.quantity <= item.minQuantity && item.quantity > 0}
          <AlertTriangle class="h-4 w-4 text-yellow-500 ltr:ml-2 rtl:mr-2" />
        {/if}
      </div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
      ${item.sellingPrice}
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {status.class}">
        {status.text}
      </span>
    </td>
  </svelte:fragment>

  <div slot="actions" let:item class="flex gap-2">
    <a href="/inventory/products/{item.id}" class="text-blue-600 hover:text-blue-900">
      <Edit class="h-4 w-4" />
    </a>
    <button class="text-red-600 hover:text-red-900">
      <Trash2 class="h-4 w-4" />
    </button>
  </div>
</DataTable>