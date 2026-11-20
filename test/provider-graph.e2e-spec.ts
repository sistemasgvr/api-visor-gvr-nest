import { Test } from '@nestjs/testing';
import { ModulesContainer } from '@nestjs/core';
import { getDataSourceToken } from '@nestjs/typeorm';
import type * as AppModuleTypes from '../src/app.module';
import type * as ApplicationProvidersTypes from '../src/composition/application.providers';

describe('Ensamblaje completo de módulos', () => {
  it('resuelve controladores y providers sin conexiones externas', async () => {
    jest.useFakeTimers();
    const previousQueue = process.env.MAIL_USE_QUEUE;
    process.env.MAIL_USE_QUEUE = 'false';
    try {
      const { AppModule } =
        jest.requireActual<typeof AppModuleTypes>('../src/app.module');
      const { applicationProvider, applicationProviderTargets } =
        jest.requireActual<typeof ApplicationProvidersTypes>(
          '../src/composition/application.providers',
        );
      const dataSource = {
        isInitialized: true,
        entityMetadatas: [],
        options: { type: 'postgres' },
        query: jest.fn(),
        destroy: jest.fn(),
        getRepository: jest.fn(),
      };
      const module = await Test.createTestingModule({ imports: [AppModule] })
        .overrideProvider(getDataSourceToken())
        .useValue(dataSource)
        .setLogger({ log() {}, warn() {}, error() {} })
        .compile();
      try {
        expect(module.get(AppModule)).toBeDefined();
        const modules = module.get(ModulesContainer);
        const misconfigured: string[] = [];
        let checked = 0;
        for (const registeredModule of modules.values()) {
          for (const target of applicationProviderTargets) {
            const provider = registeredModule.providers.get(target);
            if (!provider) continue;
            checked++;
            const expected = applicationProvider(target).inject ?? [];
            const actual = provider.inject ?? [];
            if (
              actual.length !== expected.length ||
              actual.some((token, index) => token !== expected[index]) ||
              !provider.instance
            ) {
              misconfigured.push(
                `${registeredModule.metatype.name}: ${target.name}`,
              );
            }
          }
        }
        expect(checked).toBeGreaterThan(0);
        expect(misconfigured).toEqual([]);
        expect(dataSource.query).not.toHaveBeenCalled();
      } finally {
        await module.close();
      }
    } finally {
      if (previousQueue === undefined) delete process.env.MAIL_USE_QUEUE;
      else process.env.MAIL_USE_QUEUE = previousQueue;
      jest.clearAllTimers();
      jest.useRealTimers();
    }
  }, 60000);
});
