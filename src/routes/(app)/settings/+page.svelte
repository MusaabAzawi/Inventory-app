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
    Building
  } from 'lucide-svelte';
  import LanguageSwitcher from '$lib/components/layout/LanguageSwitcher.svelte';
  import { currencyStore } from '$lib/stores/currency';
  import type { PageData } from './$types';

  export let data: PageData = {};

  // Mock settings data - will be replaced with server data
  let settings = {
    // Company Settings
    companyNameEn: 'Inventory Pro System',
    companyNameAr: 'نظام إدارة المخزون',
    companyEmail: 'admin@inventory.com',
    companyPhone: '+1234567890',
    companyAddress: '123 Business Street',
    
    // System Settings
    defaultCurrency: 'IQD',
    lowStockThreshold: 10,
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    
    // Display Settings
    defaultLanguage: 'ar',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    darkMode: false,
    
    // Security Settings
    sessionTimeout: 60,
    passwordPolicy: 'medium',
    twoFactorAuth: false,
    loginAttempts: 3
  };

  function saveSettings() {
    // Save currency to the currency store
    currencyStore.setCurrency(settings.defaultCurrency);

    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('defaultCurrency', settings.defaultCurrency);
    }

    // Show success notification
    alert($_('settings.settingsSaved'));
  }

  // Load saved currency on mount
  import { onMount } from 'svelte';
  onMount(() => {
    if (typeof window !== 'undefined') {
      const savedCurrency = localStorage.getItem('defaultCurrency');
      if (savedCurrency) {
        settings.defaultCurrency = savedCurrency;
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
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="company-name-en" class="label">{$_('settings.companyNameEnglish')}</label>
            <input 
              id="company-name-en"
              type="text" 
              bind:value={settings.companyNameEn}
              class="input"
              dir="ltr"
            />
          </div>
          
          <div>
            <label for="company-name-ar" class="label">{$_('settings.companyNameArabic')}</label>
            <input 
              id="company-name-ar"
              type="text" 
              bind:value={settings.companyNameAr}
              class="input"
              dir="rtl"
            />
          </div>
          
          <div>
            <label for="company-email" class="label">{$_('settings.companyEmail')}</label>
            <input 
              id="company-email"
              type="email" 
              bind:value={settings.companyEmail}
              class="input"
            />
          </div>
          
          <div>
            <label for="company-phone" class="label">{$_('settings.companyPhone')}</label>
            <input 
              id="company-phone"
              type="tel" 
              bind:value={settings.companyPhone}
              class="input"
            />
          </div>
          
          <div class="md:col-span-2">
            <label for="company-address" class="label">{$_('settings.companyAddress')}</label>
            <textarea 
              id="company-address"
              bind:value={settings.companyAddress}
              rows="3"
              class="input"
            ></textarea>
          </div>
        </div>
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
            <select id="default-currency" bind:value={settings.defaultCurrency} class="input">
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
              bind:value={settings.lowStockThreshold}
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
              <input type="checkbox" bind:checked={settings.autoBackup} class="sr-only peer" />
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
            <select id="default-language" bind:value={settings.defaultLanguage} class="input">
              <option value="ar">العربية (Arabic)</option>
              <option value="en">English</option>
            </select>
          </div>
          
          <div>
            <label for="date-format" class="label">{$_('settings.dateFormat')}</label>
            <select id="date-format" bind:value={settings.dateFormat} class="input">
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          
          <div>
            <label for="time-format" class="label">{$_('settings.timeFormat')}</label>
            <select id="time-format" bind:value={settings.timeFormat} class="input">
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
              <input type="checkbox" bind:checked={settings.darkMode} class="sr-only peer" />
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
              <input type="checkbox" bind:checked={settings.emailNotifications} class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700">
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">{$_('settings.smsNotifications')}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{$_('settings.smsNotificationsDescription')}</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" bind:checked={settings.smsNotifications} class="sr-only peer" />
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
              bind:value={settings.sessionTimeout}
              min="15"
              max="480"
              class="input"
            />
          </div>
          
          <div>
            <label for="password-policy" class="label">{$_('settings.passwordPolicy')}</label>
            <select id="password-policy" bind:value={settings.passwordPolicy} class="input">
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
              bind:value={settings.loginAttempts}
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
              <input type="checkbox" bind:checked={settings.twoFactorAuth} class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <button 
          on:click={saveSettings}
          class="btn-primary btn-lg"
        >
          <Save class="h-5 w-5 ltr:mr-2 rtl:ml-2" />
          {$_('settings.saveSettings')}
        </button>
      </div>
    </div>
  </div>
</div>