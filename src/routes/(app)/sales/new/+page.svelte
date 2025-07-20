<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { enhance } from '$app/forms';
  import { 
    ArrowLeft, 
    Plus, 
    Trash2, 
    Search,
    ShoppingCart,
    User,
    Scan
  } from 'lucide-svelte';
  import BarcodeScanner from '$lib/components/barcode/BarcodeScanner.svelte';
  import { notifications } from '$lib/stores/notifications';
  import type { PageData, ActionData } from './$types';
  
  export let data: PageData;
  export let form: ActionData;

  interface SaleItem {
    productId: string;
    product?: any;
    quantity: number;
    price: number;
    total: number;
  }

  let selectedItems: SaleItem[] = [];
  let selectedCustomerId = '';
  let discount = 0;
  let tax = 0;
  let paymentMethod = 'CASH';
  let notes = '';
  let productSearch = '';
  let showScanner = false;
  let scanMode: 'search' | 'add' = 'search';

  $: subtotal = selectedItems.reduce((sum, item) => sum + item.total, 0);
  $: netAmount = subtotal - discount + tax;

  $: filteredProducts = data.products.filter(product => {
    const searchLower = productSearch.toLowerCase();
    return (
      product.nameEn.toLowerCase().includes(searchLower) ||
      product.nameAr.includes(productSearch) ||
      product.sku.toLowerCase().includes(searchLower) ||
      product.barcode?.toLowerCase().includes(searchLower)
    );
  }).slice(0, 10);

  function addProduct(product: any) {
    const existingItem = selectedItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.quantity) {
        existingItem.quantity++;
        existingItem.total = existingItem.quantity * existingItem.price;
        selectedItems = selectedItems;
      } else {
        notifications.warning('Stock limit', `Only ${product.quantity} units available`);
      }
    } else {
      selectedItems = [...selectedItems, {
        productId: product.id,
        product,
        quantity: 1,
        price: product.sellingPrice,
        total: product.sellingPrice
      }];
    }
    
    productSearch = '';
  }

  function updateQuantity(index: number, quantity: number) {
    const item = selectedItems[index];
    if (quantity > 0 && quantity <= item.product.quantity) {
      item.quantity = quantity;
      item.total = item.quantity * item.price;
      selectedItems = selectedItems;
    }
  }

  function updatePrice(index: number, price: number) {
    const item = selectedItems[index];
    if (price > 0) {
      item.price = price;
      item.total = item.quantity * item.price;
      selectedItems = selectedItems;
    }
  }

  function removeItem(index: number) {
    selectedItems = selectedItems.filter((_, i) => i !== index);
  }

  async function handleBarcodeScan(barcode: string) {
    showScanner = false;
    
    try {
      const response = await fetch(`/api/products/barcode/${barcode}`);
      const result = await response.json();
      
      if (result.success && result.product) {
        if (scanMode === 'add') {
          // Find the product in our loaded products
          const product = data.products.find(p => p.id === result.product.id);
          if (product) {
            addProduct(product);
            notifications.success('Product added', `${product.nameEn} added to sale`);
          }
        } else {
          // Search mode - just set the search
          productSearch = result.product.sku;
        }
      } else {
        notifications.error('Product not found', `No product with barcode ${barcode}`);
      }
    } catch (error) {
      notifications.error('Scan error', 'Failed to lookup product');
    }
  }

  function handleSubmit(e: Event) {
    if (selectedItems.length === 0) {
      e.preventDefault();
      notifications.error('No items', 'Please add at least one item to the sale');
      return;
    }

    // Add items to form data
    const form = e.target as HTMLFormElement;
    const itemsInput = document.createElement('input');
    itemsInput.type = 'hidden';
    itemsInput.name = 'items';
    itemsInput.value = JSON.stringify(selectedItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    })));
    form.appendChild(itemsInput);
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat($locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center gap-4">
    <a href="/sales" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
      <ArrowLeft class="w-6 h-6" />
    </a>
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
      {$_('modules.sales.newSale')}
    </h1>
    <span class="text-gray-500">#{data.nextInvoiceNumber}</span>
  </div>

  {#if form?.error}
    <div class="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
      {form.error}
    </div>
  {/if}

  <form method="POST" use:enhance on:submit={handleSubmit} class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Left Column - Items -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Product Search -->
      <div class="card p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Add Products
        </h3>
        
        <div class="relative">
          <div class="flex gap-2">
            <div class="flex-1 relative">
              <Search class="absolute ltr:left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                bind:value={productSearch}
                placeholder="Search by name, SKU, or barcode..."
                class="input ltr:pl-10 rtl:pr-10"
              />
            </div>
            <button
              type="button"
              on:click={() => { scanMode = 'search'; showScanner = true; }}
              class="btn-secondary btn-md"
              title="Scan barcode"
            >
              <Scan class="h-4 w-4" />
            </button>
          </div>

          {#if productSearch && filteredProducts.length > 0}
            <div class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 dark:bg-gray-800 dark:border-gray-700">
              {#each filteredProducts as product}
                <button
                  type="button"
                  on:click={() => addProduct(product)}
                  class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                >
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {$locale === 'ar' ? product.nameAr : product.name