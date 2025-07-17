<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { Camera, X, RotateCcw, Zap } from 'lucide-svelte';
  
  export let onScan: (barcode: string) => void;
  export let onClose: () => void;
  export let title = '';
  
  const dispatch = createEventDispatcher();
  
  let videoElement: HTMLVideoElement;
  let canvasElement: HTMLCanvasElement;
  let stream: MediaStream | null = null;
  let scanning = false;
  let permissionDenied = false;
  let error = '';
  let devices: MediaDeviceInfo[] = [];
  let selectedDeviceId = '';
  let isProcessing = false;
  
  onMount(async () => {
    await loadCameraDevices();
  });

  onDestroy(() => {
    stopScanning();
  });

  async function loadCameraDevices() {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      devices = allDevices.filter(device => device.kind === 'videoinput');
      
      if (devices.length > 0) {
        // Prefer back camera for mobile devices
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        selectedDeviceId = backCamera?.deviceId || devices[0].deviceId;
      }
    } catch (err) {
      console.error('Failed to load camera devices:', err);
      error = $_('barcode.cameraPermission');
    }
  }

  async function startScanning() {
    if (!selectedDeviceId) {
      error = $_('barcode.cameraPermission');
      return;
    }

    try {
      scanning = true;
      error = '';
      permissionDenied = false;

      // Stop any existing stream
      stopScanning();

      // Get camera stream
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedDeviceId,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Prefer back camera
        }
      });

      videoElement.srcObject = stream;
      await videoElement.play();

      // Start scanning process
      requestAnimationFrame(scanFrame);
      
    } catch (err: any) {
      console.error('Camera access error:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        permissionDenied = true;
        error = $_('barcode.cameraPermission');
      } else if (err.name === 'NotFoundError') {
        error = 'No camera found';
      } else {
        error = $_('barcode.scanError');
      }
      scanning = false;
    }
  }

  function scanFrame() {
    if (!scanning || !videoElement || !canvasElement || isProcessing) {
      return;
    }

    const canvas = canvasElement.getContext('2d');
    if (!canvas) return;

    // Set canvas size to match video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // Draw video frame to canvas
    canvas.drawImage(videoElement, 0, 0);

    // Get image data for barcode detection
    const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
    
    // Simple barcode detection (you can replace this with a proper library)
    detectBarcode(imageData);

    // Continue scanning
    if (scanning) {
      requestAnimationFrame(scanFrame);
    }
  }

  async function detectBarcode(imageData: ImageData) {
    if (isProcessing) return;
    
    try {
      isProcessing = true;
      
      // For demo purposes, we'll simulate barcode detection
      // In a real implementation, you'd use @zxing-js/library or similar
      
      // Check for patterns or use actual barcode detection library
      const result = await simulateBarcodeDetection(imageData);
      
      if (result) {
        handleBarcodeDetected(result);
      }
    } catch (err) {
      console.error('Barcode detection error:', err);
    } finally {
      isProcessing = false;
    }
  }

  async function simulateBarcodeDetection(imageData: ImageData): Promise<string | null> {
    // This is a simplified simulation
    // Replace with actual barcode detection library
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate finding a barcode occasionally
        if (Math.random() > 0.95) {
          resolve('1234567890123');
        } else {
          resolve(null);
        }
      }, 100);
    });
  }

  function handleBarcodeDetected(barcode: string) {
    stopScanning();
    onScan(barcode);
    dispatch('scan', { barcode });
  }

  function stopScanning() {
    scanning = false;
    isProcessing = false;
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    
    if (videoElement) {
      videoElement.srcObject = null;
    }
  }

  function switchCamera() {
    const currentIndex = devices.findIndex(d => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    selectedDeviceId = devices[nextIndex].deviceId;
    
    if (scanning) {
      stopScanning();
      setTimeout(startScanning, 100);
    }
  }

  function retry() {
    error = '';
    permissionDenied = false;
    startScanning();
  }

  function simulateScan() {
    // For testing - simulate a successful scan
    const testBarcode = '1234567890123';
    handleBarcodeDetected(testBarcode);
  }
</script>

<div class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-lg max-w-lg w-full dark:bg-gray-800">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
        <Camera class="h-5 w-5" />
        {title || $_('barcode.scanner')}
      </h3>
      <button
        on:click={onClose}
        class="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700"
      >
        <X class="h-5 w-5 text-gray-500" />
      </button>
    </div>
    
    <div class="p-4">
      {#if permissionDenied}
        <!-- Permission Denied -->
        <div class="text-center py-8">
          <Camera class="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {$_('barcode.cameraPermission')}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Please allow camera access to scan barcodes
          </p>
          <button
            on:click={retry}
            class="btn-primary btn-md"
          >
            <RotateCcw class="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            Try Again
          </button>
        </div>
      {:else if error}
        <!-- Error State -->
        <div class="text-center py-8">
          <div class="text-red-500 mb-4">
            <svg class="mx-auto h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Scan Error
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <div class="flex gap-2 justify-center">
            <button
              on:click={retry}
              class="btn-primary btn-md"
            >
              <RotateCcw class="w-4 h-4 ltr:mr-2 rtl:ml-2" />
              Try Again
            </button>
            <button
              on:click={simulateScan}
              class="btn-secondary btn-md"
            >
              <Zap class="w-4 h-4 ltr:mr-2 rtl:ml-2" />
              Test Scan
            </button>
          </div>
        </div>
      {:else}
        <!-- Camera Preview -->
        <div class="relative">
          <!-- Video Element -->
          <video
            bind:this={videoElement}
            class="w-full h-64 bg-gray-900 rounded-lg object-cover"
            autoplay
            muted
            playsinline
          ></video>
          
          <!-- Hidden canvas for processing -->
          <canvas bind:this={canvasElement} class="hidden"></canvas>

          <!-- Scanning Overlay -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <!-- Viewfinder -->
            <div class="relative">
              <div class="w-64 h-40 border-2 border-white rounded-lg relative">
                <!-- Corner brackets -->
                <div class="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                <div class="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                <div class="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                <div class="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                
                <!-- Scanning animation -->
                {#if scanning}
                  <div class="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
                    <div class="h-0.5 bg-blue-500 animate-pulse"></div>
                  </div>
                {/if}
                
                <!-- Processing indicator -->
                {#if isProcessing}
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                      Processing...
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          </div>

          <!-- Controls overlay -->
          <div class="absolute bottom-4 left-0 right-0">
            <div class="flex justify-center gap-2">
              {#if !scanning}
                <button
                  on:click={startScanning}
                  class="btn-primary btn-md"
                >
                  <Camera class="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                  Start Scanning
                </button>
              {:else}
                <button
                  on:click={stopScanning}
                  class="btn-secondary btn-md"
                >
                  Stop
                </button>
              {/if}
              
              <!-- Test button for development -->
              <button
                on:click={simulateScan}
                class="btn-secondary btn-md"
              >
                <Zap class="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                Test
              </button>
            </div>
          </div>
        </div>

        <!-- Device Selection -->
        {#if devices.length > 1}
          <div class="mt-4">
            <label for="camera-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Camera
            </label>
            <div class="flex gap-2">
              <select
                id="camera-select"
                bind:value={selectedDeviceId}
                class="flex-1 input"
              >
                {#each devices as device, index}
                  <option value={device.deviceId}>
                    {device.label || `Camera ${index + 1}`}
                  </option>
                {/each}
              </select>
              <button
                on:click={switchCamera}
                class="btn-secondary btn-md"
                title="Switch Camera"
              >
                <RotateCcw class="w-4 h-4" />
              </button>
            </div>
          </div>
        {/if}

        <!-- Instructions -->
        <div class="mt-4 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {scanning ? 'Position the barcode in the frame' : 'Click "Start Scanning" to begin'}
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>