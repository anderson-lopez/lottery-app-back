import Settings from '../models/settings.model.js';

let cachedSettings = null;

export const loadSettings = async () => {
  if (!cachedSettings) {
    const settings = await Settings.findOne();
    if (!settings) throw new Error("⚠️ No se encontró la configuración en la base de datos");
    cachedSettings = settings;
  }
  return cachedSettings;
};