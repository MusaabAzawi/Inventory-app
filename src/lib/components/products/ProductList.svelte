<!-- src/lib/components/products/ProductList.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { Edit, Trash2, AlertTriangle, Eye } from 'lucide-svelte';
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
  import { notifications } from '$lib/stores/notifications';
  
  export let products: any[] = [];
  export let searchQuery = '';
  export let selectedCategory = '';
  
  let showDeleteDialog = false;
  let productToDelete: any = null;
  let deleteLoading = false;

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
      return { 
        text: $_('product.outOfStock'), 
        class: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900' 
      };
    } else if (product.quantity <= product.minQuantity) {
      return { 
        text: $_('product.lowStock'), 
        class: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900' 
      };
    }
    return { 
      text: $_('common.active'), 
      class: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900' 
    };
  }

  function confirmDelete(product: any) {
    productToDelete = product;
    showDeleteDialog = true;
  }

  async function handleDelete() {
    if (!productToDelete) return;
    
    deleteLoading = true;
    
    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        notifications.success(
          'Product Deleted',
          `${$locale === 'ar' ? productToDelete.nameAr : productToDelete.nameEn} has been deleted successfully.`
        );
        
        // Remove from local array to update UI immediately
        products = products.filter(p => p.id !== productToDelete.id);
        
        showDeleteDialog = false;
        productToDelete = null;
      } else {
        const error = await response.json();
        notifications.error('Delete Failed', error.message || 'Failed to delete product');
      }
    } catch (error) {
      notifications.error('Delete Failed', 'Network error occurred');
      console.error('Delete error:', error);
    } finally {
      deleteLoading = false;
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat($locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
</script>

<DataTable data={filteredProducts} {columns} searchable={false}>
  <svelte:fragment slot="row" let:item>
    {@const status = getStockStatus(item)}
    
    <!-- SKU Column -->
    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
      {item.sku}
    </td>
    
    <!-- Product Name Column -->
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
      <div>
        <p class="font-medium">
          {$locale === 'ar' ? item.nameAr : item.nameEn}
        </p>
        {#if item.barcode}
          <p class="text-xs text-gray-500 dark:text-gray-400 font-mono">
            {item.barcode}
          </p>
        {/if}
      </div>
    </td>
    
    <!-- Category Column -->
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
      {#if item.category}
        {$locale === 'ar' ? item.category.nameAr : item.category.nameEn}
      {:else}
        <span class="text-gray-400 italic">No category</span>
      {/if}
    </td>
    
    <!-- Quantity Column -->
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
      <div class="flex items-center">
        <span class="font-medium">{item.quantity}</span>
        {#if item.quantity <= item.minQuantity && item.quantity > 0}
          <AlertTriangle class="h-4 w-4 text-yellow-500 ltr:ml-2 rtl:mr-2" title="Low stock warning" />
        {:else if item.quantity === 0}
          <AlertTriangle class="h-4 w-4 text-red-500 ltr:ml-2 rtl:mr-2" title="Out of stock" />
        {/if}
        <span class="text-xs text-gray-500 ltr:ml-2 rtl:mr-2">
          / {item.minQuantity} min
        </span>
      </div>
    </td>
    
    <!-- Price Column -->
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
      <div>
        <p class="font-medium">{formatPrice(item.sellingPrice)}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Cost: {formatPrice(item.costPrice)}
        </p>
      </div>
    </td>
    
    <!-- Status Column -->
    <td class="px-6 py-4 whitespace-nowrap">
      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {status.class}">
        {status.text}
      </span>
    </td>
  </svelte:fragment>

  <!-- Actions Column -->
  <svelte:fragment slot="actions" let:item>
    <div class="flex justify-end gap-2">
      <a 
        href="/inventory/products/{item.id}" 
        class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        title="View details"
      >
        <Eye class="h-4 w-4" />
      </a>
      <a 
        href="/inventory/products/{item.id}/edit" 
        class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
        title="Edit product"
      >
        <Edit class="h-4 w-4" />
      </a>
      <button 
        on:click={() => confirmDelete(item)}
        class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
        title="Delete product"
      >
        <Trash2 class="h-4 w-4" />
      </button>
    </div>
  </svelte:fragment>
</DataTable>

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
  bind:open={showDeleteDialog}
  title="Delete Product"
  message={`Are you sure you want to delete "${productToDelete ? ($locale === 'ar' ? productToDelete.nameAr : productToDelete.nameEn) : ''}"? This action cannot be undone.`}
  confirmText="Delete"
  cancelText="Cancel"
  type="danger"
  loading={deleteLoading}
  on:confirm={handleDelete}
  on:cancel={() => {
    showDeleteDialog = false;
    productToDelete = null;
  }}
/>