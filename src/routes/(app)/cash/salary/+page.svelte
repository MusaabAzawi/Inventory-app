<!-- src/routes/(app)/cash/salary/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { 
    Users, 
    DollarSign, 
    FileText, 
    Calendar,
    ArrowLeft,
    User,
    Clock
  } from 'lucide-svelte';
  import type { PageData, ActionData } from './$types';
  
  export let data: PageData;
  export let form: ActionData;

  let isSubmitting = false;
  let amount = '';
  let currency = data.defaultCurrency || 'USD';
  let exchangeRate = 1;
  let description = '';
  let referenceId = '';
  let employeeName = '';
  let salaryPeriod = '';
  let salaryType = 'MONTHLY';

  $: formValid = amount && parseFloat(amount) > 0 && description.trim() && exchangeRate > 0 && employeeName.trim() && salaryPeriod.trim();

  function resetForm() {
    amount = '';
    currency = data.defaultCurrency || 'USD';
    exchangeRate = 1;
    description = '';
    referenceId = '';
    employeeName = '';
    salaryPeriod = '';
    salaryType = 'MONTHLY';
  }

  function formatCurrency(value: number, curr: string = 'USD') {
    return new Intl.NumberFormat($locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: curr
    }).format(value);
  }

  $: convertedAmount = amount ? parseFloat(amount) * exchangeRate : 0;
  
  $: selectedEmployee = data.employees.find(e => e.name === employeeName);

  function updateDescription() {
    if (employeeName && salaryType) {
      const typeLabel = data.salaryTypes.find(t => t.id === salaryType)?.label.toLowerCase() || 'salary';
      description = `${typeLabel} payment for ${employeeName}${salaryPeriod ? ` - ${salaryPeriod}` : ''}`;
    }
  }

  $: if (employeeName && salaryType) {
    updateDescription();
  }

  function generateSalaryPeriod() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.toLocaleDateString('en-US', { month: 'long' });
    
    if (salaryType === 'MONTHLY') {
      salaryPeriod = `${month} ${year}`;
    } else if (salaryType === 'WEEKLY') {
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      salaryPeriod = `Week ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
    } else if (salaryType === 'DAILY') {
      salaryPeriod = today.toLocaleDateString();
    } else {
      salaryPeriod = `${month} ${year}`;
    }
  }

  $: if (salaryType) {
    generateSalaryPeriod();
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center gap-4">
    <a href="/cash" class="btn-secondary btn-sm">
      <ArrowLeft class="h-4 w-4" />
    </a>
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Users class="h-6 w-6 text-blue-600" />
        {$_('modules.cash.salaryPayment')}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        {$_('cash.salarySubtitle')}
      </p>
    </div>
  </div>

  <!-- Salary Form -->
  <div class="max-w-2xl">
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-3 bg-blue-100 rounded-full dark:bg-blue-900">
          <DollarSign class="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {$_('cash.newSalary')}
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {$_('cash.salaryFormDescription')}
          </p>
        </div>
      </div>

      {#if form?.error}
        <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p class="text-sm text-red-600 dark:text-red-400">{form.error}</p>
        </div>
      {/if}

      <form 
        method="POST" 
        action="?/create"
        use:enhance={({ formElement, formData, action, cancel }) => {
          isSubmitting = true;
          
          return async ({ result, update }) => {
            if (result.type === 'success' || result.type === 'redirect') {
              resetForm();
            }
            isSubmitting = false;
            await update();
          };
        }}
        class="space-y-6"
      >
        <!-- Employee Selection -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="employeeName" class="label">
              {$_('cash.employee')} *
            </label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="employeeName"
                name="employeeName"
                type="text"
                bind:value={employeeName}
                list="employees"
                required
                class="input pl-10"
                placeholder={$_('cash.employeePlaceholder')}
                class:border-red-300={form?.fields?.employeeName}
              />
              <datalist id="employees">
                {#each data.employees as employee}
                  <option value={employee.name}>{employee.name} - {employee.role}</option>
                {/each}
              </datalist>
            </div>
            {#if form?.fields?.employeeName}
              <p class="text-sm text-red-600 mt-1">{form.fields.employeeName[0]}</p>
            {/if}
          </div>

          <div>
            <label for="salaryType" class="label">
              {$_('cash.salaryType')} *
            </label>
            <select
              id="salaryType"
              name="salaryType"
              bind:value={salaryType}
              required
              class="input"
              class:border-red-300={form?.fields?.salaryType}
            >
              {#each data.salaryTypes as type}
                <option value={type.id}>{type.label}</option>
              {/each}
            </select>
            {#if form?.fields?.salaryType}
              <p class="text-sm text-red-600 mt-1">{form.fields.salaryType[0]}</p>
            {/if}
          </div>
        </div>

        <!-- Salary Period -->
        <div>
          <label for="salaryPeriod" class="label">
            {$_('cash.salaryPeriod')} *
          </label>
          <div class="relative">
            <Calendar class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="salaryPeriod"
              name="salaryPeriod"
              type="text"
              bind:value={salaryPeriod}
              required
              class="input pl-10"
              placeholder={$_('cash.salaryPeriodPlaceholder')}
              class:border-red-300={form?.fields?.salaryPeriod}
            />
          </div>
          {#if form?.fields?.salaryPeriod}
            <p class="text-sm text-red-600 mt-1">{form.fields.salaryPeriod[0]}</p>
          {:else}
            <p class="text-sm text-gray-500 mt-1">
              {$_('cash.salaryPeriodHint')}
            </p>
          {/if}
        </div>

        <!-- Amount and Currency -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="amount" class="label">
              {$_('cash.amount')} *
            </label>
            <div class="relative">
              <DollarSign class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                bind:value={amount}
                required
                class="input pl-10"
                placeholder="0.00"
                class:border-red-300={form?.fields?.amount}
              />
            </div>
            {#if form?.fields?.amount}
              <p class="text-sm text-red-600 mt-1">{form.fields.amount[0]}</p>
            {/if}
          </div>

          <div>
            <label for="currency" class="label">
              {$_('cash.currency')} *
            </label>
            <select
              id="currency"
              name="currency"
              bind:value={currency}
              required
              class="input"
              class:border-red-300={form?.fields?.currency}
            >
              {#each data.currencies as curr}
                <option value={curr}>{curr}</option>
              {/each}
            </select>
            {#if form?.fields?.currency}
              <p class="text-sm text-red-600 mt-1">{form.fields.currency[0]}</p>
            {/if}
          </div>
        </div>

        <!-- Exchange Rate -->
        <div>
          <label for="exchangeRate" class="label">
            {$_('cash.exchangeRate')} *
          </label>
          <div class="relative">
            <input
              id="exchangeRate"
              name="exchangeRate"
              type="number"
              step="0.0001"
              min="0"
              bind:value={exchangeRate}
              required
              class="input"
              placeholder="1.0000"
              class:border-red-300={form?.fields?.exchangeRate}
            />
            {#if currency !== 'USD'}
              <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                1 {currency} = {exchangeRate} USD
              </div>
            {/if}
          </div>
          {#if form?.fields?.exchangeRate}
            <p class="text-sm text-red-600 mt-1">{form.fields.exchangeRate[0]}</p>
          {/if}
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="label">
            {$_('cash.description')} *
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            bind:value={description}
            required
            class="input"
            placeholder={$_('cash.salaryDescriptionPlaceholder')}
            class:border-red-300={form?.fields?.description}
          ></textarea>
          {#if form?.fields?.description}
            <p class="text-sm text-red-600 mt-1">{form.fields.description[0]}</p>
          {/if}
        </div>

        <!-- Reference ID -->
        <div>
          <label for="referenceId" class="label">
            {$_('cash.referenceId')}
          </label>
          <div class="relative">
            <FileText class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="referenceId"
              name="referenceId"
              type="text"
              bind:value={referenceId}
              class="input pl-10"
              placeholder={$_('cash.salaryReferenceIdPlaceholder')}
            />
          </div>
          <p class="text-sm text-gray-500 mt-1">
            {$_('cash.salaryReferenceIdHint')}
          </p>
        </div>

        <!-- Salary Summary -->
        {#if amount && parseFloat(amount) > 0 && employeeName}
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
            <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              {$_('cash.salarySummary')}
            </h3>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-blue-700 dark:text-blue-300">{$_('cash.employee')}:</span>
                <span class="font-medium text-blue-900 dark:text-blue-100">
                  {employeeName}
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-blue-700 dark:text-blue-300">{$_('cash.salaryType')}:</span>
                <span class="font-medium text-blue-900 dark:text-blue-100">
                  {data.salaryTypes.find(t => t.id === salaryType)?.label}
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-blue-700 dark:text-blue-300">{$_('cash.period')}:</span>
                <span class="font-medium text-blue-900 dark:text-blue-100">
                  {salaryPeriod}
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-blue-700 dark:text-blue-300">{$_('cash.amount')}:</span>
                <span class="font-medium text-blue-900 dark:text-blue-100">
                  {formatCurrency(parseFloat(amount), currency)}
                </span>
              </div>
              {#if currency !== 'USD'}
                <div class="flex justify-between text-sm">
                  <span class="text-blue-700 dark:text-blue-300">{$_('cash.convertedAmount')}:</span>
                  <span class="font-medium text-blue-900 dark:text-blue-100">
                    {formatCurrency(convertedAmount, 'USD')}
                  </span>
                </div>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Form Actions -->
        <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={!formValid || isSubmitting}
            class="btn-primary btn-md flex-1 sm:flex-none sm:w-auto"
          >
            {#if isSubmitting}
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ltr:mr-2 rtl:ml-2"></div>
              {$_('common.creating')}
            {:else}
              <Users class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {$_('cash.createSalary')}
            {/if}
          </button>
          
          <a href="/cash" class="btn-secondary btn-md flex-1 sm:flex-none sm:w-auto text-center">
            {$_('common.cancel')}
          </a>
        </div>
      </form>
    </div>
  </div>

  <!-- Salary Guidelines -->
  <div class="max-w-2xl">
    <div class="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-800">
      <div class="flex gap-3">
        <Clock class="h-5 w-5 text-green-600 mt-0.5" />
        <div>
          <h3 class="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
            {$_('cash.salaryGuidelines')}
          </h3>
          <ul class="text-sm text-green-700 dark:text-green-300 space-y-1 list-disc list-inside">
            <li>{$_('cash.salaryGuideline1')}</li>
            <li>{$_('cash.salaryGuideline2')}</li>
            <li>{$_('cash.salaryGuideline3')}</li>
            <li>{$_('cash.salaryGuideline4')}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>