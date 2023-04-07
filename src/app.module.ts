import {
  Module,
  CacheModule,
  CacheInterceptor,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from './prisma/prisma.module';
import { MessageModule } from './message/message.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger/logger.module';
import { queueDatabaseConfigObject } from './config/queueDatabase.config';
import { cacheDatabaseConfigObject } from './config/cacheDatabase.config';
import { envConfigObject } from './config/env.Config';
import { JwtKeyConfigObject } from './config/key.config';
import { LoggerMiddleware } from './logger/logger.middleware';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigService } from '@nestjs/config';
import { EventModule } from './event/event.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TagModule } from './tag/tag.module';
import { SearchModule } from './search/search.module';
import { NotificationModule } from './notification/notification.module';
import { FileHandlerModule } from './fileHandler/fileHandler.module';
const configOptionForRoot = {
  load: [
    envConfigObject,
    // queueDatabaseConfigObject,
    cacheDatabaseConfigObject,
    JwtKeyConfigObject,
  ],
  cache: true,
  isGlobal: true,
};
@Module({
  imports: [
    ConfigModule.forRoot({
      ...configOptionForRoot,
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        config: {
          host: configService.get<string>('cacheDatabase.host'),
          port: configService.get<number>('cacheDatabase.port'),
          password: configService.get<string>('cacheDatabase.password'),
        },
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      installSubscriptionHandlers: true,
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
      debug: process.env.NODE_ENV === 'development',
      playground: true,
      autoSchemaFile: join(process.cwd(), './schema.gql'),
      cors: true,
      persistedQueries: false,
      cache: 'bounded',
    }),

    LoggerModule,
    PrismaModule,
    MessageModule,
    AuthModule,
    UserModule,
    EventModule,
    TagModule,
    SearchModule,
    NotificationModule,
    FileHandlerModule,
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'backend-docs'),
    //   serveRoot: '/docs',
    // }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'api-docs'),
    //   serveRoot: '/sf341-docs',
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
