<!-- src/routes/(app)/accounts/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { 
    Plus, 
    Users, 
    Truck, 
    DollarSign, 
    TrendingUp, 
    Eye, 
    Edit, 
    Phone,
    Mail,
    MapPin
  } from 'lucide-svelte';
  import type { PageData } from './$types';
  
  export let data: PageData = {
    customers: [],
    suppliers: [],
    stats: null
  };

  // Mock data for now - will be replaced with server data
  const mockCustomers = [
    {
      id: '1',
      nameEn: 'John Doe',
      nameAr: 'جون دو',
      phone: '+1234567890',
      email: 'john@example.com',
      address: '123 Main St',
      isActive: true
    },
    {
      id: '2', 
      nameEn: 'Jane Smith',
      nameAr: 'جين سميث',
      phone: '+1234567891',
      email: 'jane@example.com',
      address: '456 Oak Ave',
      isActive: true
    }
  ];

  const mockSuppliers = [
    {
      id: '1',
      nameEn: 'TechCorp Suppliers',
      nameAr: 'موردين تك كورب',
      phone: '+1-555-0100',
      email: 'supplier@techcorp.com',
      address: '123 Supplier Street, Business District',
      isActive: true
    }
  ];

  const mockStats = {
    customers: {
      total: mockCustomers.length,
      active: mockCustomers.filter(c => c.isActive).length
    },
    suppliers: {
      total: mockSuppliers.length,
      active: mockSuppliers.filter(s => s.isActive).length
    }
  };

  $: customers = data.customers?.length ? data.customers : mockCustomers;
  $: suppliers = data.suppliers?.length ? data.suppliers : mockSuppliers;
  $: stats = data.stats || mockStats;
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {$_('modules.accounts.title')}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        Manage customers and suppliers
      </p>
    </div>
    
    <div class="flex gap-2">
      <a href="/accounts/customers/new" class="btn-secondary btn-md">
        <Plus class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        Add Customer
      </a>
      <a href="/accounts/suppliers/new" class="btn-primary btn-md">
        <Plus class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        {$_('modules.accounts.addSupplier')}
      </a>
    </div>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <!-- Total Customers -->
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
            {stats.customers.total}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {stats.customers.active} active
          </p>
        </div>
      </div>
    </div>

    <!-- Total Suppliers -->
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-green-500 text-white">
          <Truck class="h-6 w-6" />
        </div>
        <div class="ltr:ml-4 rtl:mr-4 flex-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            Total Suppliers
          </p>
          <p class="text-2xl font-semibold text-gray-900 dark:text-white">
            {stats.suppliers.total}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {stats.suppliers.active} active
          </p>
        </div>
      </div>
    </div>

    <!-- Account Balances -->
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-yellow-500 text-white">
          <DollarSign class="h-6 w-6" />
        </div>
        <div class="ltr:ml-4 rtl:mr-4 flex-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            {$_('modules.reports.accountBalances')}
          </p>
          <p class="text-2xl font-semibold text-gray-900 dark:text-white">
            $12,500
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Outstanding
          </p>
        </div>
      </div>
    </div>

    <!-- Performance -->
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-purple-500 text-white">
          <TrendingUp class="h-6 w-6" />
        </div>
        <div class="ltr:ml-4 rtl:mr-4 flex-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            This Month
          </p>
          <p class="text-2xl font-semibold text-gray-900 dark:text-white">
            +15%
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            New accounts
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Customers Section -->
  <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        Recent Customers
      </h2>
      <a href="/accounts/customers" class="text-blue-600 hover:text-blue-500 text-sm font-medium">
        View all →
      </a>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each customers.slice(0, 6) as customer}
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow dark:border-gray-700">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900">
                <Users class="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div class="ltr:ml-3 rtl:mr-3">
                <h3 class="font-medium text-gray-900 dark:text-white">
                  {$locale === 'ar' ? customer.nameAr : customer.nameEn}
                </h3>
                <span class="text-xs px-2 py-1 rounded-full {customer.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}">
                  {customer.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div class="flex gap-2">
              <a href="/accounts/customers/{customer.id}" class="text-gray-400 hover:text-gray-600">
                <Eye class="h-4 w-4" />
              </a>
              <a href="/accounts/customers/{customer.id}/edit" class="text-gray-400 hover:text-gray-600">
                <Edit class="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {#if customer.phone}
              <div class="flex items-center">
                <Phone class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {customer.phone}
              </div>
            {/if}
            {#if customer.email}
              <div class="flex items-center">
                <Mail class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {customer.email}
              </div>
            {/if}
            {#if customer.address}
              <div class="flex items-center">
                <MapPin class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {customer.address}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Suppliers Section -->
  <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        Active Suppliers
      </h2>
      <a href="/accounts/suppliers" class="text-blue-600 hover:text-blue-500 text-sm font-medium">
        View all →
      </a>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each suppliers.slice(0, 6) as supplier}
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow dark:border-gray-700">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center dark:bg-green-900">
                <Truck class="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div class="ltr:ml-3 rtl:mr-3">
                <h3 class="font-medium text-gray-900 dark:text-white">
                  {$locale === 'ar' ? supplier.nameAr : supplier.nameEn}
                </h3>
                <span class="text-xs px-2 py-1 rounded-full {supplier.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}">
                  {supplier.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div class="flex gap-2">
              <a href="/accounts/suppliers/{supplier.id}" class="text-gray-400 hover:text-gray-600">
                <Eye class="h-4 w-4" />
              </a>
              <a href="/accounts/suppliers/{supplier.id}/edit" class="text-gray-400 hover:text-gray-600">
                <Edit class="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {#if supplier.phone}
              <div class="flex items-center">
                <Phone class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {supplier.phone}
              </div>
            {/if}
            {#if supplier.email}
              <div class="flex items-center">
                <Mail class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {supplier.email}
              </div>
            {/if}
            {#if supplier.address}
              <div class="flex items-center">
                <MapPin class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {supplier.address}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      Quick Actions
    </h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <a href="/accounts/customers/new" class="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors dark:bg-blue-900 dark:hover:bg-blue-800">
        <Users class="h-8 w-8 text-blue-600 mb-2" />
        <span class="text-sm font-medium text-blue-900 dark:text-blue-100">{$_('modules.accounts.addAccount')}</span>
      </a>
      
      <a href="/accounts/suppliers/new" class="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors dark:bg-green-900 dark:hover:bg-green-800">
        <Truck class="h-8 w-8 text-green-600 mb-2" />
        <span class="text-sm font-medium text-green-900 dark:text-green-100">{$_('modules.accounts.addSupplier')}</span>
      </a>
      
      <a href="/reports?type=accounts" class="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors dark:bg-purple-900 dark:hover:bg-purple-800">
        <DollarSign class="h-8 w-8 text-purple-600 mb-2" />
        <span class="text-sm font-medium text-purple-900 dark:text-purple-100">{$_('modules.reports.accountBalances')}</span>
      </a>
      
      <a href="/reports?type=statements" class="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors dark:bg-orange-900 dark:hover:bg-orange-800">
        <TrendingUp class="h-8 w-8 text-orange-600 mb-2" />
        <span class="text-sm font-medium text-orange-900 dark:text-orange-100">{$_('modules.reports.accountStatement')}</span>
      </a>
    </div>
  </div>
</div>