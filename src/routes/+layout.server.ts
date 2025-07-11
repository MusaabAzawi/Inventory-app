import type { LayoutServerData, LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }: { locals: App.Locals }) => {
  return {
    user: locals.user
  };
};