<!-- src/routes/(app)/settings/+page.svelte -->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import {
    Settings,
    User,
    Globe,
    Bell,
    Shield,
    Database,
    Palette,
    Save,
    Users,
    DollarSign,
    Building,
    Upload,
    X,
    Image as ImageIcon
  } from 'lucide-svelte';
  import LanguageSwitcher from '$lib/components/layout/LanguageSwitcher.svelte';
  import { currencyStore } from '$lib/stores/currency';
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  export let data: PageData = {};
  export let form: ActionData;

  let logoFile: File | null = null;
  let logoPreview: string | null = null;
  let uploadingLogo = false;
  let isSubmittingCompany = false;

  $: companyLogo = data.settings?.companyLogo || null;

  let companyNameEn = '';
  let companyNameAr = '';
  let companyEmail = '';
  let companyPhone = '';
  let companyAddress = '';
  let companyCity = '';
  let companyState = '';
  let companyZipCode = '';
  let companyCountry = '';
  let companyTaxId = '';
  let companyWebsite = '';

  $: if (data.settings) {
    companyNameEn = data.settings.companyNameEn || '';
    companyNameAr = data.settings.companyNameAr || '';
    companyEmail = data.settings.companyEmail || '';
    companyPhone = data.settings.companyPhone || '';
    companyAddress = data.settings.companyAddress || '';
    companyCity = data.settings.companyCity || '';
    companyState = data.settings.companyState || '';
    companyZipCode = data.settings.companyZipCode || '';
    companyCountry = data.settings.companyCountry || '';
    companyTaxId = data.settings.companyTaxId || '';
    companyWebsite = data.settings.companyWebsite || '';
  }

  let systemSettings = {
    defaultCurrency: data.settings?.defaultCurrency || 'IQD',
    lowStockThreshold: data.settings?.lowStockThreshold || 10,
    autoBackup: data.settings?.autoBackup || true,
    emailNotifications: data.settings?.emailNotifications || true,
    smsNotifications: data.settings?.smsNotifications || false,
    defaultLanguage: data.settings?.defaultLanguage || 'ar',
    dateFormat: data.settings?.dateFormat || 'DD/MM/YYYY',
    timeFormat: data.settings?.timeFormat || '24h',
    darkMode: data.settings?.darkMode || false,
    sessionTimeout: data.settings?.sessionTimeout || 60,
    passwordPolicy: data.settings?.passwordPolicy || 'medium',
    twoFactorAuth: data.settings?.twoFactorAuth || false,
    loginAttempts: data.settings?.loginAttempts || 3
  };

  function handleLogoSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit');
      input.value = '';
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      alert('Invalid file type. Only PNG, JPG, and JPEG are allowed');
      input.value = '';
      return;
    }

    logoFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      logoPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function uploadLogo() {
    if (!logoFile) return;

    uploadingLogo = true;
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await fetch('/api/company/logo', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        companyLogo = result.logoUrl;
        logoPreview = null;
        logoFile = null;
        alert($_('settings.logoUploadedSuccessfully'));
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      alert('Failed to upload logo');
    } finally {
      uploadingLogo = false;
    }
  }

  async function removeLogo() {
    if (!confirm($_('settings.confirmRemoveLogo'))) return;

    try {
      const response = await fetch('/api/company/logo', {
        method: 'DELETE'
      });

      if (response.ok) {
        companyLogo = null;
        logoPreview = null;
        logoFile = null;
        alert($_('settings.logoRemovedSuccessfully'));
      } else {
        alert('Failed to remove logo');
      }
    } catch (error) {
      console.error('Logo removal error:', error);
      alert('Failed to remove logo');
    }
  }

  function saveSystemSettings() {
    currencyStore.setCurrency(systemSettings.defaultCurrency);
    if (typeof window !== 'undefined') {
      localStorage.setItem('defaultCurrency', systemSettings.defaultCurrency);
    }
  }

  import { onMount } from 'svelte';
  onMount(() => {
    if (typeof window !== 'undefined') {
      const savedCurrency = localStorage.getItem('defaultCurrency');
      if (savedCurrency) {
        systemSettings.defaultCurrency = savedCurrency;
        currencyStore.setCurrency(savedCurrency);
      }
    }
  });
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
      {$_('nav.settings')}
    </h1>
    <p class="text-gray-600 dark:text-gray-400 mt-1">
      {$_('settings.subtitle')}
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Settings Navigation -->
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800 h-fit">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {$_('settings.settingsCategories')}
      </h2>
      <nav class="space-y-2">
        <a href="#company" class="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
          <Building class="h-5 w-5 ltr:mr-3 rtl:ml-3" />
          {$_('settings.companySettings')}
        </a>
        <a href="#system" class="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
          <Settings class="h-5 w-5 ltr:mr-3 rtl:ml-3" />
          {$_('settings.systemSettings')}
        </a>
        <a href="#display" class="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
          <Palette class="h-5 w-5 ltr:mr-3 rtl:ml-3" />
          {$_('settings.displaySettings')}
        </a>
        <a href="#notifications" class="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
          <Bell class="h-5 w-5 ltr:mr-3 rtl:ml-3" />
          {$_('settings.notifications')}
        </a>
        <a href="#security" class="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
          <Shield class="h-5 w-5 ltr:mr-3 rtl:ml-3" />
          {$_('settings.security')}
        </a>
        <a href="#users" class="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
          <Users class="h-5 w-5 ltr:mr-3 rtl:ml-3" />
          {$_('settings.userManagement')}
        </a>
        <a href="#backup" class="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
          <Database class="h-5 w-5 ltr:mr-3 rtl:ml-3" />
          {$_('settings.backupData')}
        </a>
      </nav>
    </div>

    <!-- Settings Content -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Company Settings -->
      <div id="company" class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center mb-6">
          <Building class="h-6 w-6 text-blue-600 ltr:mr-3 rtl:ml-3" />
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {$_('settings.companySettings')}
          </h2>
        </div>

        {#if form?.success}
          <div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
            <p class="text-sm text-green-600 dark:text-green-400">{form.message}</p>
          </div>
        {/if}

        {#if form?.error}
          <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <p class="text-sm text-red-600 dark:text-red-400">{form.error}</p>
          </div>
        {/if}

        <!-- Company Logo Upload -->
        <div class="mb-8 p-6 bg-gray-50 rounded-lg dark:bg-gray-700/50">
          <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ImageIcon class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            {$_('settings.companyLogo')}
          </h3>

          <div class="flex flex-col md:flex-row items-start gap-6">
            <!-- Logo Preview -->
            <div class="flex-shrink-0">
              {#if logoPreview}
                <div class="relative w-48 h-48 border-2 border-dashed border-blue-400 rounded-lg overflow-hidden">
                  <img src={logoPreview} alt="Logo preview" class="w-full h-full object-contain" />
                </div>
              {:else if companyLogo}
                <div class="relative w-48 h-48 border-2 border-gray-300 rounded-lg overflow-hidden dark:border-gray-600">
                  <img src={companyLogo} alt="Company logo" class="w-full h-full object-contain p-2" />
                  <button
                    type="button"
                    on:click={removeLogo}
                    class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                    title={$_('common.remove')}
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>
              {:else}
                <div class="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center dark:border-gray-600">
                  <div class="text-center">
                    <ImageIcon class="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p class="text-sm text-gray-500 dark:text-gray-400">{$_('settings.noLogo')}</p>
                  </div>
                </div>
              {/if}
            </div>

            <!-- Upload Controls -->
            <div class="flex-1">
              <label for="logo-upload" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {$_('settings.uploadLogo')}
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                on:change={handleLogoSelect}
                class="hidden"
              />
              <div class="flex flex-col gap-2">
                <label
                  for="logo-upload"
                  class="btn-secondary btn-md inline-flex items-center justify-center cursor-pointer w-full md:w-auto"
                >
                  <Upload class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                  {$_('settings.chooseFile')}
                </label>

                {#if logoFile}
                  <button
                    type="button"
                    on:click={uploadLogo}
                    disabled={uploadingLogo}
                    class="btn-primary btn-md w-full md:w-auto"
                  >
                    {#if uploadingLogo}
                      <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ltr:mr-2 rtl:ml-2"></div>
                      {$_('common.uploading')}
                    {:else}
                      <Save class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      {$_('settings.uploadNow')}
                    {/if}
                  </button>
                {/if}
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {$_('settings.logoRequirements')}
              </p>
            </div>
          </div>
        </div>

        <!-- Company Information Form -->
        <form
          method="POST"
          action="?/updateCompany"
          use:enhance={() => {
            isSubmittingCompany = true;
            return async ({ update }) => {
              await update();
              isSubmittingCompany = false;
            };
          }}
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="company-name-en" class="label">{$_('settings.companyNameEnglish')} *</label>
              <input
                id="company-name-en"
                name="companyNameEn"
                type="text"
                bind:value={companyNameEn}
                required
                class="input"
                dir="ltr"
              />
            </div>

            <div>
              <label for="company-name-ar" class="label">{$_('settings.companyNameArabic')} *</label>
              <input
                id="company-name-ar"
                name="companyNameAr"
                type="text"
                bind:value={companyNameAr}
                required
                class="input"
                dir="rtl"
              />
            </div>

            <div>
              <label for="company-email" class="label">{$_('settings.companyEmail')}</label>
              <input
                id="company-email"
                name="companyEmail"
                type="email"
                bind:value={companyEmail}
                class="input"
              />
            </div>

            <div>
              <label for="company-phone" class="label">{$_('settings.companyPhone')}</label>
              <input
                id="company-phone"
                name="companyPhone"
                type="tel"
                bind:value={companyPhone}
                class="input"
              />
            </div>

            <div>
              <label for="company-tax-id" class="label">{$_('settings.companyTaxId')}</label>
              <input
                id="company-tax-id"
                name="companyTaxId"
                type="text"
                bind:value={companyTaxId}
                class="input"
              />
            </div>

            <div>
              <label for="company-website" class="label">{$_('settings.companyWebsite')}</label>
              <input
                id="company-website"
                name="companyWebsite"
                type="url"
                bind:value={companyWebsite}
                class="input"
                placeholder="https://example.com"
              />
            </div>

            <div class="md:col-span-2">
              <label for="company-address" class="label">{$_('settings.companyAddress')}</label>
              <textarea
                id="company-address"
                name="companyAddress"
                bind:value={companyAddress}
                rows="2"
                class="input"
                dir={$locale === 'ar' ? 'rtl' : 'ltr'}
              ></textarea>
            </div>

            <div>
              <label for="company-city" class="label">{$_('settings.companyCity')}</label>
              <input
                id="company-city"
                name="companyCity"
                type="text"
                bind:value={companyCity}
                class="input"
              />
            </div>

            <div>
              <label for="company-state" class="label">{$_('settings.companyState')}</label>
              <input
                id="company-state"
                name="companyState"
                type="text"
                bind:value={companyState}
                class="input"
              />
            </div>

            <div>
              <label for="company-zip-code" class="label">{$_('settings.companyZipCode')}</label>
              <input
                id="company-zip-code"
                name="companyZipCode"
                type="text"
                bind:value={companyZipCode}
                class="input"
              />
            </div>

            <div>
              <label for="company-country" class="label">{$_('settings.companyCountry')}</label>
              <input
                id="company-country"
                name="companyCountry"
                type="text"
                bind:value={companyCountry}
                class="input"
              />
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button
              type="submit"
              disabled={isSubmittingCompany}
              class="btn-primary btn-md"
            >
              {#if isSubmittingCompany}
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ltr:mr-2 rtl:ml-2"></div>
                {$_('common.saving')}
              {:else}
                <Save class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                {$_('settings.saveCompanySettings')}
              {/if}
            </button>
          </div>
        </form>
      </div>

      <!-- System Settings -->
      <div id="system" class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center mb-6">
          <Settings class="h-6 w-6 text-green-600 ltr:mr-3 rtl:ml-3" />
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {$_('settings.systemSettings')}
          </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="default-currency" class="label">{$_('settings.defaultCurrency')}</label>
            <select id="default-currency" bind:value={systemSettings.defaultCurrency} class="input">
              <option value="IQD">IQD - Iraqi Dinar (د.ع)</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="SAR">SAR - Saudi Riyal</option>
              <option value="AED">AED - UAE Dirham</option>
            </select>
          </div>

          <div>
            <label for="low-stock-threshold" class="label">{$_('settings.lowStockThreshold')}</label>
            <input
              id="low-stock-threshold"
              type="number"
              bind:value={systemSettings.lowStockThreshold}
              min="1"
              class="input"
            />
          </div>

          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700">
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">{$_('settings.autoBackup')}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{$_('settings.autoBackupDescription')}</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" bind:checked={systemSettings.autoBackup} class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Display Settings -->
      <div id="display" class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center mb-6">
          <Palette class="h-6 w-6 text-purple-600 ltr:mr-3 rtl:ml-3" />
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {$_('settings.displaySettings')}
          </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="default-language" class="label">{$_('settings.defaultLanguage')}</label>
            <select id="default-language" bind:value={systemSettings.defaultLanguage} class="input">
              <option value="ar">العربية (Arabic)</option>
              <option value="en">English</option>
            </select>
          </div>
          
          <div>
            <label for="date-format" class="label">{$_('settings.dateFormat')}</label>
            <select id="date-format" bind:value={systemSettings.dateFormat} class="input">
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          
          <div>
            <label for="time-format" class="label">{$_('settings.timeFormat')}</label>
            <select id="time-format" bind:value={systemSettings.timeFormat} class="input">
              <option value="24h">{$_('settings.24Hour')}</option>
              <option value="12h">{$_('settings.12Hour')}</option>
            </select>
          </div>
          
          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700">
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">{$_('settings.darkMode')}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{$_('settings.darkModeDescription')}</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" bind:checked={systemSettings.darkMode} class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Notifications -->
      <div id="notifications" class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center mb-6">
          <Bell class="h-6 w-6 text-yellow-600 ltr:mr-3 rtl:ml-3" />
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {$_('settings.notificationSettings')}
          </h2>
        </div>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700">
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">{$_('settings.emailNotifications')}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{$_('settings.emailNotificationsDescription')}</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" bind:checked={systemSettings.emailNotifications} class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700">
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">{$_('settings.smsNotifications')}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{$_('settings.smsNotificationsDescription')}</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" bind:checked={systemSettings.smsNotifications} class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Security -->
      <div id="security" class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center mb-6">
          <Shield class="h-6 w-6 text-red-600 ltr:mr-3 rtl:ml-3" />
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {$_('settings.securitySettings')}
          </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="session-timeout" class="label">{$_('settings.sessionTimeout')}</label>
            <input 
              id="session-timeout"
              type="number" 
              bind:value={systemSettings.sessionTimeout}
              min="15"
              max="480"
              class="input"
            />
          </div>
          
          <div>
            <label for="password-policy" class="label">{$_('settings.passwordPolicy')}</label>
            <select id="password-policy" bind:value={systemSettings.passwordPolicy} class="input">
              <option value="weak">{$_('settings.passwordPolicyWeak')}</option>
              <option value="medium">{$_('settings.passwordPolicyMedium')}</option>
              <option value="strong">{$_('settings.passwordPolicyStrong')}</option>
            </select>
          </div>
          
          <div>
            <label for="login-attempts" class="label">{$_('settings.maxLoginAttempts')}</label>
            <input 
              id="login-attempts"
              type="number" 
              bind:value={systemSettings.loginAttempts}
              min="3"
              max="10"
              class="input"
            />
          </div>
          
          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700">
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">{$_('settings.twoFactorAuth')}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{$_('settings.twoFactorAuthDescription')}</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" bind:checked={systemSettings.twoFactorAuth} class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- System Settings Save Button -->
      <div class="flex justify-end">
        <button
          type="button"
          on:click={saveSystemSettings}
          class="btn-primary btn-lg"
        >
          <Save class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
          {$_('settings.saveSystemSettings')}
        </button>
      </div>
    </div>
  </div>
</div>