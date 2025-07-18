<script lang="ts">
  import { notifications } from '$lib/stores/notifications';
  // ... other imports

  // Show notification on successful form submission
  function handleSuccess() {
    notifications.success(
      'Product saved successfully!',
      `${form?.nameEn || product?.nameEn} has been ${isEdit ? 'updated' : 'created'}.`
    );
  }

  function handleError(error: string) {
    notifications.error(
      'Failed to save product',
      error,
      {
        duration: 0, // Don't auto-dismiss errors
        actions: [
          {
            label: 'Try Again',
            action: () => {
              // Retry logic
            }
          }
        ]
      }
    );
  }
</script>