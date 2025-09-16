<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import {
    ShoppingCart,
    Package,
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Eye,
    Activity,
    BarChart3
  } from 'lucide-svelte';
  import type { PageData } from './$types';
  import { currencyStore, currentCurrency } from '$lib/stores/currency';
  import { formatCurrency, formatCurrencyWithConversion } from '$lib/utils/currency';
  import CurrencySwitcher from '$lib/components/layout/CurrencySwitcher.svelte';
  
  export let data: PageData;
  
  let inventoryChart: any;
  let categoryChart: any;
  let topProductsChart: any;

  // Import Chart.js dynamically
  onMount(async () => {
    const Chart = await import('chart.js/auto');
    initCharts(Chart.default);
  });

  function initCharts(Chart: any) {
    // Inventory Movements Chart
    const inventoryCtx = document.getElementById('inventoryChart') as HTMLCanvasElement;
    if (inventoryCtx && data.chartData?.inventoryMovements) {
      inventoryChart = new Chart(inventoryCtx, {
        type: 'bar',
        data: {
          labels: data.chartData.inventoryMovements.map(item => item.date),
          datasets: [
            {
              label: $_('dashboard.charts.stockIn'),
              data: data.chartData.inventoryMovements.map(item => item.stockIn),
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              borderColor: 'rgba(34, 197, 94, 1)',
              borderWidth: 1
            },
            {
              label: $_('dashboard.charts.stockOut'),
              data: data.chartData.inventoryMovements.map(item => item.stockOut),
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              borderColor: 'rgba(239, 68, 68, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            },
            title: {
              display: true,
              text: $_('dashboard.charts.inventoryMovementsTitle')
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    }

    // Category Distribution Chart
    const categoryCtx = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (categoryCtx && data.chartData?.categoryDistribution) {
      const colors = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
      ];

      categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
          labels: data.chartData.categoryDistribution.map(item => 
            $locale === 'ar' ? item.category?.nameAr : item.category?.nameEn
          ),
          datasets: [{
            data: data.chartData.categoryDistribution.map(item => item._count._all),
            backgroundColor: colors.slice(0, data.chartData.categoryDistribution.length),
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            },
            title: {
              display: true,
              text: $_('dashboard.charts.categoryDistributionTitle')
            }
          }
        }
      });
    }

    // Top Products Chart
    const topProductsCtx = document.getElementById('topProductsChart') as HTMLCanvasElement;
    if (topProductsCtx && data.chartData?.topProducts) {
      topProductsChart = new Chart(topProductsCtx, {
        type: 'horizontalBar',
        data: {
          labels: data.chartData.topProducts.map(item => 
            $locale === 'ar' ? item.product?.nameAr : item.product?.nameEn
          ),
          datasets: [{
            label: $_('dashboard.charts.revenue'),
            data: data.chartData.topProducts.map(item => item._sum.total || 0),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: $_('dashboard.charts.topProductsTitle')
            }
          },
          scales: {
            x: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  function formatCurrencyForDisplay(amount: number, storedCurrency: string = 'USD') {
    // Most monetary values in the database are stored in USD
    // Only convert if the stored currency differs from display currency
    if (storedCurrency === $currentCurrency.code) {
      // No conversion needed - just format
      return formatCurrency(amount, $currentCurrency.code, $locale);
    } else {
      // Convert from stored currency to display currency
      return formatCurrencyWithConversion(amount, storedCurrency, $currentCurrency.code, $locale);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString($locale === 'ar' ? 'ar-SA' : 'en-US');
  }

  $: stats = [
    {
      title: $_('dashboard.stats.totalProducts'),
      value: data.stats?.totalProducts?.toLocaleString() || '0',
      icon: Package,
      color: 'bg-blue-500',
      change: null
    },
    {
      title: $_('dashboard.stats.todaysSales'),
      value: data.stats?.totalSalesToday?.toString() || '0',
      icon: ShoppingCart,
      color: 'bg-green-500',
      change: null
    },
    {
      title: $_('dashboard.stats.monthlyRevenue'),
      value: formatCurrencyForDisplay(data.stats?.totalSalesThisMonth || 0),
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: $_('dashboard.stats.salesCount', { values: { count: data.stats?.salesCountThisMonth || 0 } })
    },
    {
      title: $_('dashboard.stats.inventoryValue'),
      value: formatCurrencyForDisplay(data.stats?.inventoryValue || 0),
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: null
    },
    {
      title: $_('dashboard.stats.lowStockItems'),
      value: data.stats?.lowStockItems?.toString() || '0',
      icon: AlertTriangle,
      color: 'bg-orange-500',
      change: $_('dashboard.stats.outOfStock', { values: { count: data.stats?.outOfStockItems || 0 } })
    }
  ];
</script>

<div class="space-y-8">
  <!-- Welcome Header -->
  <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold mb-2">
          {$_('nav.dashboard')}
        </h1>
        <p class="text-blue-100">
          {$_('dashboard.welcome', { values: { name: data.user?.name } })}
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <div class="text-blue-100 text-sm">
          {$_('dashboard.currency', { values: { currency: $currentCurrency.nameEn } }) || `Currency: ${$currentCurrency.nameEn}`}
        </div>
        <CurrencySwitcher />
      </div>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
    {#each stats as stat}
      <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <div class="flex items-center">
          <div class="p-3 rounded-full {stat.color} text-white">
            <svelte:component this={stat.icon} class="h-6 w-6" />
          </div>
          <div class="ltr:ml-4 rtl:mr-4 flex-1">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
              {stat.title}
            </p>
            <p class="text-xl font-semibold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            {#if stat.change}
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {stat.change}
              </p>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Charts Section -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Inventory Movements Chart -->
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {$_('dashboard.charts.inventoryMovements')}
        </h2>
        <BarChart3 class="h-5 w-5 text-gray-400" />
      </div>
      <div class="h-64">
        <canvas id="inventoryChart"></canvas>
      </div>
    </div>

    <!-- Category Distribution -->
    <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {$_('dashboard.charts.categoryDistribution')}
        </h2>
        <Package class="h-5 w-5 text-gray-400" />
      </div>
      <div class="h-64">
        <canvas id="categoryChart"></canvas>
      </div>
    </div>
  </div>

  <!-- Bottom Section -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Recent Sales -->
    <div class="lg:col-span-1 bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {$_('dashboard.sections.recentSales')}
        </h2>
        <ShoppingCart class="h-5 w-5 text-gray-400" />
      </div>
      
      {#if data.recentSales?.length}
        <div class="space-y-4">
          {#each data.recentSales as sale}
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
              <div>
                <p class="font-medium text-gray-900 dark:text-white text-sm">
                  #{sale.invoiceNumber}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(sale.createdAt)}
                </p>
                {#if sale.customer}
                  <p class="text-xs text-blue-600 dark:text-blue-400">
                    {$locale === 'ar' ? sale.customer.nameAr : sale.customer.nameEn}
                  </p>
                {/if}
              </div>
              <div class="text-right">
                <span class="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrencyForDisplay(sale.netAmount)}
                </span>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  by {sale.user.name}
                </p>
              </div>
            </div>
          {/each}
        </div>
        <div class="mt-4 text-center">
          <a href="/sales" class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
            {$_('dashboard.actions.viewAllSales')}
          </a>
        </div>
      {:else}
        <div class="text-center py-8 text-gray-500 dark:text-gray-400">
          <ShoppingCart class="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>{$_('dashboard.messages.noRecentSales')}</p>
        </div>
      {/if}
    </div>

    <!-- Low Stock Alert -->
    <div class="lg:col-span-1 bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {$_('dashboard.sections.stockAlerts')}
        </h2>
        <AlertTriangle class="h-5 w-5 text-yellow-500" />
      </div>
      
      {#if data.lowStockProducts?.length}
        <div class="space-y-3 max-h-64 overflow-y-auto">
          {#each data.lowStockProducts as product}
            <div class="flex items-center justify-between p-3 rounded-lg"
                 class:bg-red-50={product.quantity === 0}
                 class:bg-yellow-50={product.quantity > 0 && product.quantity <= product.minQuantity}
                 class:dark:bg-red-900={product.quantity === 0}
                 class:dark:bg-yellow-900={product.quantity > 0 && product.quantity <= product.minQuantity}>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {$locale === 'ar' ? product.nameAr : product.nameEn}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  SKU: {product.sku}
                </p>
                {#if product.category}
                  <p class="text-xs text-blue-600 dark:text-blue-400">
                    {$locale === 'ar' ? product.category.nameAr : product.category.nameEn}
                  </p>
                {/if}
              </div>
              <div class="text-right">
                <p class="text-sm font-medium"
                   class:text-red-600={product.quantity === 0}
                   class:text-yellow-600={product.quantity > 0 && product.quantity <= product.minQuantity}>
                  {product.quantity} / {product.minQuantity}
                </p>
                <p class="text-xs"
                   class:text-red-600={product.quantity === 0}
                   class:text-yellow-600={product.quantity > 0}>
                  {product.quantity === 0 ? $_('dashboard.messages.outOfStock') : $_('dashboard.messages.lowStock')}
                </p>
              </div>
            </div>
          {/each}
        </div>
        <div class="mt-4 text-center">
          <a href="/inventory?filter=low-stock" class="text-sm text-yellow-600 hover:text-yellow-500">
            {$_('dashboard.actions.viewAllAlerts')}
          </a>
        </div>
      {:else}
        <div class="text-center py-8 text-gray-500 dark:text-gray-400">
          <Package class="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>{$_('dashboard.messages.allProductsWellStocked')}</p>
        </div>
      {/if}
    </div>

    <!-- Top Products -->
    <div class="lg:col-span-1 bg-white rounded-lg shadow p-6 dark:bg-gray-800">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {$_('dashboard.charts.topProducts')}
        </h2>
        <TrendingUp class="h-5 w-5 text-gray-400" />
      </div>
      <div class="h-64">
        <canvas id="topProductsChart"></canvas>
      </div>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {$_('dashboard.sections.quickActions')}
    </h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <a href="/inventory/products/new" class="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors dark:bg-blue-900 dark:hover:bg-blue-800">
        <Package class="h-8 w-8 text-blue-600 mb-2" />
        <span class="text-sm font-medium text-blue-900 dark:text-blue-100">{$_('dashboard.actions.addProduct')}</span>
      </a>
      
      <a href="/sales/new" class="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors dark:bg-green-900 dark:hover:bg-green-800">
        <ShoppingCart class="h-8 w-8 text-green-600 mb-2" />
        <span class="text-sm font-medium text-green-900 dark:text-green-100">{$_('dashboard.actions.newSale')}</span>
      </a>
      
      <a href="/inventory" class="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors dark:bg-purple-900 dark:hover:bg-purple-800">
        <Eye class="h-8 w-8 text-purple-600 mb-2" />
        <span class="text-sm font-medium text-purple-900 dark:text-purple-100">{$_('dashboard.actions.viewInventory')}</span>
      </a>
      
      <a href="/reports" class="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors dark:bg-orange-900 dark:hover:bg-orange-800">
        <BarChart3 class="h-8 w-8 text-orange-600 mb-2" />
        <span class="text-sm font-medium text-orange-900 dark:text-orange-100">{$_('dashboard.actions.reports')}</span>
      </a>
    </div>
  </div>
</div>