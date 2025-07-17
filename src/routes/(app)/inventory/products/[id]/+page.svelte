<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { ArrowLeft } from 'lucide-svelte';
  import ProductForm from '$lib/components/products/ProductForm.svelte';
  import type { PageData, ActionData } from './$types';
  
  export let data: PageData;
  export let form: ActionData;
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center gap-4">
    <a href="/inventory" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
      <ArrowLeft class="w-6 h-6" />
    </a>
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
      {$_('product.editProduct')}
    </h1>
  </div>

  <!-- Form -->
  <div class="card p-6">
    <ProductForm product={data.product} categories={data.categories} {form} />
  </div>
</div>