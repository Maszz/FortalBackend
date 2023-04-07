import { Injectable, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  initializeApp,
  FirebaseApp,
  FirebaseAppSettings,
  FirebaseOptions,
} from 'firebase/app';
import { App, AppOptions } from 'firebase-admin/app';
import fs from 'fs';
import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadBytes,
  StorageReference,
  UploadResult,
  getDownloadURL,
} from 'firebase/storage';
import sharp, { Sharp } from 'sharp';
@Injectable()
export class FileHandlerService {
  private firebase: FirebaseApp;
  private storage: FirebaseStorage;
  constructor(private prisma: PrismaService) {}

  getStorageRef(path: string) {
    return ref(this.storage, path);
  }

  async uploadFile(ref: StorageReference, file: any): Promise<UploadResult> {
    const metadata = {
      contentType: 'image/jpeg',
    };
    const snapshot = await uploadBytes(ref, file, metadata);

    return snapshot;
  }

  async uploadImage(file: any, userId: string) {
    console.log('test2');
    console.log(file);
    const res = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        profile: {
          update: {
            avatar: '/upload/' + file.filename,
          },
        },
      },
    });
    console.log('res' + res);
  }
}
