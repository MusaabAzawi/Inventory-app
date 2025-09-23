<!-- src/routes/(app)/accounts/suppliers/new/+page.svelte -->
<script lang="ts">
  import { _, locale } from 'svelte-i18n';
  import { enhance } from '$app/forms';
  import { notifications } from '$lib/stores/notifications';
  import { 
    ArrowLeft, 
    Save, 
    Truck,
    Phone,
    Mail,
    MapPin,
    Building,
    Package
  } from 'lucide-svelte';
  import type { ActionData } from './$types';
  
  export let form: ActionData;
  
  let isSubmitting = false;

  function handleSubmit() {
    return async ({ result }) => {
      isSubmitting = false;
      
      if (result.type === 'success') {
        notifications.success('Supplier Created', 'New supplier has been added successfully');
      } else if (result.type === 'failure') {
        notifications.error('Error', result.data?.error || 'Failed to create supplier');
      }
    };
  }

  function validateForm() {
    const nameEn = document.getElementById('nameEn') as HTMLInputElement;
    const nameAr = document.getElementById('nameAr') as HTMLInputElement;
    const email = document.getElementById('email') as HTMLInputElement;
    
    if (!nameEn.value.trim()) {
      notifications.error('Validation Error', 'English name is required');
      nameEn.focus();
      return false;
    }
    
    if (!nameAr.value.trim()) {
      notifications.error('Validation Error', 'Arabic name is required');
      nameAr.focus();
      return false;
    }
    
    if (email.value && !email.validity.valid) {
      notifications.error('Validation Error', 'Please enter a valid email address');
      email.focus();
      return false;
    }
    
    return true;
  }
</script>

<div class="space-y-6" dir={$locale === 'ar' ? 'rtl' : 'ltr'}>
  <!-- Header -->
  <div class="flex items-center gap-4">
    <a href="/accounts" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
      <ArrowLeft class="w-6 h-6 {$locale === 'ar' ? 'rotate-180' : ''}" />
    </a>
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {$_('modules.accounts.addSupplier')}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        Create a new supplier account
      </p>
    </div>
  </div>

  <!-- Form -->
  <div class="card p-6">
    <form 
      method="POST" 
      use:enhance={handleSubmit}
      on:submit|preventDefault={() => {
        if (validateForm()) {
          isSubmitting = true;
          return true;
        }
        return false;
      }}
      class="space-y-6"
    >
      {#if form?.error}
        <div class="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {form.error}
        </div>
      {/if}

      <!-- Company Information Section -->
      <div class="space-y-4">
        <div class="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">
          <Building class="h-5 w-5" />
          Company Information
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- English Name -->
          <div>
            <label for="nameEn" class="label">
              Company Name (English) <span class="text-red-500">*</span>
            </label>
            <input
              id="nameEn"
              name="nameEn"
              type="text"
              required
              class="input"
              value={form?.nameEn ?? ''}
              dir="ltr"
              placeholder={$_('suppliers.enterCompanyNameEnglish')}
            />
          </div>

          <!-- Arabic Name -->
          <div>
            <label for="nameAr" class="label">
              Company Name (Arabic) <span class="text-red-500">*</span>
            </label>
            <input
              id="nameAr"
              name="nameAr"
              type="text"
              required
              class="input"
              value={form?.nameAr ?? ''}
              dir="rtl"
              placeholder="أدخل اسم شركة المورد بالعربية"
            />
          </div>
        </div>
      </div>

      <!-- Contact Information Section -->
      <div class="space-y-4">
        <div class="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">
          <Phone class="h-5 w-5" />
          Contact Information
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Phone -->
          <div>
            <label for="phone" class="label">
              Phone Number
            </label>
            <div class="relative">
              <Phone class="absolute {$locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="phone"
                name="phone"
                type="tel"
                class="input {$locale === 'ar' ? 'pr-10' : 'pl-10'}"
                value={form?.phone ?? ''}
                placeholder="+1234567890"
                dir="ltr"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="label">
              Email Address
            </label>
            <div class="relative">
              <Mail class="absolute {$locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                class="input {$locale === 'ar' ? 'pr-10' : 'pl-10'}"
                dir="ltr"
                value={form?.email ?? ''}
                placeholder="supplier@company.com"
              />
            </div>
          </div>
        </div>

        <!-- Address -->
        <div>
          <label for="address" class="label">
            Business Address
          </label>
          <div class="relative">
            <MapPin class="absolute {$locale === 'ar' ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-gray-400" />
            <textarea
              id="address"
              name="address"
              rows="3"
              class="input {$locale === 'ar' ? 'pr-10' : 'pl-10'}"
              value={form?.address ?? ''}
              placeholder={$_('suppliers.enterBusinessAddress')}
              dir={$locale === 'ar' ? 'rtl' : 'ltr'}
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Supplier Info Box -->
      <div class="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900 dark:border-green-700">
        <div class="flex items-start gap-3">
          <Truck class="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
          <div class="text-sm">
            <p class="font-medium text-green-900 dark:text-green-100">Supplier Account</p>
            <p class="text-green-700 dark:text-green-300 mt-1">
              This supplier will be available for selection in purchase orders and inventory management. Purchase history and product sourcing will be tracked.
            </p>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900 dark:border-blue-700">
        <div class="flex items-start gap-3">
          <Package class="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div class="text-sm">
            <p class="font-medium text-blue-900 dark:text-blue-100">Benefits of Adding Suppliers</p>
            <ul class="text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc list-inside">
              <li>Track purchase history and costs</li>
              <li>Monitor supplier performance</li>
              <li>Generate supplier-specific reports</li>
              <li>Manage payment terms and outstanding balances</li>
              <li>View last purchase prices for products</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <a href="/accounts" class="btn-secondary btn-md">
          <ArrowLeft class="h-4 w-4 ltr:mr-2 rtl:ml-2 {$locale === 'ar' ? 'rotate-180' : ''}" />
          {$_('common.cancel')}
        </a>
        <button 
          type="submit" 
          class="btn-primary btn-md"
          disabled={isSubmitting}
        >
          {#if isSubmitting}
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current ltr:mr-2 rtl:ml-2"></div>
          {:else}
            <Save class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {/if}
          {$_('common.save')} Supplier
        </button>
      </div>
    </form>
  </div>
</div>