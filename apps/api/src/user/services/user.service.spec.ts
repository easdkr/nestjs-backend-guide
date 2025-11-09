import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserFinder } from '@api/user/components/user.finder';
import { User } from '@api/user/core/user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userFinder: jest.Mocked<UserFinder>;

  beforeAll(async () => {
    const mockUserFinder = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserFinder,
          useValue: mockUserFinder,
        },
      ],
    }).compile();

    service = module.get(UserService);
    userFinder = module.get(UserFinder);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('정상적인 사용자 조회', async () => {
      // Arrange
      const userId = 1;
      const user = new User();
      user.id = userId;
      user.email = 'test@example.com';
      user.nickname = 'testuser';
      user.deletedAt = null;

      userFinder.findById.mockResolvedValue(user);

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(result).toBe(user);
      expect(userFinder.findById).toHaveBeenCalledWith(userId);
      expect(userFinder.findById).toHaveBeenCalledTimes(1);
    });

    it('사용자를 찾을 수 없는 경우 NotFoundException 발생', async () => {
      // Arrange
      const userId = 999;
      userFinder.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(userId)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      );
      expect(userFinder.findById).toHaveBeenCalledWith(userId);
      expect(userFinder.findById).toHaveBeenCalledTimes(2);
    });

    it('비활성화된 사용자 조회 시 NotFoundException 발생', async () => {
      // Arrange
      const userId = 1;
      const user = new User();
      user.id = userId;
      user.email = 'test@example.com';
      user.nickname = 'testuser';
      user.deletedAt = new Date();

      userFinder.findById.mockResolvedValue(user);

      // Act & Assert
      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(userId)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      );
      expect(userFinder.findById).toHaveBeenCalledWith(userId);
      expect(userFinder.findById).toHaveBeenCalledTimes(2);
    });
  });
});
