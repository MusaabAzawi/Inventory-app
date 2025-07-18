<script lang="ts">
  import { notifications } from '$lib/stores/notifications';
  import Toast from './Toast.svelte';
</script>

<div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
  {#each $notifications as notification (notification.id)}
    <Toast 
      {notification}
      on:dismiss={(e) => notifications.removeNotification(e.detail)}
    />
  {/each}
</div>