<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { Plus, Edit, Trash2 } from 'lucide-svelte';
  import { enhance } from '$app/forms';
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import type { PageData } from './$types';
  
  export let data: PageData;

  const columns = [
    { key: 'nameEn', label: 'categories.nameEnglish', sortable: true },
    { key: 'nameAr', label: 'categories.nameArabic', sortable: true },
    { key: 'descriptionEn', label: 'categories.descriptionEnglish', sortable: false },
    { key: '_count.products', label: 'categories.productsCount', sortable: true },
    { key: 'createdAt', label: 'common.date', sortable: true }
  ];

  function formatDate(date: string | Date) {
    return new Date(typeof date === 'string' ? date : date.toISOString()).toLocaleDateString($locale === 'ar' ? 'ar-SA' : 'en-US');
  }

  function confirmDelete(category: any) {
    if (category._count.products > 0) {
      alert($_('categories.cannotDeleteWithProducts'));
      return;
    }
    
    if (confirm($_('categories.confirmDelete') + ` "${$locale === 'ar' ? category.nameAr : category.nameEn}"?`)) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '?/delete';
      
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'id';
      input.value = category.id;
      
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {$_('categories.title')}
      </h1>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {$_('categories.subtitle')}
      </p>
    </div>
    <a href="/categories/new" class="btn-primary btn-md">
      <Plus class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
      {$_('categories.addCategory')}
    </a>
  </div>

  <!-- Categories Table -->
  <DataTable data={data.categories} {columns}>
    <tr slot="row" let:item>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
        {item.nameEn}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {item.nameAr}
      </td>
      <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        {item.descriptionEn || '-'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {item._count.products}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {formatDate(item.createdAt)}
      </td>
    </tr>

    <td slot="actions" let:item>
      <div class="flex gap-2">
        <a href="/categories/{item.id}" class="text-blue-600 hover:text-blue-900">
          <Edit class="h-4 w-4" />
        </a>
        <button 
          on:click={() => confirmDelete(item)}
          class="text-red-600 hover:text-red-900"
          disabled={item._count.products > 0}
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
    </td>
  </DataTable>
</div>