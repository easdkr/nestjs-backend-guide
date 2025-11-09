import { User } from './user.entity';
import { Gender } from './gender.enum';

describe('User', () => {
  describe('of', () => {
    it('정상적인 사용자 생성', () => {
      // Arrange
      const args = {
        email: 'test@example.com',
        password: 'Test1234!',
        nickname: 'testuser',
        birthDate: new Date('1990-01-01'),
        gender: Gender.MALE,
        termsAgreedAt: new Date(),
        marketingAgreedAt: null,
      };

      // Act
      const user = User.of(args);

      // Assert
      expect(user.email).toBe(args.email);
      expect(user.nickname).toBe(args.nickname);
      expect(user.birthDate).toEqual(args.birthDate);
      expect(user.gender).toBe(args.gender);
      expect(user.termsAgreedAt).toEqual(args.termsAgreedAt);
      expect(user.marketingAgreedAt).toBeNull();
      expect(user.password).not.toBe(args.password);
      expect(user.password).toBeTruthy();
    });
  });

  describe('hashPassword', () => {
    it('비밀번호를 해싱하여 저장', () => {
      // Arrange
      const user = new User();
      const plainPassword = 'Test1234!';

      // Act
      user.hashPassword(plainPassword);

      // Assert
      expect(user.password).not.toBe(plainPassword);
      expect(user.password).toBeTruthy();
      expect(user.password.length).toBeGreaterThan(0);
    });
  });

  describe('verifyPassword', () => {
    it('올바른 비밀번호 검증 성공', () => {
      // Arrange
      const user = new User();
      const plainPassword = 'Test1234!';
      user.hashPassword(plainPassword);

      // Act
      const result = user.verifyPassword(plainPassword);

      // Assert
      expect(result).toBe(true);
    });

    it('잘못된 비밀번호 검증 실패', () => {
      // Arrange
      const user = new User();
      const plainPassword = 'Test1234!';
      user.hashPassword(plainPassword);

      // Act
      const result = user.verifyPassword('WrongPassword');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('비밀번호 변경', () => {
      // Arrange
      const user = new User();
      const oldPassword = 'OldPassword123!';
      const newPassword = 'NewPassword123!';
      user.hashPassword(oldPassword);
      const oldHashedPassword = user.password;

      // Act
      user.changePassword(newPassword);

      // Assert
      expect(user.password).not.toBe(oldHashedPassword);
      expect(user.verifyPassword(newPassword)).toBe(true);
      expect(user.verifyPassword(oldPassword)).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('프로필 일부 필드 업데이트', () => {
      // Arrange
      const user = new User();
      user.nickname = 'oldNickname';
      user.gender = Gender.MALE;
      user.birthDate = new Date('1990-01-01');

      // Act
      user.updateProfile({
        nickname: 'newNickname',
        gender: Gender.FEMALE,
      });

      // Assert
      expect(user.nickname).toBe('newNickname');
      expect(user.gender).toBe(Gender.FEMALE);
      expect(user.birthDate).toEqual(new Date('1990-01-01'));
    });

    it('약관 동의 정보 업데이트', () => {
      // Arrange
      const user = new User();
      const termsDate = new Date();
      const marketingDate = new Date();

      // Act
      user.updateProfile({
        termsAgreedAt: termsDate,
        marketingAgreedAt: marketingDate,
      });

      // Assert
      expect(user.termsAgreedAt).toEqual(termsDate);
      expect(user.marketingAgreedAt).toEqual(marketingDate);
    });
  });

  describe('delete', () => {
    it('소프트 삭제 처리', () => {
      // Arrange
      const user = new User();
      user.deletedAt = null;

      // Act
      user.delete();

      // Assert
      expect(user.deletedAt).not.toBeNull();
      expect(user.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('isActive', () => {
    it('삭제되지 않은 사용자는 활성 상태', () => {
      // Arrange
      const user = new User();
      user.deletedAt = null;

      // Act
      const result = user.isActive();

      // Assert
      expect(result).toBe(true);
    });

    it('삭제된 사용자는 비활성 상태', () => {
      // Arrange
      const user = new User();
      user.deletedAt = new Date();

      // Act
      const result = user.isActive();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getters', () => {
    it('termsAgreed - 약관 동의 시 true 반환', () => {
      // Arrange
      const user = new User();
      user.termsAgreedAt = new Date();

      // Act & Assert
      expect(user.termsAgreed).toBe(true);
    });

    it('termsAgreed - 약관 미동의 시 false 반환', () => {
      // Arrange
      const user = new User();
      user.termsAgreedAt = null;

      // Act & Assert
      expect(user.termsAgreed).toBe(false);
    });

    it('marketingAgreed - 마케팅 동의 시 true 반환', () => {
      // Arrange
      const user = new User();
      user.marketingAgreedAt = new Date();

      // Act & Assert
      expect(user.marketingAgreed).toBe(true);
    });

    it('marketingAgreed - 마케팅 미동의 시 false 반환', () => {
      // Arrange
      const user = new User();
      user.marketingAgreedAt = null;

      // Act & Assert
      expect(user.marketingAgreed).toBe(false);
    });
  });
});
