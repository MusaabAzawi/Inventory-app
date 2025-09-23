<!-- src/routes/(app)/cash/[id]/edit/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import {
    ArrowLeft,
    Save,
    X,
    DollarSign,
    User as UserIcon,
    Calendar,
    FileText,
    Users,
    Receipt
  } from 'lucide-svelte';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  $: transaction = data.transaction;
  $: employees = data.employees;
  $: expenseCategories = data.expenseCategories;

  // Form data
  let formData = {
    type: transaction.type,
    amount: transaction.amount,
    currency: transaction.currency,
    exchangeRate: transaction.exchangeRate,
    description: transaction.description || '',
    referenceId: transaction.referenceId || '',
    employeeId: transaction.employeeId || '',
    expenseCategoryId: transaction.expenseCategoryId || '',
    status: transaction.status
  };

  let isSubmitting = false;

  // Transaction type options
  const transactionTypes = [
    { value: 'PAYMENT', labelKey: 'cash.payment' },
    { value: 'SALARY', labelKey: 'cash.salary' },
    { value: 'EXPENSE', labelKey: 'cash.expense' },
    { value: 'TRANSFER', labelKey: 'cash.transfer' }
  ];

  const statusOptions = [
    { value: 'COMPLETED', labelKey: 'cash.completed' },
    { value: 'PENDING', labelKey: 'cash.pending' },
    { value: 'CANCELLED', labelKey: 'cash.cancelled' }
  ];

  const currencies = [
    { value: 'IQD', label: 'IQD' },
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' }
  ];

  function handleSubmit() {
    return async ({ result }: { result: any }) => {
      isSubmitting = false;
      if (result.type === 'redirect') {
        await goto(result.location);
      }
    };
  }

  function handleCancel() {
    goto(`/cash/${transaction.id}`);
  }

  // Update exchange rate based on currency
  function updateExchangeRate() {
    if (formData.currency === 'USD') {
      formData.exchangeRate = 1;
    } else if (formData.currency === 'IQD') {
      formData.exchangeRate = 1310; // Default IQD rate
    } else if (formData.currency === 'EUR') {
      formData.exchangeRate = 0.85; // Default EUR rate
    }
  }

  $: if (formData.currency) {
    updateExchangeRate();
  }
</script>

<div class="space-y-6" dir={$locale === 'ar' ? 'rtl' : 'ltr'}>
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <button
        on:click={handleCancel}
        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ArrowLeft class="w-6 h-6 {$locale === 'ar' ? 'rotate-180' : ''}" />
      </button>
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {$_('cash.editTransaction')}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          {$_('cash.transactionId')}:
          {#if transaction.referenceId}
            #{transaction.referenceId}
          {:else}
            #{transaction.id.slice(-8).toUpperCase()}
          {/if}
        </p>
      </div>
    </div>
  </div>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
      <p class="text-red-700 dark:text-red-300">{form.error}</p>
    </div>
  {/if}

  <!-- Edit Form -->
  <form
    method="POST"
    use:enhance={handleSubmit}
    class="space-y-6"
  >
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Transaction Details -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Transaction Information -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <FileText class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            {$_('cash.transactionInformation')}
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Transaction Type -->
            <div>
              <label for="type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {$_('cash.type')} *
              </label>
              <select
                id="type"
                name="type"
                bind:value={formData.type}
                required
                class="input-field"
              >
                {#each transactionTypes as type}
                  <option value={type.value}>
                    {$_(type.labelKey)}
                  </option>
                {/each}
              </select>
            </div>

            <!-- Status -->
            <div>
              <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {$_('cash.status')} *
              </label>
              <select
                id="status"
                name="status"
                bind:value={formData.status}
                required
                class="input-field"
              >
                {#each statusOptions as status}
                  <option value={status.value}>
                    {$_(status.labelKey)}
                  </option>
                {/each}
              </select>
            </div>

            <!-- Amount -->
            <div>
              <label for="amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {$_('cash.amount')} *
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 {$locale === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none">
                  <DollarSign class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  bind:value={formData.amount}
                  step="0.01"
                  min="0"
                  required
                  class="input-field {$locale === 'ar' ? 'pr-10' : 'pl-10'}"
                  placeholder="0.00"
                />
              </div>
            </div>

            <!-- Currency -->
            <div>
              <label for="currency" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {$_('cash.currency')} *
              </label>
              <select
                id="currency"
                name="currency"
                bind:value={formData.currency}
                required
                class="input-field"
              >
                {#each currencies as currency}
                  <option value={currency.value}>
                    {currency.label}
                  </option>
                {/each}
              </select>
            </div>

            <!-- Exchange Rate -->
            <div>
              <label for="exchangeRate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {$_('cash.exchangeRate')} *
              </label>
              <input
                type="number"
                id="exchangeRate"
                name="exchangeRate"
                bind:value={formData.exchangeRate}
                step="0.0001"
                min="0"
                required
                class="input-field"
                placeholder="1.0000"
              />
            </div>

            <!-- Reference ID -->
            <div>
              <label for="referenceId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {$_('cash.referenceId')}
              </label>
              <input
                type="text"
                id="referenceId"
                name="referenceId"
                bind:value={formData.referenceId}
                class="input-field"
                placeholder={$_('cash.referenceIdPlaceholder')}
              />
            </div>
          </div>

          <!-- Description -->
          <div class="mt-6">
            <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {$_('cash.description')}
            </label>
            <textarea
              id="description"
              name="description"
              bind:value={formData.description}
              rows="3"
              class="input-field"
              placeholder={$_('cash.descriptionPlaceholder')}
            ></textarea>
          </div>
        </div>

        <!-- Conditional Fields -->
        {#if formData.type === 'SALARY'}
          <div class="bg-white rounded-lg shadow dark:bg-gray-800 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Users class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
              {$_('cash.employeeInformation')}
            </h3>

            <!-- Employee Selection -->
            <div>
              <label for="employeeId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {$_('cash.employee')} *
              </label>
              <select
                id="employeeId"
                name="employeeId"
                bind:value={formData.employeeId}
                required={formData.type === 'SALARY'}
                class="input-field"
              >
                <option value="">{$_('cash.selectEmployee')}</option>
                {#each employees as employee}
                  <option value={employee.id}>
                    {$locale === 'ar' ? employee.nameAr : employee.nameEn}
                  </option>
                {/each}
              </select>
            </div>
          </div>
        {/if}

        {#if formData.type === 'EXPENSE'}
          <div class="bg-white rounded-lg shadow dark:bg-gray-800 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Receipt class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
              {$_('cash.expenseInformation')}
            </h3>

            <!-- Expense Category Selection -->
            <div>
              <label for="expenseCategoryId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {$_('cash.expenseCategory')} *
              </label>
              <select
                id="expenseCategoryId"
                name="expenseCategoryId"
                bind:value={formData.expenseCategoryId}
                required={formData.type === 'EXPENSE'}
                class="input-field"
              >
                <option value="">{$_('cash.selectExpenseCategory')}</option>
                {#each expenseCategories as category}
                  <option value={category.id}>
                    {$locale === 'ar' ? category.nameAr : category.nameEn}
                  </option>
                {/each}
              </select>
            </div>
          </div>
        {/if}
      </div>

      <!-- Summary & Actions -->
      <div class="space-y-6">
        <!-- Amount Summary -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {$_('cash.transactionSummary')}
          </h3>

          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">{$_('cash.originalAmount')}:</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {formData.amount} {formData.currency}
              </span>
            </div>

            {#if formData.currency !== 'USD'}
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">{$_('cash.exchangeRate')}:</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  1 {formData.currency} = {formData.exchangeRate} USD
                </span>
              </div>

              <div class="flex justify-between border-t pt-3 dark:border-gray-700">
                <span class="text-gray-600 dark:text-gray-400">{$_('cash.convertedAmount')}:</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  ${(formData.amount * formData.exchangeRate).toFixed(2)} USD
                </span>
              </div>
            {/if}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800 p-6">
          <div class="space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              class="btn-primary btn-md w-full"
            >
              <Save class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {isSubmitting ? $_('cash.saving') : $_('cash.saveChanges')}
            </button>

            <button
              type="button"
              on:click={handleCancel}
              class="btn-secondary btn-md w-full"
            >
              <X class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {$_('cash.cancel')}
            </button>
          </div>
        </div>

        <!-- Edit Notes -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div class="text-sm">
            <p class="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
              {$_('cash.editingNotes')}
            </p>
            <ul class="text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
              <li>{$_('cash.canEditWithin24Hours')}</li>
              <li>{$_('cash.receiptTransactionsCannotBeEdited')}</li>
              <li>{$_('cash.editingWillUpdateRecord')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </form>
</div>