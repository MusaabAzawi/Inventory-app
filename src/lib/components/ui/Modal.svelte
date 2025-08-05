<!-- src/lib/components/ui/Modal.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { X } from 'lucide-svelte';

  export let open = false;
  export let title = '';
  export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let persistent = false;

  const dispatch = createEventDispatcher();

  function close() {
    if (persistent) return;
    open = false;
    dispatch('close');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && !persistent) {
      close();
    }
  }

  function handleBackdropClick() {
    if (!persistent) {
      close();
    }
  }

  function handleBackdropKeydown(event: KeyboardEvent) {
    if ((event.key === 'Enter' || event.key === ' ') && !persistent) {
      event.preventDefault();
      close();
    }
  }

  $: sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined}>
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      transition:fade
      on:click={handleBackdropClick}
      on:keydown={handleBackdropKeydown}
      role="button"
      tabindex={persistent ? -1 : 0}
      aria-label={persistent ? undefined : "Close modal"}
    ></div>

    <!-- Modal Container -->
    <div class="flex min-h-full items-center justify-center p-4" role="presentation">
      <div 
        class="relative bg-white rounded-lg shadow-xl w-full {sizeClasses[size]} transform transition-all dark:bg-gray-800"
        transition:fly="{{ y: -20, duration: 300 }}"
        on:click|stopPropagation
        on:keydown|stopPropagation
        role="document"
      >
        <!-- Header -->
        {#if title || !persistent}
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            {#if title}
              <h3 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            {:else}
              <div></div>
            {/if}
            {#if !persistent}
              <button
                on:click={close}
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Close modal"
              >
                <X class="w-6 h-6" />
              </button>
            {/if}
          </div>
        {/if}

        <!-- Content -->
        <div class="p-6">
          <slot />
        </div>

        <!-- Footer -->
        {#if $$slots.footer}
          <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
            <slot name="footer" />
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}