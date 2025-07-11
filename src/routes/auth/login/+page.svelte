<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  import LanguageSwitcher from '$lib/components/layout/LanguageSwitcher.svelte';
  
  export let form: ActionData;
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div class="text-center">
      <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">
        {$_('auth.login')}
      </h2>
      <div class="mt-4 flex justify-center">
        <LanguageSwitcher />
      </div>
    </div>
    
    <form method="POST" use:enhance class="mt-8 space-y-6">
      {#if form?.error}
        <div class="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {$_(form.error)}
        </div>
      {/if}
      
      <div class="space-y-4">
        <div>
          <label for="email" class="label">{$_('auth.email')}</label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            class="input"
            value={form?.email ?? ''}
          />
        </div>
        
        <div>
          <label for="password" class="label">{$_('auth.password')}</label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            class="input"
          />
        </div>
      </div>

      <div class="flex items-center justify-between">
        <a href="/auth/forgot-password" class="text-sm text-blue-600 hover:text-blue-500">
          {$_('auth.forgotPassword')}
        </a>
        <a href="/auth/register" class="text-sm text-blue-600 hover:text-blue-500">
          {$_('auth.register')}
        </a>
      </div>

      <button type="submit" class="w-full btn-primary btn-lg">
        {$_('auth.loginButton')}
      </button>
    </form>
  </div>
</div>