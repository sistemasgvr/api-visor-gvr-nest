import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '../../../config/database.config';
import { DatabaseFunctionService } from '../../../infrastructure/database/database-function.service';
import { PostgresInternalReviewsRepository } from '../../../infrastructure/repositories/internal-reviews.repository';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseFunctionService, PostgresInternalReviewsRepository],
  exports: [DatabaseFunctionService, PostgresInternalReviewsRepository],
})
export class DatabaseModule {}
