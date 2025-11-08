export interface ValkeyModuleOptions {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  url?: string;
  connectTimeout?: number;
  commandTimeout?: number;
  retryStrategy?: (times: number) => number | void;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  enableOfflineQueue?: boolean;
  lazyConnect?: boolean;
}

export interface ValkeyModuleAsyncOptions {
  useFactory?: (...args: any[]) => Promise<ValkeyModuleOptions> | ValkeyModuleOptions;
  inject?: any[];
  imports?: any[];
}


