<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { AlertTriangle } from 'lucide-svelte';
  import Modal from './Modal.svelte';

  export let open = false;
  export let title = 'Confirm Action';
  export let message = 'Are you sure you want to proceed?';
  export let confirmText = 'Confirm';
  export let cancelText = 'Cancel';
  export let type: 'danger' | 'warning' | 'info' = 'warning';
  export let loading = false;

  const dispatch = createEventDispatcher();

  function handleConfirm() {
    dispatch('confirm');
  }

  function handleCancel() {
    if (loading) return;
    open = false;
    dispatch('cancel');
  }

  $: iconColor = {
    danger: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }[type];

  $: confirmButtonClass = {
    danger: 'btn-danger',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    info: 'btn-primary'
  }[type];
</script>

<Modal bind:open persistent={loading} title="" size="sm">
  <div class="text-center">
    <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
      <AlertTriangle class="h-6 w-6 {iconColor}" />
    </div>
    
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
      {message}
    </p>
  </div>

  <div slot="footer">
    <button
      on:click={handleCancel}
      disabled={loading}
      class="btn-secondary btn-md"
    >
      {cancelText}
    </button>
    <button
      on:click={handleConfirm}
      disabled={loading}
      class="{confirmButtonClass} btn-md disabled:opacity-50"
    >
      {#if loading}
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
      {/if}
      {confirmText}
    </button>
  </div>
</Modal>