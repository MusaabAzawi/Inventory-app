<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  onMount(() => {
    // Check if user is logged in and redirect appropriately
    if ($page.data.user) {
      goto('/dashboard', { replaceState: true });
    } else {
      goto('/auth/login', { replaceState: true });
    }
  });
</script>

<!-- Loading spinner while redirecting -->
<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
  <div class="text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
    <p class="text-gray-600 dark:text-gray-400">Loading...</p>
  </div>
</div>