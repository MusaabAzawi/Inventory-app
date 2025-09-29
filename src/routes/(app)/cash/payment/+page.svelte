<!-- src/routes/(app)/cash/payment/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { currentCurrency } from '$lib/stores/currency';
  import {
    ArrowDownCircle,
    DollarSign,
    FileText,
    Calendar,
    ArrowLeft,
    Building,
    Receipt
  } from 'lucide-svelte';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  let isSubmitting = false;
  let amount = '';
  let currency = $currentCurrency.code;
  let exchangeRate = $currentCurrency.exchangeRate || 1;
  let description = '';
  let referenceId = '';
  let paymentType = 'PAYMENT';
  let supplierId = '';
  let employeeId = '';

  $: formValid = amount && parseFloat(amount) > 0 && description.trim() && exchangeRate > 0;

  function resetForm() {
    amount = '';
    currency = $currentCurrency.code;
    exchangeRate = $currentCurrency.exchangeRate || 1;
    description = '';
    referenceId = '';
    paymentType = 'PAYMENT';
    supplierId = '';
    employeeId = '';
  }

  function formatCurrency(value: number, curr: string = 'USD') {
    if (curr === 'IQD') {
      const formatted = new Intl.NumberFormat('ar-IQ', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
      return `${formatted} د.ع`;
    }
    return new Intl.NumberFormat($locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: curr
    }).format(value);
  }

  $: convertedAmount = amount ? parseFloat(amount) * exchangeRate : 0;
  
  $: selectedSupplier = data.suppliers.find(s => s.id === supplierId);
  $: selectedEmployee = data.employees?.find(e => e.id === employeeId);

  function updateDescription() {
    if (paymentType === 'PAYMENT' && selectedSupplier) {
      const supplierName = $locale === 'ar' ? selectedSupplier.nameAr : selectedSupplier.nameEn;
      description = `Payment to supplier: ${supplierName}`;
    } else if (paymentType === 'EMPLOYEE_PAYMENT' && selectedEmployee) {
      const employeeName = $locale === 'ar' ? selectedEmployee.nameAr : selectedEmployee.nameEn;
      description = `Payment to employee: ${employeeName}`;
    } else if (paymentType === 'EXPENSE') {
      description = '';
    }
  }

  $: if (paymentType && (selectedSupplier || selectedEmployee)) {
    updateDescription();
  }
</script>

<div class="space-y-6" dir={$locale === 'ar' ? 'rtl' : 'ltr'}>
  <!-- Header -->
  <div class="flex items-center gap-4">
    <a href="/cash" class="btn-secondary btn-sm">
      <ArrowLeft class="h-4 w-4 {$locale === 'ar' ? 'rotate-180' : ''}" />
    </a>
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <ArrowDownCircle class="h-6 w-6 text-red-600" />
        {$_('modules.cash.paymentVoucher')}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        {$_('cash.paymentSubtitle')}
      </p>
    </div>
  </div>

  <!-- Payment Form -->
  <div class="max-w-2xl">
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-3 bg-red-100 rounded-full dark:bg-red-900">
          <DollarSign class="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {$_('cash.newPayment')}
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {$_('cash.paymentFormDescription')}
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
        <!-- Payment Type -->
        <div>
          <label for="paymentType" class="label">
            {$_('cash.paymentType')} *
          </label>
          <div class="grid grid-cols-2 gap-3">
            {#each data.paymentTypes as type}
              <label class="flex items-center p-3 border rounded-lg cursor-pointer transition-colors {paymentType === type.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600' : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'}">
                <input
                  type="radio"
                  name="paymentType"
                  value={type.id}
                  bind:group={paymentType}
                  class="sr-only"
                />
                <div class="flex items-center gap-2">
                  {#if type.id === 'PAYMENT'}
                    <Building class="h-4 w-4" />
                  {:else}
                    <Receipt class="h-4 w-4" />
                  {/if}
                  <span class="text-sm font-medium">{$_(type.labelKey)}</span>
                </div>
              </label>
            {/each}
          </div>
        </div>

        <!-- Supplier Selection (only for PAYMENT type) -->
        {#if paymentType === 'PAYMENT'}
          <div>
            <label for="supplierId" class="label">
              {$_('cash.supplier')} *
            </label>
            <select
              id="supplierId"
              bind:value={supplierId}
              class="input"
              required={paymentType === 'PAYMENT'}
            >
              <option value="">{$_('cash.selectSupplier')}</option>
              {#each data.suppliers as supplier}
                <option value={supplier.id}>
                  {$locale === 'ar' ? supplier.nameAr : supplier.nameEn}
                </option>
              {/each}
            </select>
            {#if paymentType === 'PAYMENT'}
              <p class="text-sm text-gray-500 mt-1">
                {$_('cash.supplierHint')}
              </p>
            {/if}
          </div>
        {/if}

        <!-- Employee Selection (only for EMPLOYEE_PAYMENT type) -->
        {#if paymentType === 'EMPLOYEE_PAYMENT'}
          <div>
            <label for="employeeId" class="label">
              {$locale === 'ar' ? 'الموظف' : 'Employee'} *
            </label>
            <select
              id="employeeId"
              name="employeeId"
              bind:value={employeeId}
              class="input"
              required={paymentType === 'EMPLOYEE_PAYMENT'}
            >
              <option value="">{$locale === 'ar' ? 'اختر الموظف' : 'Select Employee'}</option>
              {#each data.employees || [] as employee}
                <option value={employee.id}>
                  {$locale === 'ar' ? employee.nameAr : employee.nameEn}
                  {#if employee.position} - {employee.position}{/if}
                </option>
              {/each}
            </select>

            {#if selectedEmployee}
              <div class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-700">
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span class="font-semibold text-gray-700 dark:text-gray-300">
                      {$locale === 'ar' ? 'الراتب الأساسي:' : 'Base Salary:'}
                    </span>
                    <span class="text-gray-900 dark:text-gray-100">
                      {selectedEmployee.salary ? formatCurrency(selectedEmployee.salary, 'IQD') : ($locale === 'ar' ? 'غير محدد' : 'Not Set')}
                    </span>
                  </div>
                  <div>
                    <span class="font-semibold text-gray-700 dark:text-gray-300">
                      {$locale === 'ar' ? 'الراتب المتبقي:' : 'Remaining Salary:'}
                    </span>
                    <span class="text-gray-900 dark:text-gray-100">
                      {selectedEmployee.remainingSalary !== null && selectedEmployee.remainingSalary !== undefined
                        ? formatCurrency(selectedEmployee.remainingSalary, 'IQD')
                        : selectedEmployee.salary
                          ? formatCurrency(selectedEmployee.salary, 'IQD')
                          : ($locale === 'ar' ? 'غير محدد' : 'Not Set')}
                    </span>
                  </div>
                </div>
                {#if selectedEmployee.lastPaymentDate}
                  <div class="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {$locale === 'ar' ? 'آخر دفعة:' : 'Last Payment:'} {new Date(selectedEmployee.lastPaymentDate).toLocaleDateString()}
                  </div>
                {/if}

                {#if selectedEmployee.remainingSalary !== null && amount && parseFloat(amount) > selectedEmployee.remainingSalary}
                  <div class="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded dark:bg-yellow-900/20 dark:border-yellow-700">
                    <p class="text-xs text-yellow-800 dark:text-yellow-200">
                      ⚠️ {$locale === 'ar' ? 'المبلغ المدخل يتجاوز الراتب المتبقي' : 'Amount exceeds remaining salary'}
                    </p>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        {/if}

        <!-- Amount and Currency -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="amount" class="label">
              {$_('cash.amount')} *
            </label>
            <div class="relative">
              <DollarSign class="absolute {$locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                bind:value={amount}
                required
                class="input {$locale === 'ar' ? 'pr-10' : 'pl-10'}"
                dir="ltr"
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
            placeholder={$_('cash.paymentDescriptionPlaceholder')}
            class:border-red-300={form?.fields?.description}
            dir={$locale === 'ar' ? 'rtl' : 'ltr'}
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
            <FileText class="absolute {$locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="referenceId"
              name="referenceId"
              type="text"
              bind:value={referenceId}
              class="input {$locale === 'ar' ? 'pr-10' : 'pl-10'}"
              dir={$locale === 'ar' ? 'rtl' : 'ltr'}
              placeholder={$_('cash.referenceIdPlaceholder')}
            />
          </div>
          <p class="text-sm text-gray-500 mt-1">
            {$_('cash.referenceIdHint')}
          </p>
        </div>

        <!-- Amount Summary -->
        {#if amount && parseFloat(amount) > 0}
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
              {$_('cash.paymentSummary')}
            </h3>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-red-700 dark:text-red-300">{$_('cash.paymentType')}:</span>
                <span class="font-medium text-red-900 dark:text-red-100">
                  {$_(data.paymentTypes.find(t => t.id === paymentType)?.labelKey || 'cash.supplierPayment')}
                </span>
              </div>
              {#if paymentType === 'PAYMENT' && selectedSupplier}
                <div class="flex justify-between text-sm">
                  <span class="text-red-700 dark:text-red-300">{$_('cash.supplier')}:</span>
                  <span class="font-medium text-red-900 dark:text-red-100">
                    {$locale === 'ar' ? selectedSupplier.nameAr : selectedSupplier.nameEn}
                  </span>
                </div>
              {/if}
              {#if paymentType === 'EMPLOYEE_PAYMENT' && selectedEmployee}
                <div class="flex justify-between text-sm">
                  <span class="text-red-700 dark:text-red-300">{$locale === 'ar' ? 'الموظف:' : 'Employee:'}:</span>
                  <span class="font-medium text-red-900 dark:text-red-100">
                    {$locale === 'ar' ? selectedEmployee.nameAr : selectedEmployee.nameEn}
                  </span>
                </div>
              {/if}
              <div class="flex justify-between text-sm">
                <span class="text-red-700 dark:text-red-300">{$_('cash.originalAmount')}:</span>
                <span class="font-medium text-red-900 dark:text-red-100">
                  {formatCurrency(parseFloat(amount), currency)}
                </span>
              </div>
              {#if currency !== 'USD'}
                <div class="flex justify-between text-sm">
                  <span class="text-red-700 dark:text-red-300">{$_('cash.convertedAmount')}:</span>
                  <span class="font-medium text-red-900 dark:text-red-100">
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
            disabled={!formValid || isSubmitting || (paymentType === 'PAYMENT' && !supplierId) || (paymentType === 'EMPLOYEE_PAYMENT' && !employeeId)}
            class="btn-primary btn-md flex-1 sm:flex-none sm:w-auto"
          >
            {#if isSubmitting}
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ltr:mr-2 rtl:ml-2"></div>
              {$_('common.creating')}
            {:else}
              <ArrowDownCircle class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {$_('cash.createPayment')}
            {/if}
          </button>
          
          <a href="/cash" class="btn-secondary btn-md flex-1 sm:flex-none sm:w-auto text-center">
            {$_('common.cancel')}
          </a>
        </div>
      </form>
    </div>
  </div>

  <!-- Payment Guidelines -->
  <div class="max-w-2xl">
    <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 dark:bg-orange-900/20 dark:border-orange-800">
      <div class="flex gap-3">
        <Calendar class="h-5 w-5 text-orange-600 mt-0.5" />
        <div>
          <h3 class="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
            {$_('cash.paymentGuidelines')}
          </h3>
          <ul class="text-sm text-orange-700 dark:text-orange-300 space-y-1 list-disc list-inside">
            <li>{$_('cash.paymentGuideline1')}</li>
            <li>{$_('cash.paymentGuideline2')}</li>
            <li>{$_('cash.paymentGuideline3')}</li>
            <li>{$_('cash.paymentGuideline4')}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>