<!-- src/routes/(app)/accounts/customers/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { 
    Plus, 
    Users, 
    Search,
    Phone,
    Mail,
    MapPin,
    Edit,
    Eye,
    MoreVertical
  } from 'lucide-svelte';
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import type { PageData } from './$types';
  
  export let data: PageData;

  let searchQuery = '';
  let showInactive = false;

  $: filteredCustomers = data.customers?.filter(customer => {
    const matchesSearch = !searchQuery || 
      customer.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.nameAr.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery);
    
    const matchesStatus = showInactive || customer.isActive;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const columns = [
    { key: 'name', label: 'Customer Name', sortable: true },
    { key: 'phone', label: 'Phone', sortable: false },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: false },
    { key: 'status', label: 'Status', sortable: false },
    { key: 'createdAt', label: 'Created', sortable: true }
  ];

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString($locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        Customers
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        Manage your customer accounts
      </p>
    </div>
    
    <a href="/accounts/customers/new" class="btn-primary btn-md">
      <Plus class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
      Add Customer
    </a>
  </div>

  <!-- Filters -->
  <div class="card p-4">
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1 relative">
        <Search class="absolute ltr:left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search customers..."
          class="input ltr:pl-10 rtl:pr-10"
        />
      </div>
      
      <label class="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          bind:checked={showInactive}
          class="rounded border-gray-300"
        />
        <span class="text-gray-700 dark:text-gray-300">Show inactive</span>
      </label>
    </div>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-blue-500 text-white">
          <Users class="h-6 w-6" />
        </div>
        <div class="ltr:ml-4 rtl:mr-4 flex-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            Total Customers
          </p>
          <p class="text-2xl font-semibold text-gray-900 dark:text-white">
            {data.customers?.length || 0}
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-green-500 text-white">
          <Users class="h-6 w-6" />
        </div>
        <div class="ltr:ml-4 rtl:mr-4 flex-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            Active Customers
          </p>
          <p class="text-2xl font-semibold text-gray-900 dark:text-white">
            {data.customers?.filter(c => c.isActive).length || 0}
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-purple-500 text-white">
          <Users class="h-6 w-6" />
        </div>
        <div class="ltr:ml-4 rtl:mr-4 flex-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            New This Month
          </p>
          <p class="text-2xl font-semibold text-gray-900 dark:text-white">
            {data.customers?.filter(c => {
              const created = new Date(c.createdAt);
              const now = new Date();
              return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
            }).length || 0}
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Customers Table -->
  <div class="card">
    <DataTable data={filteredCustomers} {columns} searchable={false}>
      <svelte:fragment slot="row" let:item>
        <!-- Name -->
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center dark:bg-gray-700">
              <Users class="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div class="ltr:ml-4 rtl:mr-4">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {$locale === 'ar' ? item.nameAr : item.nameEn}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {$locale === 'ar' ? item.nameEn : item.nameAr}
              </div>
            </div>
          </div>
        </td>

        <!-- Phone -->
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          {#if item.phone}
            <div class="flex items-center">
              <Phone class="h-4 w-4 text-gray-400 ltr:mr-2 rtl:ml-2" />
              {item.phone}
            </div>
          {:else}
            <span class="text-gray-400">—</span>
          {/if}
        </td>

        <!-- Email -->
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          {#if item.email}
            <div class="flex items-center">
              <Mail class="h-4 w-4 text-gray-400 ltr:mr-2 rtl:ml-2" />
              {item.email}
            </div>
          {:else}
            <span class="text-gray-400">—</span>
          {/if}
        </td>

        <!-- Address -->
        <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
          {#if item.address}
            <div class="flex items-start">
              <MapPin class="h-4 w-4 text-gray-400 ltr:mr-2 rtl:ml-2 mt-0.5 flex-shrink-0" />
              <span class="line-clamp-1">{item.address}</span>
            </div>
          {:else}
            <span class="text-gray-400">—</span>
          {/if}
        </td>

        <!-- Status -->
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full {item.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}">
            {item.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>

        <!-- Created Date -->
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          {formatDate(item.createdAt)}
        </td>
      </svelte:fragment>

      <!-- Actions -->
      <svelte:fragment slot="actions" let:item>
        <div class="flex justify-end gap-2">
          <a 
            href="/accounts/customers/{item.id}" 
            class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
            title={$_('accounts.viewDetails')}
          >
            <Eye class="h-4 w-4" />
          </a>
          <a 
            href="/accounts/customers/{item.id}/edit" 
            class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
            title={$_('accounts.editCustomer')}
          >
            <Edit class="h-4 w-4" />
          </a>
        </div>
      </svelte:fragment>
    </DataTable>
  </div>
</div>