import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import type * as AppModuleTypes from '../src/app.module';

describe('Ensamblaje completo de módulos', () => {
  it('resuelve controladores y providers sin conexiones externas', async () => {
    jest.useFakeTimers();
    const previousQueue = process.env.MAIL_USE_QUEUE;
    process.env.MAIL_USE_QUEUE = 'false';
    try {
      const { AppModule } =
        jest.requireActual<typeof AppModuleTypes>('../src/app.module');
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
      expect(module.get(AppModule)).toBeDefined();
      expect(dataSource.query).not.toHaveBeenCalled();
      await module.close();
    } finally {
      if (previousQueue === undefined) delete process.env.MAIL_USE_QUEUE;
      else process.env.MAIL_USE_QUEUE = previousQueue;
      jest.clearAllTimers();
      jest.useRealTimers();
    }
  }, 60000);
});
