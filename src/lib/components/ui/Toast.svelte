<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';
  import { X, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-svelte';
  import type { Notification } from '$lib/stores/notifications';

  export let notification: Notification;

  const dispatch = createEventDispatcher();

  function dismiss() {
    dispatch('dismiss', notification.id);
  }

  function handleAction(action: () => void) {
    action();
    dismiss();
  }

  $: iconComponent = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }[notification.type];

  $: colorClasses = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-100',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-100',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100'
  }[notification.type];

  $: iconColor = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }[notification.type];
</script>

<div 
  class="flex items-start p-4 border rounded-lg shadow-lg {colorClasses} max-w-sm mx-auto"
  role="alert"
  transition:fly="{{ x: 300, duration: 300 }}"
>
  <div class="flex-shrink-0">
    <svelte:component this={iconComponent} class="w-5 h-5 {iconColor}" />
  </div>
  
  <div class="ml-3 flex-1">
    <h4 class="text-sm font-medium">{notification.title}</h4>
    {#if notification.message}
      <p class="text-sm mt-1 opacity-90">{notification.message}</p>
    {/if}
    
    {#if notification.actions?.length}
      <div class="mt-3 flex gap-2">
        {#each notification.actions as action}
          <button
            on:click={() => handleAction(action.action)}
            class="text-xs font-medium px-2 py-1 rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
          >
            {action.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>
  
  {#if notification.dismissible}
    <button
      on:click={dismiss}
      class="flex-shrink-0 ml-4 text-current opacity-60 hover:opacity-100 transition-opacity"
    >
      <X class="w-4 h-4" />
    </button>
  {/if}
</div>