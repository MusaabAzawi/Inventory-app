<!-- src/routes/(app)/cash/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { 
    Plus, 
    DollarSign, 
    TrendingUp, 
    TrendingDown, 
    ArrowUpCircle,
    ArrowDownCircle,
    Users,
    Calendar,
    Eye,
    Edit
  } from 'lucide-svelte';
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import type { PageData } from './$types';
  
  export let data: PageData = {
    transactions: [],
    stats: null
  };

  // Mock data for now
  const mockTransactions = [
    {
      id: '1',
      type: 'RECEIPT',
      amount: 1500.00,
      currency: 'USD',
      exchangeRate: 1,
      description: 'Sales payment from customer',
      createdAt: new Date().toISOString(),
      status: 'COMPLETED',
      user: { name: 'Admin User' }
    },
    {
      id: '2', 
      type: 'PAYMENT',
      amount: 850.00,
      currency: 'USD',
      exchangeRate: 1,
      description: 'Supplier payment for inventory',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'COMPLETED',
      user: { name: 'Admin User' }
    },
    {
      id: '3',
      type: 'SALARY',
      amount: 2500.00,
      currency: 'USD', 
      exchangeRate: 1,
      description: 'Monthly salary payment',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      status: 'COMPLETED',
      user: { name: 'Admin User' }
    }
  ];

  const mockStats = {
    totalReceipts: 15750.00,
    totalPayments: 12200.00,
    netCashFlow: 3550.00,
    todaysTransactions: 3
  };

  $: transactions = data.transactions?.length ? data.transactions : mockTransactions;
  $: stats = data.stats || mockStats;

  $: columns = [
    { key: 'type', label: $_('cash.type'), sortable: true },
    { key: 'description', label: $_('cash.description'), sortable: false },
    { key: 'amount', label: $_('cash.amount'), sortable: true },
    { key: 'currency', label: $_('cash.currency'), sortable: true },
    { key: 'status', label: $_('cash.status'), sortable: true },
    { key: 'createdAt', label: $_('cash.date'), sortable: true }
  ];

  function formatCurrency(amount: number, currency: string = 'USD') {
    return new Intl.NumberFormat($locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString($locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getTransactionColor(type: string) {
    switch (type.toUpperCase()) {
      case 'RECEIPT':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PAYMENT':
      case 'SALARY':
      case 'EXPENSE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'TRANSFER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  function getTransactionIcon(type: string) {
    switch (type.toUpperCase()) {
      case 'RECEIPT':
        return ArrowUpCircle;
      case 'PAYMENT':
      case 'SALARY':
      case 'EXPENSE':
        return ArrowDownCircle;
      default:
        return DollarSign;
    }
  }

  function getStatusColor(status: string) {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {$_('modules.cash.title')}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        {$_('cash.subtitle')}
      </p>
    </div>
    
    <div class="flex gap-2">
      <a href="/cash/receipt" class="btn-secondary btn-md">
        <ArrowUpCircle class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        {$_('modules.cash.receiptVoucher')}
      </a>
      <a href="/cash/payment" class="btn-primary btn-md">
        <ArrowDownCircle class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        {$_('modules.cash.paymentVoucher')}
      </a>
    </div>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <!-- Total Receipts -->
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-green-500 text-white">
          <ArrowUpCircle class="h-6 w-6" />
        </div>
        <div class="ltr:ml-4 rtl:mr-4 flex-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            {$_('cash.totalReceipts')}
          </p>
          <p class="text-2xl font-semibold text-gray-900 dark:text-white">
            {formatCurrency(stats.totalReceipts)}
          </p>
          <p class="text-xs text-green-600 dark:text-green-400">
            {$_('cash.fromLastMonth', { values: { percent: '12' } })}
          </p>
        </div>
      </div>
    </div>

    <!-- Total Payments -->
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-red-500 text-white">
          <ArrowDownCircle class="h-6 w-6" />
        </div>
        <div class="ltr:ml-4 rtl:mr-4 flex-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            {$_('cash.totalPayments')}
          </p>
          <p class="text-2xl font-semibold text-gray-900 dark:text-white">
            {formatCurrency(stats.totalPayments)}
          </p>
          <p class="text-xs text-red-600 dark:text-red-400">
            {$_('cash.fromLastMonth', { values: { percent: '8' } })}
          </p>
        </div>
      </div>
    </div>

    <!-- Net Cash Flow -->
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-blue-500 text-white">
          <TrendingUp class="h-6 w-6" />
        </div>
        <div class="ltr:ml-4 rtl:mr-4 flex-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            {$_('cash.netCashFlow')}
          </p>
          <p class="text-2xl font-semibold text-gray-900 dark:text-white">
            {formatCurrency(stats.netCashFlow)}
          </p>
          <p class="text-xs text-blue-600 dark:text-blue-400">
            {$_('cash.positiveFlow')}
          </p>
        </div>
      </div>
    </div>

    <!-- Today's Transactions -->
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center">
        <div class="p-3 rounded-full bg-purple-500 text-white">
          <Calendar class="h-6 w-6" />
        </div>
        <div class="ltr:ml-4 rtl:mr-4 flex-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
            {$_('cash.todaysTransactions')}
          </p>
          <p class="text-2xl font-semibold text-gray-900 dark:text-white">
            {stats.todaysTransactions}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {$_('cash.activeToday')}
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Transactions Table -->
  <div class="card">
    <DataTable data={transactions} {columns}>
      <svelte:fragment slot="row" let:item>
        {@const TransactionIcon = getTransactionIcon(item.type)}
        
        <!-- Type -->
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <div class="flex items-center">
            <TransactionIcon class="h-4 w-4 ltr:mr-2 rtl:ml-2 {item.type === 'RECEIPT' ? 'text-green-600' : 'text-red-600'}" />
            <span class="px-2 py-1 text-xs font-medium rounded-full {getTransactionColor(item.type)}">
              {item.type === 'RECEIPT' ? $_('cash.receipt') : item.type === 'PAYMENT' ? $_('cash.payment') : item.type === 'SALARY' ? $_('cash.salary') : item.type === 'EXPENSE' ? $_('cash.expense') : item.type === 'TRANSFER' ? $_('cash.transfer') : item.type}
            </span>
          </div>
        </td>
        
        <!-- Description -->
        <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
          <div>
            <p class="font-medium">{item.description}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {$_('cash.by', { values: { name: item.user.name } })}
            </p>
          </div>
        </td>

        <!-- Amount -->
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          <p class="font-semibold {item.type === 'RECEIPT' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
            {item.type === 'RECEIPT' ? '+' : '-'}{formatCurrency(item.amount, item.currency)}
          </p>
          {#if item.exchangeRate !== 1}
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {$_('cash.rate', { values: { rate: item.exchangeRate } })}
            </p>
          {/if}
        </td>

        <!-- Currency -->
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          {item.currency}
        </td>

        <!-- Status -->
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <span class="px-2 py-1 text-xs font-medium rounded-full {getStatusColor(item.status)}">
            {item.status === 'COMPLETED' ? $_('cash.completed') : item.status === 'PENDING' ? $_('cash.pending') : item.status === 'CANCELLED' ? $_('cash.cancelled') : item.status}
          </span>
        </td>

        <!-- Date -->
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center">
            <Calendar class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {formatDate(item.createdAt)}
          </div>
        </td>
      </svelte:fragment>

      <!-- Actions -->
      <svelte:fragment slot="actions" let:item>
        <div class="flex justify-end gap-2">
          <a 
            href="/cash/{item.id}" 
            class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
            title={$_('cash.viewDetails')}
          >
            <Eye class="h-4 w-4" />
          </a>
          <a 
            href="/cash/{item.id}/edit" 
            class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
            title={$_('cash.editTransaction')}
          >
            <Edit class="h-4 w-4" />
          </a>
        </div>
      </svelte:fragment>
    </DataTable>
  </div>

  <!-- Quick Actions -->
  <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {$_('cash.quickActions')}
    </h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <a href="/cash/receipt" class="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors dark:bg-green-900 dark:hover:bg-green-800">
        <ArrowUpCircle class="h-8 w-8 text-green-600 mb-2" />
        <span class="text-sm font-medium text-green-900 dark:text-green-100">{$_('modules.cash.receiptVoucher')}</span>
      </a>
      
      <a href="/cash/payment" class="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors dark:bg-red-900 dark:hover:bg-red-800">
        <ArrowDownCircle class="h-8 w-8 text-red-600 mb-2" />
        <span class="text-sm font-medium text-red-900 dark:text-red-100">{$_('modules.cash.paymentVoucher')}</span>
      </a>
      
      <a href="/cash/salary" class="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors dark:bg-blue-900 dark:hover:bg-blue-800">
        <Users class="h-8 w-8 text-blue-600 mb-2" />
        <span class="text-sm font-medium text-blue-900 dark:text-blue-100">{$_('modules.cash.salaryPayment')}</span>
      </a>
      
      <a href="/reports?type=cash" class="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors dark:bg-purple-900 dark:hover:bg-purple-800">
        <TrendingUp class="h-8 w-8 text-purple-600 mb-2" />
        <span class="text-sm font-medium text-purple-900 dark:text-purple-100">{$_('cash.cashReports')}</span>
      </a>
    </div>
  </div>
</div>