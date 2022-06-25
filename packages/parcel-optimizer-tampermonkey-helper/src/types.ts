import type { Config, PluginOptions, PluginLogger } from "@parcel/types/lib";
export type { HMROptions, PluginOptions } from "@parcel/types/lib";

export interface arg {
  config: Config;
  options: PluginOptions;
  logger: PluginLogger;
}
