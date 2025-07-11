<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { enhance } from '$app/forms';
  import { locale } from 'svelte-i18n';
  
  export let product: any = null;
  export let categories: any[] = [];
  export let form: any = null;
  
  const isEdit = !!product?.id;
</script>

<form method="POST" use:enhance class="space-y-6">
  {#if form?.error}
    <div class="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
      {form.error}
    </div>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- English Name -->
    <div>
      <label for="nameEn" class="label">{$_('product.nameEnglish')}</label>
      <input
        id="nameEn"
        name="nameEn"
        type="text"
        required
        class="input"
        value={form?.nameEn ?? product?.nameEn ?? ''}
        dir="ltr"
      />
    </div>

    <!-- Arabic Name -->
    <div>
      <label for="nameAr" class="label">{$_('product.nameArabic')}</label>
      <input
        id="nameAr"
        name="nameAr"
        type="text"
        required
        class="input"
        value={form?.nameAr ?? product?.nameAr ?? ''}
        dir="rtl"
      />
    </div>

    <!-- SKU -->
    <div>
      <label for="sku" class="label">{$_('product.sku')}</label>
      <input
        id="sku"
        name="sku"
        type="text"
        required
        class="input"
        value={form?.sku ?? product?.sku ?? ''}
      />
    </div>

    <!-- Barcode -->
    <div>
      <label for="barcode" class="label">{$_('product.barcode')}</label>
      <input
        id="barcode"
        name="barcode"
        type="text"
        class="input"
        value={form?.barcode ?? product?.barcode ?? ''}
      />
    </div>

    <!-- Category -->
    <div>
      <label for="categoryId" class="label">{$_('product.category')}</label>
      <select
        id="categoryId"
        name="categoryId"
        class="input"
        value={form?.categoryId ?? product?.categoryId ?? ''}
      >
        <option value="">{$_('common.select')}</option>
        {#each categories as category}
          <option value={category.id}>
            {$locale === 'ar' ? category.nameAr : category.nameEn}
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
        value={form?.location ?? product?.location ?? ''}
      />
    </div>

    <!-- Quantity -->
    <div>
      <label for="quantity" class="label">{$_('product.quantity')}</label>
      <input
        id="quantity"
        name="quantity"
        type="number"
        min="0"
        required
        class="input"
        value={form?.quantity ?? product?.quantity ?? 0}
      />
    </div>

    <!-- Min Quantity -->
    <div>
      <label for="minQuantity" class="label">{$_('product.minQuantity')}</label>
      <input
        id="minQuantity"
        name="minQuantity"
        type="number"
        min="0"
        required
        class="input"
        value={form?.minQuantity ?? product?.minQuantity ?? 5}
      />
    </div>

    <!-- Cost Price -->
    <div>
      <label for="costPrice" class="label">{$_('product.costPrice')}</label>
      <input
        id="costPrice"
        name="costPrice"
        type="number"
        min="0"
        step="0.01"
        required
        class="input"
        value={form?.costPrice ?? product?.costPrice ?? ''}
      />
    </div>

    <!-- Selling Price -->
    <div>
      <label for="sellingPrice" class="label">{$_('product.sellingPrice')}</label>
      <input
        id="sellingPrice"
        name="sellingPrice"
        type="number"
        min="0"
        step="0.01"
        required
        class="input"
        value={form?.sellingPrice ?? product?.sellingPrice ?? ''}
      />
    </div>
  </div>

  <div class="flex justify-end gap-4">
    <a href="/inventory" class="btn-secondary btn-md">
      {$_('common.cancel')}
    </a>
    <button type="submit" class="btn-primary btn-md">
      {isEdit ? $_('common.update') : $_('common.save')}
    </button>
  </div>
</form>