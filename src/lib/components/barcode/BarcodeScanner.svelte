<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { Html5QrcodeScanner } from 'html5-qrcode';
  import { Camera, X } from 'lucide-svelte';
  
  export let onScan: (barcode: string) => void;
  export let onClose: () => void;
  
  let scannerRef: HTMLDivElement;
  let scanner: Html5QrcodeScanner;
  
  onMount(() => {
    scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      false
    );
    
    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear();
      },
      (error) => {
        // Handle scan error
        console.warn(`Code scan error = ${error}`);
      }
    );
  });
  
  onDestroy(() => {
    if (scanner) {
      scanner.clear();
    }
  });
</script>

<div class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-lg max-w-lg w-full p-4 dark:bg-gray-800">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <Camera class="h-5 w-5" />
        {$_('barcode.scanProduct')}
      </h3>
      <button
        on:click={onClose}
        class="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700"
      >
        <X class="h-5 w-5" />
      </button>
    </div>
    
    <div id="reader" bind:this={scannerRef}></div>
    
    <p class="text-sm text-gray-600 mt-4 text-center dark:text-gray-400">
      {$_('barcode.startScanning')}
    </p>
  </div>
</div>