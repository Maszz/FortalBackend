import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse, AxiosError } from 'axios';
import { Observable, firstValueFrom, catchError } from 'rxjs';
import { LocationResponse } from './search.type';
export interface SearchEventContent {
  content: string;
  type: string;
  id: string;
  date: Date;
  location: string;
}
export interface SearchUserContent {
  content: string;
  type: string;
  id: string;
  name: string;
  bio: string;
}
export type SearchContent = {
  content: string;
  type: string;
  id: string;
  date?: string;
  location?: string;
  name?: string;
  bio?: string;
  eventData?: {
    memberLimit: number;
    memberType: 'LIMIT' | 'UNLIMITED';
    participantsId: string[];
  };
  avatar?: string;
};
export type test =
  | {
      content: string;
      type: string;
      id: string;
      date: Date;
      location: string;
    }
  | {
      content: string;
      type: string;
      id: string;
      name: string;
      bio: string;
    }[];

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async search(args: {
    keyword: string;
    username: string;
  }): Promise<SearchContent[]> {
    const { keyword, username } = args;
    const events = await this.prisma.event.findMany({
      where: {
        OR: [
          {
            name: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          {
            creator: {
              username: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
          },
        ],
      },
      select: {
        name: true,
        startDate: true,
        locationName: true,
        id: true,
        memberLimit: true,
        memberType: true,
        participantsId: true,
      },
    });
    const eventsArr = events.map((event) => {
      return {
        content: event.name,
        type: 'event',
        id: event.id,
        date: event.startDate,
        location: event.locationName,
        eventData: {
          memberLimit: event.memberLimit,
          memberType: event.memberType,
          participantsId: event.participantsId,
        },
      };
    });
    const user = await this.prisma.user.findMany({
      where: {
        AND: [
          {
            username: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          {
            username: {
              not: username,
            },
          },
        ],
      },
      select: {
        username: true,
        id: true,
        profile: {
          select: {
            displayName: true,
            bio: true,
            avatar: true,
          },
        },
      },
    });
    const userArr = user.map((user) => {
      return {
        content: user.username,
        type: 'user',
        id: user.id,
        name: user.profile?.displayName || '',
        bio: user.profile?.bio || '',
        avatar: user.profile?.avatar || '',
      };
    });
    const result = [...eventsArr, ...userArr] as SearchContent[];
    return result;
  }

  async searchLocation(keyword: string): Promise<
    {
      geometry: {
        lat: number;
        lng: number;
      };
      place: string;
    }[]
  > {

    const { data } = await firstValueFrom(
      this.httpService
        .get<LocationResponse>(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
            keyword,
          )}&key={api-key}&language=en&pretty=1`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.log(error.message);
            throw 'An error happened!';
          }),
        ),
    );
    const { results } = data;
    const formattedResult = results.map((item) => {
      return {
        geometry: item.geometry,
        place: item.formatted,
        flag: item.annotations.flag,
      };
    });
    return formattedResult;
  }
}
