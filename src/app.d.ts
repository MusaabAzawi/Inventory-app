// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
        preferredLanguage: string;
      } | null;
    }
    interface PageData {
      user: App.Locals['user'];
    }
    // interface Error {}
    // interface Platform {}
  }
}

export {};