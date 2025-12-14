import { Store } from '@api/store/core/store.entity';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class StoreFinder {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: EntityRepository<Store>,
  ) {}

  async findById(id: number): Promise<Store | null> {
    return await this.storeRepository.findOne({ id });
  }

  async getById(id: number): Promise<Store> {
    const store = await this.findById(id);
    if (!store) {
      throw new NotFoundException(`스토어를 찾을 수 없습니다: ${id}`);
    }
    return store;
  }
}
