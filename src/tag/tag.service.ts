import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from 'prisma/prisma-client';

@Injectable()
export class TagService {
  private atPrivateKey: string;
  private rtPrivateKey: string;
  constructor(private readonly prisma: PrismaService) {}

  async getAllTags() {
    const tags = this.prisma.category.findMany({
      skip: 0,
      take: 20,
      select: {
        name: true,
      },
    });
    return (await tags).map((tag) => tag.name);
  }

  async setPrimaryTag() {
    try {
      const tahs = await this.prisma.category.createMany({
        data: [
          { name: 'Sports' },
          { name: 'Game' },
          { name: 'Music' },
          { name: 'Movie' },
          { name: 'Food' },
          { name: 'Travel' },
          { name: 'Fashion' },
          { name: 'Beauty' },
          { name: 'IT' },
          { name: 'Science' },
          { name: 'Politics' },
          { name: 'Economy' },
          { name: 'Culture' },
          { name: 'Life' },
          { name: 'History' },
          { name: 'Religion' },
        ],
      });
      console.log(tahs);
    } catch (e) {
      console.log(e);
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ForbiddenException('already have this tag');
        }
      }
    }
  }

  // async addTag(tag: string) {
  //   try {
  //     const tags= await this.prisma.user.update({
  //       where: { id: 1 },
  //       data: {
  //         categories:{
  //           connectOrCreate:[
  //             {
  //               where:{name:tag},
  //               create:{name:tag},
  //           }
  //           ]
  //       }
  //     }})
  //   const tags = this.prisma.category.create({
  //     data: {
  //       name: tag,
  //     },
  //   });
  //   console.log(tags);
  // } catch (e) {
  //   if (e instanceof Prisma.PrismaClientKnownRequestError) {
  //     if (e.code === 'P2002') {
  //       throw new ForbiddenException('already have this tag');
  //     }
  //   }
  // }
  // }
}
