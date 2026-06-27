import { create } from 'zustand';
import { Preferences } from '@capacitor/preferences';

interface SetupConfig {
  app_name: string;
  api_url: string;
  app_description: string;
  app_country: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
  database_url: string;
  app_secret: string;
}

interface SetupState {
  isConfigured: boolean;
  isLoading: boolean;
  config: Partial<SetupConfig>;
  checkSetup: () => Promise<void>;
  saveSetup: (config: SetupConfig) => Promise<{ ok: boolean; error?: string }>;
  resetSetup: () => Promise<void>;
}

export const useSetupStore = create<SetupState>((set, get) => ({
  isConfigured: false,
  isLoading: true,
  config: {},

  checkSetup: async () => {
    try {
      // Verificar se API_URL está definida (pelo env ou por setup anterior)
      const envApiUrl = import.meta.env.VITE_API_URL;
      const { value: savedApiUrl } = await Preferences.get({ key: 'cp_api_url' });
      const { value: setupDone } = await Preferences.get({ key: 'cp_setup_done' });

      const apiUrl = envApiUrl || savedApiUrl;

      if (apiUrl && setupDone === 'true') {
        // Testar se a API responde
        try {
          const res = await fetch(`${apiUrl}/ping`, { signal: AbortSignal.timeout(5000) });
          if (res.ok || res.status === 404) {
            // API acessível (404 é ok, significa que está online mas rota não existe)
            set({ isConfigured: true, isLoading: false, config: { api_url: apiUrl } });
            return;
          }
        } catch {
          // API não responde — mostrar wizard para reconfigurar
        }
      }

      set({ isConfigured: false, isLoading: false });
    } catch {
      set({ isConfigured: false, isLoading: false });
    }
  },

  saveSetup: async (config: SetupConfig) => {
    try {
      // Chamar a rota de setup da API que cria o admin e configura a BD
      const res = await fetch(`${config.api_url}/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_name:         config.app_name,
          app_description:  config.app_description,
          app_country:      config.app_country,
          admin_name:       config.admin_name,
          admin_email:      config.admin_email,
          admin_password:   config.admin_password,
          database_url:     config.database_url,
          app_secret:       config.app_secret,
        }),
      });

      const data = await res.json();
      if (!data.ok) return { ok: false, error: data.error || 'Erro no servidor.' };

      // Guardar configuração localmente
      await Preferences.set({ key: 'cp_api_url',    value: config.api_url });
      await Preferences.set({ key: 'cp_setup_done', value: 'true' });
      await Preferences.set({ key: 'cp_app_name',   value: config.app_name });

      set({ isConfigured: true, config: { api_url: config.api_url } });
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Erro de ligação.' };
    }
  },

  resetSetup: async () => {
    await Preferences.remove({ key: 'cp_api_url' });
    await Preferences.remove({ key: 'cp_setup_done' });
    await Preferences.remove({ key: 'cp_app_name' });
    set({ isConfigured: false, config: {} });
  },
}));
