<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  import LanguageSwitcher from '$lib/components/layout/LanguageSwitcher.svelte';
  import { Eye, EyeOff } from 'lucide-svelte';
  
  export let form: ActionData;
  
  let showPassword = false;
  let showConfirmPassword = false;
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div class="text-center">
      <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">
        {$_('auth.register')}
      </h2>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Create your inventory management account
      </p>
      <div class="mt-4 flex justify-center">
        <LanguageSwitcher />
      </div>
    </div>
    
    <form method="POST" use:enhance class="mt-8 space-y-6">
      {#if form?.error}
        <div class="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {form.error}
        </div>
      {/if}
      
      <div class="space-y-4">
        <!-- Name -->
        <div>
          <label for="name" class="label">{$_('auth.name')} *</label>
          <input
            id="name"
            name="name"
            type="text"
            autocomplete="name"
            required
            class="input"
            value={form?.name ?? ''}
          />
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="label">{$_('auth.email')} *</label>
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
        
        <!-- Password -->
        <div>
          <label for="password" class="label">{$_('auth.password')} *</label>
          <div class="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autocomplete="new-password"
              required
              minlength="6"
              class="input pr-10"
            />
            <button
              type="button"
              on:click={() => showPassword = !showPassword}
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {#if showPassword}
                <EyeOff class="h-4 w-4" />
              {:else}
                <Eye class="h-4 w-4" />
              {/if}
            </button>
          </div>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Minimum 6 characters
          </p>
        </div>

        <!-- Confirm Password -->
        <div>
          <label for="confirmPassword" class="label">{$_('auth.confirmPassword')} *</label>
          <div class="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autocomplete="new-password"
              required
              minlength="6"
              class="input pr-10"
            />
            <button
              type="button"
              on:click={() => showConfirmPassword = !showConfirmPassword}
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {#if showConfirmPassword}
                <EyeOff class="h-4 w-4" />
              {:else}
                <Eye class="h-4 w-4" />
              {/if}
            </button>
          </div>
        </div>

        <!-- Preferred Language -->
        <div>
          <label for="preferredLanguage" class="label">Preferred Language</label>
          <select
            id="preferredLanguage"
            name="preferredLanguage"
            class="input"
            value={form?.preferredLanguage ?? 'ar'}
          >
            <option value="ar">العربية (Arabic)</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">
          Already have an account?
        </span>
        <a href="/auth/login" class="text-blue-600 hover:text-blue-500 font-medium">
          {$_('auth.login')}
        </a>
      </div>

      <button type="submit" class="w-full btn-primary btn-lg">
        {$_('auth.registerButton')}
      </button>
    </form>
  </div>
</div>