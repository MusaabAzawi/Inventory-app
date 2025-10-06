import { prisma } from '$lib/server/db';

export interface CompanySettings {
  logo?: string;
  nameEn: string;
  nameAr: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  taxId?: string;
  website?: string;
}

export async function getCompanySettings(): Promise<CompanySettings> {
  try {
    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: [
            'companyLogo',
            'companyNameEn',
            'companyNameAr',
            'companyEmail',
            'companyPhone',
            'companyAddress',
            'companyCity',
            'companyState',
            'companyZipCode',
            'companyCountry',
            'companyTaxId',
            'companyWebsite'
          ]
        }
      }
    });

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      logo: settingsMap.companyLogo,
      nameEn: settingsMap.companyNameEn || 'Inventory Management System',
      nameAr: settingsMap.companyNameAr || 'نظام إدارة المخزون',
      email: settingsMap.companyEmail || '',
      phone: settingsMap.companyPhone || '',
      address: settingsMap.companyAddress || '',
      city: settingsMap.companyCity,
      state: settingsMap.companyState,
      zipCode: settingsMap.companyZipCode,
      country: settingsMap.companyCountry,
      taxId: settingsMap.companyTaxId,
      website: settingsMap.companyWebsite
    };
  } catch (error) {
    console.error('Error loading company settings:', error);
    return {
      nameEn: 'Inventory Management System',
      nameAr: 'نظام إدارة المخزون',
      email: '',
      phone: '',
      address: ''
    };
  }
}
