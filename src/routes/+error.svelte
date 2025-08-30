<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
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
  <title>Error {status}</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
  <div class="text-center max-w-md mx-auto px-4">
    <div class="mb-8">
      <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-4">
        {status}
      </h1>
      
      {#if status === 404}
        <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Page Not Found
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
      {:else if status === 500}
        <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Internal Server Error
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          Something went wrong on our end. Please try again later.
        </p>
      {:else if status === 403}
        <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Access Denied
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          You don't have permission to access this resource.
        </p>
      {:else}
        <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Oops!
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          {message}
        </p>
      {/if}
    </div>
    
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        on:click={goBack}
        class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
      >
        Go Back
      </button>
      
      <button
        on:click={goHome}
        class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        Go to Dashboard
      </button>
    </div>
    
    {#if status === 404}
      <div class="mt-8 text-sm text-gray-500 dark:text-gray-400">
        <p>If you believe this is a mistake, please contact support.</p>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Add any additional custom styles here if needed */
</style>