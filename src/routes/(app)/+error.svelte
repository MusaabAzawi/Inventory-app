<!-- src/routes/(app)/+error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Header from '$lib/components/layout/Header.svelte';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  
  $: status = $page.status;
  $: message = $page.error?.message || 'Something went wrong';
  
  function goHome() {
    goto('/dashboard');
  }
  
  function goBack() {
    history.back();
  }
</script>

<svelte:head>
  <title>Error {status} - Inventory App</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header />
  <div class="flex">
    <Sidebar />
    <main class="flex-1 p-6 lg:ml-64">
      <div class="max-w-2xl mx-auto text-center py-16">
        <div class="mb-8">
          <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            {status}
          </h1>
          
          {#if status === 404}
            <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Page Not Found
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-8">
              The page you're looking for doesn't exist in the inventory system.
            </p>
          {:else if status === 500}
            <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Server Error
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-8">
              There was an error processing your request. Please try again.
            </p>
          {:else if status === 403}
            <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Access Denied
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-8">
              You don't have permission to access this part of the inventory system.
            </p>
          {:else}
            <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Something went wrong
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-8">
              {message}
            </p>
          {/if}
        </div>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            on:click={goBack}
            class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Go Back
          </button>
          
          <button
            on:click={goHome}
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Dashboard
          </button>
        </div>
        
        {#if status === 404}
          <div class="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 class="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
              Quick Navigation
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <a href="/dashboard" class="text-blue-600 dark:text-blue-400 hover:underline">Dashboard</a>
              <a href="/inventory" class="text-blue-600 dark:text-blue-400 hover:underline">Inventory</a>
              <a href="/sales" class="text-blue-600 dark:text-blue-400 hover:underline">Sales</a>
              <a href="/purchases" class="text-blue-600 dark:text-blue-400 hover:underline">Purchases</a>
              <a href="/accounts" class="text-blue-600 dark:text-blue-400 hover:underline">Accounts</a>
              <a href="/reports" class="text-blue-600 dark:text-blue-400 hover:underline">Reports</a>
            </div>
          </div>
        {/if}
      </div>
    </main>
  </div>
</div>