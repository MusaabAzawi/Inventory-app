<script lang="ts">
  import { currencyStore, currentCurrency } from '$lib/stores/currency';
  import { formatCurrency, convertCurrency, SUPPORTED_CURRENCIES } from '$lib/utils/currency';
  import { locale } from 'svelte-i18n';

  let testAmount = 1000;

  function testCurrencySwitch(currencyCode: string) {
    currencyStore.setCurrency(currencyCode);
  }
</script>

<div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
  <h3 class="text-lg font-semibold mb-4">Currency Testing</h3>

  <div class="space-y-4">
    <div>
      <label for="test-amount" class="block text-sm font-medium mb-2">
        Test Amount
      </label>
      <input
        id="test-amount"
        type="number"
        bind:value={testAmount}
        class="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
    </div>

    <div>
      <p class="text-sm font-medium mb-2">Current Currency: {$currentCurrency.code}</p>
      <p class="text-lg">
        Formatted: {formatCurrency(testAmount, $currentCurrency.code, $locale)}
      </p>
    </div>

    <div class="grid grid-cols-2 gap-2">
      {#each SUPPORTED_CURRENCIES as currency}
        <button
          on:click={() => testCurrencySwitch(currency.code)}
          class="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          class:bg-green-500={$currentCurrency.code === currency.code}
          class:hover:bg-green-600={$currentCurrency.code === currency.code}
        >
          Switch to {currency.code}
        </button>
      {/each}
    </div>

    <div class="border-t pt-4">
      <h4 class="font-medium mb-2">Conversion Tests</h4>
      {#each SUPPORTED_CURRENCIES as fromCurrency}
        {#each SUPPORTED_CURRENCIES as toCurrency}
          {#if fromCurrency.code !== toCurrency.code}
            <p class="text-sm">
              {testAmount} {fromCurrency.code} =
              {convertCurrency(testAmount, fromCurrency.code, toCurrency.code).toFixed(2)} {toCurrency.code}
            </p>
          {/if}
        {/each}
      {/each}
    </div>
  </div>
</div>