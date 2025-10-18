import type {
  SystemSettings,
  AnySystemSettings,
  SystemSettingsScope,
  SiteSettings,
  AdminSettings,
  EngineSettings,
} from "shared";

import {
  defaultSiteSettings,
  defaultAdminSettings,
  defaultEngineSettings,
} from "shared/settings";

import { db } from "@adapters/services";
import { SystemSettingsApi } from "shared/interfaces/ServiceApis";

class SystemSettingsService implements SystemSettingsApi {
  // Cache: scope -> settings
  private cache: Partial<Record<SystemSettingsScope, AnySystemSettings>> = {};

  async getSiteSettings(): Promise<SiteSettings | null> {
    return this.getSettings("SITE") as Promise<SiteSettings | null>;
  }
  async getAdminSettings(): Promise<AdminSettings | null> {
    return this.getSettings("ADMIN") as Promise<AdminSettings | null>;
  }

  /**
   * Get settings by scope
   */
  async getSettings(
    scope: SystemSettingsScope
  ): Promise<AnySystemSettings | null> {
    // Return cached settings if available
    if (this.cache[scope]) return this.cache[scope]!;

    const result = await db.systemSettings.getOne({ scope });
    if (!result) return null;

    const parsed = parseSystemSettings(result);
    this.cache[scope] = parsed; // Cache it
    return parsed;
  }

  /**
   * Create or update system settings
   */
  async updateSettings<T extends AnySystemSettings>(
    scope: SystemSettingsScope,
    settings: T
  ): Promise<T> {
    const existing = await db.systemSettings.getOne({ scope });

    let updated: SystemSettings;
    if (!existing) {
      // Create new settings
      updated = await db.systemSettings.create({
        scope,
        settings,
      } as SystemSettings);
    } else {
      // Update existing settings
      updated = await db.systemSettings.update({
        ...existing,
        settings,
      } as SystemSettings & { id: string });
    }

    const parsed = parseSystemSettings(updated) as T;
    this.cache[scope] = parsed; // Update cache
    return parsed;
  }

  // set default settings for a scope if not exist
  async setDefaultSettings() {
    await this.setDefaults("SITE", defaultSiteSettings);
    await this.setDefaults("ADMIN", defaultAdminSettings);
    await this.setDefaults("ENGINE", defaultEngineSettings);
  }

  async resetToDefaultSettings() {
    await this.updateSettings("SITE", defaultSiteSettings);
    await this.updateSettings("ADMIN", defaultAdminSettings);
    await this.updateSettings("ENGINE", defaultEngineSettings);
  }

  /**
   * Set defaults if no settings exist for the scope
   */
  private async setDefaults<T extends AnySystemSettings>(
    scope: SystemSettingsScope,
    settings: T
  ): Promise<T | void> {
    const existing = await this.getSettings(scope);
    if (!existing) {
      return this.updateSettings(scope, settings);
    }
    return existing as T;
  }

  /**
   * Clear cache (optional)
   */
  clearCache(scope?: SystemSettingsScope) {
    if (scope) delete this.cache[scope];
    else this.cache = {};
  }
}

/**
 * Parse the settings JSON to the correct type based on scope
 */
function parseSystemSettings(settings: SystemSettings): AnySystemSettings {
  const parsedSettings = structuredClone(settings.settings || {}) as unknown;

  switch (settings.scope) {
    case "SITE":
      return parsedSettings as SiteSettings;
    case "ADMIN":
      return parsedSettings as AdminSettings;
    case "ENGINE":
      return parsedSettings as EngineSettings;
    default:
      throw new Error("Invalid settings scope");
  }
}

export default new SystemSettingsService();
