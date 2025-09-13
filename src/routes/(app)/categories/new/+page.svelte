<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { enhance } from '$app/forms';
  import { ArrowLeft } from 'lucide-svelte';
  import type { ActionData } from './$types';
  
  export let form: ActionData;
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center gap-4">
    <a href="/categories" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
      <ArrowLeft class="w-6 h-6" />
    </a>
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {$_('categories.addCategory')}
      </h1>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {$_('categories.subtitle')}
      </p>
    </div>
  </div>

  <!-- Form -->
  <div class="card p-6">
    <form method="POST" use:enhance class="space-y-6">
      {#if form?.error}
        <div class="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {form.error}
        </div>
      {/if}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- English Name -->
        <div>
          <label for="nameEn" class="label">
            {$_('categories.nameEnglish')} <span class="text-red-500">*</span>
          </label>
          <input
            id="nameEn"
            name="nameEn"
            type="text"
            required
            class="input"
            value={form?.nameEn ?? ''}
            dir="ltr"
            placeholder={$_('categories.enterNameEnglish')}
          />
        </div>

        <!-- Arabic Name -->
        <div>
          <label for="nameAr" class="label">
            {$_('categories.nameArabic')} <span class="text-red-500">*</span>
          </label>
          <input
            id="nameAr"
            name="nameAr"
            type="text"
            required
            class="input"
            value={form?.nameAr ?? ''}
            dir="rtl"
            placeholder={$_('categories.enterNameArabic')}
          />
        </div>

        <!-- English Description -->
        <div>
          <label for="descriptionEn" class="label">{$_('categories.descriptionEnglish')}</label>
          <textarea
            id="descriptionEn"
            name="descriptionEn"
            rows="3"
            class="input"
            value={form?.descriptionEn ?? ''}
            dir="ltr"
            placeholder={$_('categories.enterDescriptionEnglish')}
          ></textarea>
        </div>

        <!-- Arabic Description -->
        <div>
          <label for="descriptionAr" class="label">{$_('categories.descriptionArabic')}</label>
          <textarea
            id="descriptionAr"
            name="descriptionAr"
            rows="3"
            class="input"
            value={form?.descriptionAr ?? ''}
            dir="rtl"
            placeholder={$_('categories.enterDescriptionArabic')}
          ></textarea>
        </div>
      </div>

      <div class="flex justify-end gap-4">
        <a href="/categories" class="btn-secondary btn-md">
          {$_('common.cancel')}
        </a>
        <button type="submit" class="btn-primary btn-md">
          {$_('common.save')}
        </button>
      </div>
    </form>
  </div>
</div>