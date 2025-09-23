<!-- src/routes/(app)/cash/[id]/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import {
    ArrowLeft,
    Edit,
    Printer,
    Calendar,
    User as UserIcon,
    DollarSign,
    ArrowUpCircle,
    ArrowDownCircle,
    Users,
    Receipt,
    CheckCircle,
    FileText
  } from 'lucide-svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  $: transaction = data.transaction;

  function formatCurrency(amount: number, currency: string = 'USD') {
    return new Intl.NumberFormat($locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString($locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getTransactionTypeIcon(type: string) {
    switch (type?.toUpperCase()) {
      case 'RECEIPT':
        return ArrowUpCircle;
      case 'PAYMENT':
        return ArrowDownCircle;
      case 'SALARY':
        return Users;
      case 'EXPENSE':
        return Receipt;
      default:
        return DollarSign;
    }
  }

  function getTransactionTypeColor(type: string) {
    switch (type?.toUpperCase()) {
      case 'RECEIPT':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PAYMENT':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'SALARY':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'EXPENSE':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  function getTransactionTypeLabel(type: string) {
    switch (type?.toUpperCase()) {
      case 'RECEIPT':
        return $_('cash.receipt');
      case 'PAYMENT':
        return $_('cash.payment');
      case 'SALARY':
        return $_('cash.salary');
      case 'EXPENSE':
        return $_('cash.expense');
      default:
        return type;
    }
  }

  function getStatusColor(status: string) {
    switch (status?.toUpperCase()) {
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

  // Check if transaction can be edited (within 24 hours and not of type RECEIPT)
  $: canEdit = (() => {
    const transactionDate = new Date(transaction.createdAt);
    const hoursDiff = (Date.now() - transactionDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24 && transaction.type !== 'RECEIPT' && transaction.status === 'COMPLETED';
  })();
</script>

<div class="space-y-6" dir={$locale === 'ar' ? 'rtl' : 'ltr'}>
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <a href="/cash" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
        <ArrowLeft class="w-6 h-6 {$locale === 'ar' ? 'rotate-180' : ''}" />
      </a>
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {$_('cash.transactionDetails')}
          {#if transaction.referenceId}
            #{transaction.referenceId}
          {:else}
            #{transaction.id.slice(-8).toUpperCase()}
          {/if}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          {formatDate(transaction.createdAt)}
        </p>
      </div>
    </div>

    <div class="flex gap-2">
      {#if canEdit}
        <a href="/cash/{transaction.id}/edit" class="btn-secondary btn-sm">
          <Edit class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {$_('cash.editTransaction')}
        </a>
      {/if}

      <button class="btn-secondary btn-sm">
        <Printer class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        {$_('cash.printReceipt')}
      </button>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Transaction Details -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Transaction Information -->
      <div class="bg-white rounded-lg shadow dark:bg-gray-800">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <svelte:component this={getTransactionTypeIcon(transaction.type)} class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            {$_('cash.transactionInformation')}
          </h3>
        </div>
        <div class="p-6 space-y-6">
          <!-- Transaction Type -->
          <div>
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">{$_('cash.type')}</label>
            <div class="mt-1">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getTransactionTypeColor(transaction.type)}">
                <svelte:component this={getTransactionTypeIcon(transaction.type)} class="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                {getTransactionTypeLabel(transaction.type)}
              </span>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">{$_('cash.description')}</label>
            <p class="text-gray-900 dark:text-white mt-1">{transaction.description}</p>
          </div>

          <!-- Reference ID -->
          {#if transaction.referenceId}
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">{$_('cash.referenceId')}</label>
              <p class="text-gray-900 dark:text-white mt-1">{transaction.referenceId}</p>
            </div>
          {/if}

          <!-- Status -->
          <div>
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">{$_('cash.status')}</label>
            <div class="mt-1">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getStatusColor(transaction.status)}">
                <CheckCircle class="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                {transaction.status}
              </span>
            </div>
          </div>

          <!-- Created By -->
          <div>
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">{$_('cash.createdBy')}</label>
            <p class="text-gray-900 dark:text-white mt-1">{transaction.user.name}</p>
          </div>

          <!-- Created Date -->
          <div>
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">{$_('cash.createdAt')}</label>
            <p class="text-gray-900 dark:text-white mt-1">{formatDate(transaction.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Amount Summary -->
    <div class="space-y-6">
      <!-- Amount Information -->
      <div class="bg-white rounded-lg shadow dark:bg-gray-800">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {$_('cash.amountInformation')}
          </h3>
        </div>
        <div class="p-6 space-y-4">
          <!-- Original Amount -->
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">{$_('cash.originalAmount')}:</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {formatCurrency(transaction.amount, transaction.currency)}
            </span>
          </div>

          <!-- Exchange Rate -->
          {#if transaction.currency !== 'USD'}
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">{$_('cash.exchangeRate')}:</span>
              <span class="font-medium text-gray-900 dark:text-white">
                1 {transaction.currency} = {transaction.exchangeRate} USD
              </span>
            </div>

            <div class="flex justify-between border-t pt-4 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">{$_('cash.convertedAmount')}:</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {formatCurrency(transaction.amount * transaction.exchangeRate, 'USD')}
              </span>
            </div>
          {/if}

          <!-- Final Amount -->
          <div class="flex justify-between text-lg font-semibold border-t pt-4 dark:border-gray-700">
            <span class="text-gray-900 dark:text-white">{$_('cash.finalAmount')}:</span>
            <span class={transaction.type === 'RECEIPT' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {transaction.type === 'RECEIPT' ? '+' : '-'}{formatCurrency(transaction.amount * transaction.exchangeRate, 'USD')}
            </span>
          </div>

          <!-- Currency -->
          <div class="mt-4">
            <span class="text-sm text-gray-600 dark:text-gray-400">{$_('cash.currency')}:</span>
            <div class="mt-1">
              <span class="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {transaction.currency}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Notes -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
        <div class="flex items-start">
          <FileText class="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 ltr:mr-2 rtl:ml-2" />
          <div class="text-sm">
            <p class="font-medium text-blue-900 dark:text-blue-100">{$_('cash.transactionNotes')}</p>
            <ul class="text-blue-700 dark:text-blue-300 mt-1 space-y-1 list-disc list-inside">
              {#if canEdit}
                <li>{$_('cash.canEditWithin24Hours')}</li>
              {:else if transaction.type === 'RECEIPT'}
                <li>{$_('cash.receiptTransactionsCannotBeEdited')}</li>
              {:else}
                <li>{$_('cash.cannotEditAfter24Hours')}</li>
              {/if}
              <li>{$_('cash.transactionsPermanentRecord')}</li>
              <li>{$_('cash.contactAdminForIssues')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>