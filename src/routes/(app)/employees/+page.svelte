<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { notifications } from '$lib/stores/notifications.js';
	import { displayAmount } from '$lib/utils/currencyHelper';

	interface Employee {
		id: string;
		nameEn: string;
		nameAr: string;
		email?: string;
		phone?: string;
		position?: string;
		salary?: number;
		hireDate: string;
		isActive: boolean;
		createdAt: string;
	}

	let employees: Employee[] = [];
	let loading = true;
	let showModal = false;
	let editingEmployee: Employee | null = null;
	let formData = {
		nameEn: '',
		nameAr: '',
		email: '',
		phone: '',
		position: '',
		salary: '',
		isActive: true
	};

	const columns = [
		{ key: 'nameAr', label: 'employees.nameArabic' },
		{ key: 'nameEn', label: 'employees.nameEnglish' },
		{ key: 'position', label: 'employees.position' },
		{ key: 'email', label: 'employees.email' },
		{ key: 'phone', label: 'employees.phone' },
		{ key: 'salary', label: 'employees.salary' },
		{ key: 'isActive', label: 'common.status' }
	];

	onMount(async () => {
		await loadEmployees();
	});

	async function loadEmployees() {
		try {
			const response = await fetch('/api/employees');
			if (response.ok) {
				employees = await response.json();
			} else {
				notifications.add({ type: 'error', message: 'Failed to load employees' });
			}
		} catch (error) {
			notifications.add({ type: 'error', message: 'Error loading employees' });
		} finally {
			loading = false;
		}
	}

	function openAddModal() {
		editingEmployee = null;
		formData = {
			nameEn: '',
			nameAr: '',
			email: '',
			phone: '',
			position: '',
			salary: '',
			isActive: true
		};
		showModal = true;
	}

	function openEditModal(employee: Employee) {
		editingEmployee = employee;
		formData = {
			nameEn: employee.nameEn,
			nameAr: employee.nameAr,
			email: employee.email || '',
			phone: employee.phone || '',
			position: employee.position || '',
			salary: employee.salary?.toString() || '',
			isActive: employee.isActive
		};
		showModal = true;
	}

	async function saveEmployee() {
		try {
			const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : '/api/employees';
			const method = editingEmployee ? 'PUT' : 'POST';
			
			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					...formData,
					salary: formData.salary ? parseFloat(formData.salary) : null
				})
			});

			if (response.ok) {
				notifications.add({ 
					type: 'success', 
					message: editingEmployee ? 'Employee updated successfully' : 'Employee added successfully' 
				});
				showModal = false;
				await loadEmployees();
			} else {
				const error = await response.text();
				notifications.add({ type: 'error', message: error });
			}
		} catch (error) {
			notifications.add({ type: 'error', message: 'Error saving employee' });
		}
	}

	async function deleteEmployee(employee: Employee) {
		if (confirm(`Are you sure you want to delete ${employee.nameEn}?`)) {
			try {
				const response = await fetch(`/api/employees/${employee.id}`, {
					method: 'DELETE'
				});

				if (response.ok) {
					notifications.add({ type: 'success', message: 'Employee deleted successfully' });
					await loadEmployees();
				} else {
					const error = await response.text();
					notifications.add({ type: 'error', message: error });
				}
			} catch (error) {
				notifications.add({ type: 'error', message: 'Error deleting employee' });
			}
		}
	}

</script>

<svelte:head>
	<title>{$_('employees.title')} - Inventory Pro</title>
</svelte:head>

<div class="p-6">
	<div class="flex justify-between items-center mb-6">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
				{$_('employees.title')}
			</h1>
			<p class="text-gray-600 dark:text-gray-400 mt-1">
				Manage your workforce and employee information
			</p>
		</div>
		<button
			on:click={openAddModal}
			class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			{$_('employees.addEmployee')}
		</button>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
						<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
					</div>
				</div>
				<div class="mr-5">
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
						{$_('employees.totalEmployees')}
					</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{employees.length}
					</p>
				</div>
			</div>
		</div>

		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
						<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
				</div>
				<div class="mr-5">
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
						{$_('employees.activeEmployees')}
					</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{employees.filter(e => e.isActive).length}
					</p>
				</div>
			</div>
		</div>

		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
						<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
						</svg>
					</div>
				</div>
				<div class="mr-5">
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
						Total Payroll
					</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{displayAmount(employees.filter(e => e.isActive && e.salary).reduce((sum, e) => sum + (e.salary || 0), 0))}
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Data Table -->
	<div class="overflow-hidden">
		<DataTable
			data={employees}
			{columns}
			{loading}
		>
			<svelte:fragment slot="row" let:item>
				{#each columns as column}
					<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
						{#if column.key === 'salary'}
							{item.salary ? displayAmount(item.salary) : '-'}
						{:else if column.key === 'isActive'}
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
								{item.isActive ? $_('employees.active') : $_('employees.inactive')}
							</span>
						{:else}
							{item[column.key] || '-'}
						{/if}
					</td>
				{/each}
			</svelte:fragment>
			
			<svelte:fragment slot="actions" let:item>
				<div class="flex space-x-2">
					<button
						on:click={() => openEditModal(item)}
						class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
					>
						{$_('common.edit')}
					</button>
					<button
						on:click={() => deleteEmployee(item)}
						class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
					>
						{$_('common.delete')}
					</button>
				</div>
			</svelte:fragment>
		</DataTable>
	</div>
</div>

<!-- Employee Form Modal -->
<Modal bind:open={showModal} title={editingEmployee ? $_('employees.editEmployee') : $_('employees.addEmployee')}>
	<form on:submit|preventDefault={saveEmployee} class="space-y-4">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					{$_('employees.nameEnglish')}
				</label>
				<input
					type="text"
					bind:value={formData.nameEn}
					required
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
				/>
			</div>
			
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					{$_('employees.nameArabic')}
				</label>
				<input
					type="text"
					bind:value={formData.nameAr}
					required
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
				/>
			</div>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
				{$_('employees.email')}
			</label>
			<input
				type="email"
				bind:value={formData.email}
				class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
			/>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					{$_('employees.phone')}
				</label>
				<input
					type="tel"
					bind:value={formData.phone}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
				/>
			</div>
			
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					{$_('employees.position')}
				</label>
				<input
					type="text"
					bind:value={formData.position}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
				/>
			</div>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
				{$_('employees.salary')} (د.ع)
			</label>
			<input
				type="number"
				bind:value={formData.salary}
				min="0"
				step="1"
				class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
			/>
		</div>

		<div class="flex items-center">
			<input
				type="checkbox"
				bind:checked={formData.isActive}
				id="isActive"
				class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
			/>
			<label for="isActive" class="mr-2 text-sm text-gray-700 dark:text-gray-300">
				{$_('employees.active')}
			</label>
		</div>

		<div class="flex justify-end space-x-3 pt-4">
			<button
				type="button"
				on:click={() => showModal = false}
				class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
			>
				{$_('common.cancel')}
			</button>
			<button
				type="submit"
				class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
			>
				{$_('common.save')}
			</button>
		</div>
	</form>
</Modal>