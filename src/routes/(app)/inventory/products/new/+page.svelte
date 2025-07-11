<!-- src/routes/(app)/inventory/products/new/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import ProductForm from '$lib/components/products/ProductForm.svelte';
  import type { PageData, ActionData } from './$types';
  
  export let data: PageData;
  export let form: ActionData;
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
      {$_('modules.inventory.addProduct')}
    </h1>
  </div>

  <!-- Form -->
  <div class="card p-6">
    <ProductForm categories={data.categories} {form} />
  </div>
</div>