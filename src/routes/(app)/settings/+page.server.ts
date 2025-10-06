// src/routes/(app)/settings/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return { settings: {} };
  }

  try {
    // Get all system settings
    const settingsData = await prisma.settings.findMany();
    
    // Convert to key-value object
    const settings = settingsData.reduce((acc, setting) => {
      let value = setting.value;
      
      // Parse based on type
      switch (setting.type) {
        case 'NUMBER':
          value = parseFloat(setting.value);
          break;
        case 'BOOLEAN':
          value = setting.value === 'true';
          break;
        case 'JSON':
          try {
            value = JSON.parse(setting.value);
          } catch {
            value = setting.value;
          }
          break;
        // STRING is default, no parsing needed
      }
      
      acc[setting.key] = value;
      return acc;
    }, {} as Record<string, any>);

    return { settings };
  } catch (error) {
    console.error('Error loading settings:', error);
    return { settings: {} };
  }
};

export const actions: Actions = {
  updateCompany: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized' });
    }

    try {
      const formData = await request.formData();
      const companySettings = [
        { key: 'companyNameEn', value: formData.get('companyNameEn')?.toString() || '', type: 'STRING' },
        { key: 'companyNameAr', value: formData.get('companyNameAr')?.toString() || '', type: 'STRING' },
        { key: 'companyEmail', value: formData.get('companyEmail')?.toString() || '', type: 'STRING' },
        { key: 'companyPhone', value: formData.get('companyPhone')?.toString() || '', type: 'STRING' },
        { key: 'companyAddress', value: formData.get('companyAddress')?.toString() || '', type: 'STRING' },
        { key: 'companyCity', value: formData.get('companyCity')?.toString() || '', type: 'STRING' },
        { key: 'companyState', value: formData.get('companyState')?.toString() || '', type: 'STRING' },
        { key: 'companyZipCode', value: formData.get('companyZipCode')?.toString() || '', type: 'STRING' },
        { key: 'companyCountry', value: formData.get('companyCountry')?.toString() || '', type: 'STRING' },
        { key: 'companyTaxId', value: formData.get('companyTaxId')?.toString() || '', type: 'STRING' },
        { key: 'companyWebsite', value: formData.get('companyWebsite')?.toString() || '', type: 'STRING' }
      ];

      for (const setting of companySettings) {
        await prisma.settings.upsert({
          where: { key: setting.key },
          update: { value: setting.value, type: setting.type },
          create: { key: setting.key, value: setting.value, type: setting.type }
        });
      }

      return { success: true, message: 'Company settings saved successfully' };
    } catch (error) {
      console.error('Company settings save error:', error);
      return fail(500, { error: 'Failed to save company settings' });
    }
  },

  updateSystem: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized' });
    }

    try {
      const formData = await request.formData();
      const updates: Array<{ key: string; value: string; type: string }> = [];

      for (const [key, value] of formData.entries()) {
        let processedValue = value.toString();
        let type = 'STRING';

        if (key.includes('threshold') || key.includes('timeout') || key.includes('attempts')) {
          type = 'NUMBER';
        } else if (key.includes('auto') || key.includes('enable') || key.includes('notifications') || key.includes('darkMode') || key.includes('twoFactor')) {
          type = 'BOOLEAN';
          processedValue = value === 'on' ? 'true' : 'false';
        }

        updates.push({ key, value: processedValue, type });
      }

      for (const update of updates) {
        await prisma.settings.upsert({
          where: { key: update.key },
          update: {
            value: update.value,
            type: update.type
          },
          create: {
            key: update.key,
            value: update.value,
            type: update.type
          }
        });
      }

      return { success: true, message: 'System settings saved successfully' };
    } catch (error) {
      console.error('Settings save error:', error);
      return fail(500, { error: 'Failed to save settings' });
    }
  }
};