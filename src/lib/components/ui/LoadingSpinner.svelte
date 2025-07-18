<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let color: string = 'text-blue-500';
  export let text: string = '';

  $: sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }[size];
</script>

<div class="flex flex-col items-center justify-center gap-2">
  <div class="animate-spin rounded-full border-b-2 border-current {sizeClass} {color}"></div>
  {#if text}
    <p class="text-sm text-gray-600 dark:text-gray-400">{text}</p>
  {/if}
</div>