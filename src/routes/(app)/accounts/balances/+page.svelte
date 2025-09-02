<!-- src/routes/(app)/accounts/balances/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { 
    DollarSign, 
    Users, 
    Truck, 
    TrendingUp,
    TrendingDown,
    Phone,
    Mail,
    ArrowLeft
  } from 'lucide-svelte';
  import type { PageData } from './$types';
  
  export let data: PageData;

  $: accountBalances = data.accountBalances || [];
  $: summary = data.summary || { customerOutstanding: 0, supplierOutstanding: 0, netBalance: 0 };

  // Filter balances
  $: customerBalances = accountBalances.filter(account => account.type === 'customer');
  $: supplierBalances = accountBalances.filter(account => account.type === 'supplier');

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div class="flex items-center gap-4">
      <a href="/accounts" class="btn-secondary btn-sm">
        <ArrowLeft class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        Back to Accounts
      </a>
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {$_('modules.reports.accountBalances')}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Outstanding balances for customers and suppliers
        </p>
      </div>
    </div>
  </div>

  <!-- Summary Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Customer Outstanding -->
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-blue-500 text-white">
          <Users class="h-6 w-6" />
        </div>
        <div class="ltr:ml-4 rtl:mr-4 flex-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            Customer Outstanding
          </p>
          <p class="text-2xl font-semibold text-gray-900 dark:text-white">
            {formatCurrency(summary.customerOutstanding)}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Receivables
          </p>
        </div>
      </div>
    </div>

    <!-- Supplier Outstanding -->
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-green-500 text-white">
          <Truck class="h-6 w-6" />
        </div>
        <div class="ltr:ml-4 rtl:mr-4 flex-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            Supplier Outstanding
          </p>
          <p class="text-2xl font-semibold text-gray-900 dark:text-white">
            {formatCurrency(summary.supplierOutstanding)}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Payables
          </p>
        </div>
      </div>
    </div>

    <!-- Net Balance -->
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center">
        <div class="p-3 rounded-full {summary.netBalance >= 0 ? 'bg-purple-500' : 'bg-red-500'} text-white">
          {#if summary.netBalance >= 0}
            <TrendingUp class="h-6 w-6" />
          {:else}
            <TrendingDown class="h-6 w-6" />
          {/if}
        </div>
        <div class="ltr:ml-4 rtl:mr-4 flex-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            Net Balance
          </p>
          <p class="text-2xl font-semibold {summary.netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
            {formatCurrency(Math.abs(summary.netBalance))}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {summary.netBalance >= 0 ? 'Net Receivable' : 'Net Payable'}
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Customer Balances -->
  {#if customerBalances.length > 0}
    <div class="bg-white rounded-lg shadow dark:bg-gray-800">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Users class="h-5 w-5 ltr:mr-2 rtl:ml-2 text-blue-500" />
          Customer Balances
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Customer
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Contact
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total Sales
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Paid
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Outstanding
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {#each customerBalances as customer}
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {$locale === 'ar' ? customer.nameAr : customer.nameEn}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {#if customer.phone}
                      <div class="flex items-center">
                        <Phone class="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                        {customer.phone}
                      </div>
                    {/if}
                    {#if customer.email}
                      <div class="flex items-center">
                        <Mail class="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                        {customer.email}
                      </div>
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                  {formatCurrency(customer.totalAmount)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(customer.paidAmount)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <span class="{customer.outstandingAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}">
                    {formatCurrency(customer.outstandingAmount)}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <!-- Supplier Balances -->
  {#if supplierBalances.length > 0}
    <div class="bg-white rounded-lg shadow dark:bg-gray-800">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Truck class="h-5 w-5 ltr:mr-2 rtl:ml-2 text-green-500" />
          Supplier Balances
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Supplier
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Contact
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total Purchases
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Paid
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Outstanding
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {#each supplierBalances as supplier}
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {$locale === 'ar' ? supplier.nameAr : supplier.nameEn}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {#if supplier.phone}
                      <div class="flex items-center">
                        <Phone class="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                        {supplier.phone}
                      </div>
                    {/if}
                    {#if supplier.email}
                      <div class="flex items-center">
                        <Mail class="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                        {supplier.email}
                      </div>
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                  {formatCurrency(supplier.totalAmount)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(supplier.paidAmount)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <span class="{supplier.outstandingAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}">
                    {formatCurrency(supplier.outstandingAmount)}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <!-- Empty State -->
  {#if accountBalances.length === 0}
    <div class="bg-white rounded-lg shadow p-8 text-center dark:bg-gray-800">
      <DollarSign class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No Account Balances
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        No outstanding balances found for customers or suppliers.
      </p>
    </div>
  {/if}
</div>