import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ValkeyClient } from './valkey.client';
import {
  ValkeyModuleOptions,
  ValkeyModuleAsyncOptions,
} from './valkey.interface';
import { VALKEY_MODULE_OPTIONS } from './valkey.constants';

@Module({})
export class ValkeyModule {
  static forRoot(options: ValkeyModuleOptions): DynamicModule {
    const valkeyOptionsProvider: Provider = {
      provide: VALKEY_MODULE_OPTIONS,
      useValue: options,
    };

    return {
      module: ValkeyModule,
      providers: [valkeyOptionsProvider, ValkeyClient],
      exports: [valkeyOptionsProvider, ValkeyClient],
      global: true,
    };
  }

  static forRootAsync(options: ValkeyModuleAsyncOptions): DynamicModule {
    const valkeyOptionsProvider: Provider = {
      provide: VALKEY_MODULE_OPTIONS,
      useFactory: options.useFactory || (() => options),
      inject: options.inject || [],
    };

    return {
      module: ValkeyModule,
      imports: options.imports || [],
      providers: [valkeyOptionsProvider, ValkeyClient],
      exports: [ValkeyClient],
      global: true,
    };
  }
}
