<!-- src/routes/(app)/categories/[id]/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { enhance } from '$app/forms';
  import { ArrowLeft, Save, Package } from 'lucide-svelte';
  import type { PageData, ActionData } from './$types';
  
  export let data: PageData;
  export let form: ActionData;
  
  let isSubmitting = false;

  function handleSubmit() {
    return async ({ result }) => {
      isSubmitting = false;
      
      if (result.type === 'success') {
        // Handle success - redirect will happen automatically
      } else if (result.type === 'failure') {
        // Error handling is done through the form.error display
      }
    };
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center gap-4">
    <a href="/categories" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
      <ArrowLeft class="w-6 h-6" />
    </a>
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        Edit Category
      </h1>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
        Update category information
      </p>
    </div>
  </div>

  <!-- Category Info Card -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900 dark:border-blue-700">
    <div class="flex items-center gap-3">
      <Package class="h-5 w-5 text-blue-600 dark:text-blue-400" />
      <div>
        <p class="font-medium text-blue-900 dark:text-blue-100">
          {data.category.nameEn} / {data.category.nameAr}
        </p>
        <p class="text-sm text-blue-700 dark:text-blue-300">
          {data.category._count.products} product{data.category._count.products !== 1 ? 's' : ''} in this category
        </p>
      </div>
    </div>
  </div>

  <!-- Form -->
  <div class="card p-6">
    <form 
      method="POST" 
      use:enhance={handleSubmit}
      on:submit={() => isSubmitting = true}
      class="space-y-6"
    >
      {#if form?.error}
        <div class="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {form.error}
        </div>
      {/if}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- English Name -->
        <div>
          <label for="nameEn" class="label">
            English Name <span class="text-red-500">*</span>
          </label>
          <input
            id="nameEn"
            name="nameEn"
            type="text"
            required
            class="input"
            value={form?.nameEn ?? data.category.nameEn}
            dir="ltr"
            placeholder="Enter category name in English"
          />
        </div>

        <!-- Arabic Name -->
        <div>
          <label for="nameAr" class="label">
            Arabic Name <span class="text-red-500">*</span>
          </label>
          <input
            id="nameAr"
            name="nameAr"
            type="text"
            required
            class="input"
            value={form?.nameAr ?? data.category.nameAr}
            dir="rtl"
            placeholder="أدخل اسم التصنيف بالعربية"
          />
        </div>

        <!-- English Description -->
        <div>
          <label for="descriptionEn" class="label">English Description</label>
          <textarea
            id="descriptionEn"
            name="descriptionEn"
            rows="3"
            class="input"
            value={form?.descriptionEn ?? data.category.descriptionEn ?? ''}
            dir="ltr"
            placeholder="Optional description in English"
          ></textarea>
        </div>

        <!-- Arabic Description -->
        <div>
          <label for="descriptionAr" class="label">Arabic Description</label>
          <textarea
            id="descriptionAr"
            name="descriptionAr"
            rows="3"
            class="input"
            value={form?.descriptionAr ?? data.category.descriptionAr ?? ''}
            dir="rtl"
            placeholder="وصف اختياري بالعربية"
          ></textarea>
        </div>
      </div>

      <div class="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <a href="/categories" class="btn-secondary btn-md">
          <ArrowLeft class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {$_('common.cancel')}
        </a>
        <button 
          type="submit" 
          class="btn-primary btn-md"
          disabled={isSubmitting}
        >
          {#if isSubmitting}
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current ltr:mr-2 rtl:ml-2"></div>
          {:else}
            <Save class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {/if}
          {$_('common.update')}
        </button>
      </div>
    </form>
  </div>
</div>