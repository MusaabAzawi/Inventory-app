<!-- src/lib/components/ui/DataTable.svelte -->
<script lang="ts" generics="T">
  import { _ } from 'svelte-i18n';
  import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-svelte';

  export let data: T[] = [];
  export let columns: { key: string; label: string; sortable?: boolean }[] = [];
  export let searchable = true;
  export let pageSize = 10;
  export let loading = false;
  export let showActions = true;

  let searchTerm = '';
  let sortKey = '';
  let sortDirection: 'asc' | 'desc' = 'asc';
  let currentPage = 1;

  $: filteredData = data.filter(item => {
    if (!searchTerm) return true;
    return Object.values(item as object).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  $: sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    
    // Handle nested properties (e.g., "category.nameEn")
    const getNestedValue = (obj: any, path: string) => {
      return path.split('.').reduce((current, prop) => current?.[prop], obj);
    };
    
    const aVal = getNestedValue(a, sortKey);
    const bVal = getNestedValue(b, sortKey);
    
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return sortDirection === 'asc' ? 1 : -1;
    if (bVal == null) return sortDirection === 'asc' ? -1 : 1;
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  $: paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  $: totalPages = Math.ceil(sortedData.length / pageSize);

  function handleSort(key: string) {
    if (sortKey === key) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDirection = 'asc';
    }
  }

  function goToPage(page: number) {
    currentPage = Math.max(1, Math.min(page, totalPages));
  }

  // Reset to first page when search changes
  $: if (searchTerm) {
    currentPage = 1;
  }
</script>

<div class="bg-white rounded-lg shadow dark:bg-gray-800">
  <!-- Header with Search -->
  {#if searchable}
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="relative">
        <Search class="absolute ltr:left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          bind:value={searchTerm}
          placeholder={$_('common.search')}
          class="ltr:pl-10 rtl:pr-10 ltr:pr-4 rtl:pl-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
    </div>
  {/if}

  <!-- Table -->
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-700">
        <tr>
          {#each columns as column}
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 select-none"
              class:cursor-pointer={column.sortable}
              class:hover:bg-gray-100={column.sortable}
              class:dark:hover:bg-gray-600={column.sortable}
              on:click={() => column.sortable && handleSort(column.key)}
              on:keydown={(e) => {
                if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleSort(column.key);
                }
              }}
              tabindex={column.sortable ? 0 : -1}
              role={column.sortable ? 'button' : 'columnheader'}
            >
              <div class="flex items-center gap-1">
                {$_(column.label)}
                {#if column.sortable && sortKey === column.key}
                  {#if sortDirection === 'asc'}
                    <ChevronUp class="w-4 h-4" />
                  {:else}
                    <ChevronDown class="w-4 h-4" />
                  {/if}
                {/if}
              </div>
            </th>
          {/each}
          {#if showActions}
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
              {$_('common.actions')}
            </th>
          {/if}
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
        {#if loading}
          <tr>
            <td colspan={columns.length + (showActions ? 1 : 0)} class="px-6 py-12 text-center">
              <div class="flex justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </td>
          </tr>
        {:else if paginatedData.length === 0}
          <tr>
            <td colspan={columns.length + (showActions ? 1 : 0)} class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
              {searchTerm ? $_('common.noResults') : $_('common.noData')}
            </td>
          </tr>
        {:else}
          {#each paginatedData as item, index}
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <!-- Custom row content slot -->
              <slot name="row" {item} {index}>
                <!-- Default row rendering -->
                {#each columns as column}
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {#if column.key.includes('.')}
                      {column.key.split('.').reduce((obj, key) => obj?.[key], item) || '-'}
                    {:else}
                      {item[column.key] || '-'}
                    {/if}
                  </td>
                {/each}
              </slot>
              
              {#if showActions}
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <slot name="actions" {item} {index}>
                    <!-- Default actions if none provided -->
                    <div class="flex justify-end gap-2">
                      <button class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        Edit
                      </button>
                      <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        Delete
                      </button>
                    </div>
                  </slot>
                </td>
              {/if}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  <!-- Pagination -->
  {#if totalPages > 1}
    <div class="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 dark:border-gray-700">
      <div class="text-sm text-gray-700 dark:text-gray-300">
        Showing {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
      </div>
      
      <div class="flex items-center gap-2">
        <button
          on:click={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          class="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
          aria-label="Previous page"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        
        {#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
          return page;
        }) as page}
          {#if page <= totalPages}
            <button
              on:click={() => goToPage(page)}
              class="px-3 py-2 border rounded-md text-sm transition-colors"
              class:bg-blue-600={page === currentPage}
              class:text-white={page === currentPage}
              class:border-blue-600={page === currentPage}
              class:border-gray-300={page !== currentPage}
              class:hover:bg-gray-50={page !== currentPage}
              class:dark:border-gray-600={page !== currentPage}
              class:dark:hover:bg-gray-700={page !== currentPage}
              class:dark:text-gray-300={page !== currentPage}
              aria-label="Page {page}"
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          {/if}
        {/each}
        
        <button
          on:click={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          class="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
          aria-label="Next page"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  {/if}
</div>