<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { DollarSign } from 'lucide-svelte';
  import { currencyStore, currentCurrency } from '$lib/stores/currency';
  import { SUPPORTED_CURRENCIES } from '$lib/utils/currency';

  let showDropdown = false;

  function selectCurrency(currencyCode: string) {
    currencyStore.setCurrency(currencyCode);
    showDropdown = false;
  }

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.closest('.currency-switcher')) {
      showDropdown = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="currency-switcher relative">
  <button
    on:click={toggleDropdown}
    class="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    aria-expanded={showDropdown}
    aria-haspopup="true"
  >
    <DollarSign class="h-4 w-4 text-gray-600 dark:text-gray-400" />
    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
      {$currentCurrency.code}
    </span>
    <svg
      class="h-4 w-4 text-gray-400 transition-transform duration-200"
      class:rotate-180={showDropdown}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if showDropdown}
    <div class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      <div class="p-2">
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wider">
          {$_('currency.selectCurrency') || 'Select Currency'}
        </div>
        {#each SUPPORTED_CURRENCIES as currency}
          <button
            on:click={() => selectCurrency(currency.code)}
            class="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            class:bg-blue-50={$currentCurrency.code === currency.code}
            class:dark:bg-blue-900={$currentCurrency.code === currency.code}
            class:text-blue-700={$currentCurrency.code === currency.code}
            class:dark:text-blue-300={$currentCurrency.code === currency.code}
          >
            <div class="flex items-center space-x-3">
              <span class="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {currency.symbol}
              </span>
              <div class="text-left">
                <div class="font-medium">
                  {$locale === 'ar' ? currency.nameAr : currency.nameEn}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {currency.code}
                </div>
              </div>
            </div>
            {#if $currentCurrency.code === currency.code}
              <svg class="h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            {/if}
          </button>
        {/each}
      </div>

      <div class="border-t border-gray-200 dark:border-gray-700 p-3">
        <div class="text-xs text-gray-500 dark:text-gray-400">
          {$_('currency.exchangeRateNote') || 'Exchange rates are approximate'}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .rotate-180 {
    transform: rotate(180deg);
  }
</style>