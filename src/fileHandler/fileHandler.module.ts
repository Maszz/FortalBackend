import { Module, Logger, Global } from '@nestjs/common';
import { FileHandlerService } from './fileHandler.service';
import { NotificationModule } from '../notification/notification.module';
import { MulterModule } from '@nestjs/platform-express';
import { FileHandlerController } from './fileHandle.controller';

@Module({
  imports: [
    MulterModule.register({
      dest: './upload',
      limits: {
        fileSize: 1024 * 1024 * 15,
      },
    }),
  ],
  controllers: [FileHandlerController],
  providers: [FileHandlerService],
})
export class FileHandlerModule {}
