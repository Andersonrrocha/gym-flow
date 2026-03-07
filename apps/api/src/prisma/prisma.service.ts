import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const targetEnv = process.env.APP_ENV || 'dev';
    const databaseUrl =
      process.env.DATABASE_URL ??
      (targetEnv === 'prod'
        ? process.env.DATABASE_URL_PROD
        : process.env.DATABASE_URL_DEV);

    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL is required (or DATABASE_URL_DEV / DATABASE_URL_PROD based on APP_ENV)',
      );
    }

    const adapter = new PrismaPg({ connectionString: databaseUrl });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
