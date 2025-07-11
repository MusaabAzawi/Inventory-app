<script lang="ts">
  import { locale } from 'svelte-i18n';
  import { setLocale } from '$lib/i18n';
  import { Globe } from 'lucide-svelte';
  
  $: currentLocale = $locale || 'ar';
  
  function switchLanguage() {
    const newLocale = currentLocale === 'ar' ? 'en' : 'ar';
    setLocale(newLocale);
    
    // Update user preference
    fetch('/api/user/language', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: newLocale })
    });
  }
</script>

<button
  on:click={switchLanguage}
  class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 
         bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 
         dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
  title={currentLocale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
>
  <Globe class="h-4 w-4" />
  <span>{currentLocale === 'ar' ? 'EN' : 'عربي'}</span>
</button>