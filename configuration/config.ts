// TODO (William): Allow config to be set outside of this file.

export interface ConfigurationOptions {
  maxConnections: number;
  debug: boolean;
}

let config: ConfigurationOptions = {
  maxConnections: 1,
  debug: false,
};

export class Configuration {
  static getConfig() {
    return { ...config };
  }

  static async setConfigWithPath(configPath: string) {
    const file = Bun.file(configPath);
    const json: unknown = await file.json();
    this.setConfig(json as ConfigurationOptions);
  }

  // TODO (William): setConfig using environment vars
  static async setConfigWithEnv() {
    throw new Error("Not implemented yet");
  }

  static setConfig(newConfig: ConfigurationOptions): void {
    config = { ...config, ...newConfig };
  }

  static isDebug(): boolean {
    return config.debug;
  }

  static maxConnections(): number {
    return config.maxConnections;
  }
}
