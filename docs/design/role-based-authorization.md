# Role 기반 인가(Authorization) 설계 문서

## 1. 개요

### 1.1 목적

- 관리자(Admin)와 일반 유저(User) 역할 분리
- 확장 가능한 권한 관리 시스템 구축
- API 엔드포인트별 접근 제어

### 1.2 현재 구조 분석

```
현재 상태:
- User 엔티티에 역할(Role) 필드 없음
- RequestUser에 역할 정보 없음
- JwtPayload에 역할 정보 없음
- 모든 인증된 사용자가 동일한 권한 보유
```

---

## 2. 설계 옵션

### 2.1 Option A: 단순 Role Enum (권장 - 초기 단계)

```
User 1 ──── Role (ADMIN | USER | MANAGER)
```

**장점**: 구현 단순, 빠른 적용
**단점**: 세분화된 권한 관리 어려움

### 2.2 Option B: Role + Permission 분리

```
User N ──── M Role N ──── M Permission
```

**장점**: 세분화된 권한 관리, 유연한 확장
**단점**: 복잡도 증가, 초기 오버엔지니어링 가능

### 2.3 Option C: RBAC with Hierarchy

```
SUPER_ADMIN
    └── ADMIN
         └── MANAGER
              └── USER
```

**장점**: 역할 상속, 관리 용이
**단점**: 계층 구조 변경 어려움

---

## 3. 권장 설계 (Option A → B 점진적 확장)

### 3.1 Phase 1: 단순 Role Enum

#### 3.1.1 Role Enum 정의

```typescript
// apps/api/src/user/core/role.enum.ts

export enum Role {
  /** 일반 사용자 */
  USER = 'USER',
  /** 관리자 */
  ADMIN = 'ADMIN',
}
```

#### 3.1.2 User 엔티티 수정

```typescript
// apps/api/src/user/core/user.entity.ts

@Entity()
export class User {
  // ... 기존 필드

  @Property({ type: 'text', default: Role.USER })
  role: Role = Role.USER;

  // 역할 확인 메서드
  isAdmin(): boolean {
    return this.role === Role.ADMIN;
  }

  hasRole(role: Role): boolean {
    return this.role === role;
  }
}
```

#### 3.1.3 RequestUser 확장

```typescript
// apps/api/src/user/core/request-user.ts

import { Role } from './role.enum';

export interface RequestUser {
  id: number;
  email: string;
  role: Role; // 추가
}
```

#### 3.1.4 JWT Payload 확장

```typescript
// apps/api/src/auth/components/jwt.strategy.ts

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role; // 추가
}
```

#### 3.1.5 TokenGenerator 수정

```typescript
// apps/api/src/auth/components/token.generator.ts

generate(user: User): AuthToken {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,  // 추가
  };
  // ...
}
```

---

### 3.2 Phase 2: Role Guard 구현

#### 3.2.1 Roles 데코레이터

```typescript
// apps/api/src/auth/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { Role } from '@api/user/core/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

#### 3.2.2 RolesGuard 구현

```typescript
// apps/api/src/auth/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@api/user/core/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RequestUser } from '@api/user/core/request-user';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // @Roles() 데코레이터가 없으면 모든 인증된 사용자 허용
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: RequestUser = request.user;

    return requiredRoles.some((role) => user.role === role);
  }
}
```

#### 3.2.3 사용 예시

```typescript
// 관리자만 접근 가능
@Get('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
async getUsers() { ... }

// 관리자 또는 매니저 접근 가능
@Get('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
async getDashboard() { ... }

// 모든 인증된 사용자 접근 가능 (@Roles 없음)
@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile() { ... }
```

---

### 3.3 Phase 3: Permission 기반 확장 (필요시)

#### 3.3.1 Permission Enum

```typescript
// apps/api/src/auth/core/permission.enum.ts

export enum Permission {
  // 사용자 관리
  USER_READ = 'user:read',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  // 재고 관리
  INVENTORY_READ = 'inventory:read',
  INVENTORY_ADJUST = 'inventory:adjust',

  // 주문 관리
  ORDER_READ = 'order:read',
  ORDER_CREATE = 'order:create',
  ORDER_CANCEL = 'order:cancel',
}
```

#### 3.3.2 Role-Permission 매핑

```typescript
// apps/api/src/auth/core/role-permissions.ts

import { Role } from '@api/user/core/role.enum';
import { Permission } from './permission.enum';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.USER]: [
    Permission.USER_READ,
    Permission.ORDER_READ,
    Permission.ORDER_CREATE,
  ],
  [Role.ADMIN]: [
    // 모든 권한
    ...Object.values(Permission),
  ],
};
```

#### 3.3.3 Permission Guard

```typescript
// apps/api/src/auth/guards/permissions.guard.ts

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: RequestUser = request.user;
    const userPermissions = ROLE_PERMISSIONS[user.role];

    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}
```

#### 3.3.4 사용 예시

```typescript
@Post('inventory/adjust')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(Permission.INVENTORY_ADJUST)
async adjustInventory() { ... }
```

---

## 4. 데이터베이스 마이그레이션

### 4.1 Phase 1 마이그레이션

```sql
-- User 테이블에 role 컬럼 추가
ALTER TABLE "user"
ADD COLUMN "role" VARCHAR(50) NOT NULL DEFAULT 'USER';

-- 기존 특정 사용자를 관리자로 설정 (필요시)
UPDATE "user" SET "role" = 'ADMIN' WHERE email = 'admin@example.com';
```

### 4.2 Phase 3 마이그레이션 (Permission 분리 시)

```sql
-- Role 테이블
CREATE TABLE "role" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(50) UNIQUE NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- Permission 테이블
CREATE TABLE "permission" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) UNIQUE NOT NULL,
  "description" TEXT
);

-- Role-Permission 매핑 테이블
CREATE TABLE "role_permission" (
  "role_id" INTEGER REFERENCES "role"("id"),
  "permission_id" INTEGER REFERENCES "permission"("id"),
  PRIMARY KEY ("role_id", "permission_id")
);

-- User-Role 매핑 (다중 역할 지원 시)
CREATE TABLE "user_role" (
  "user_id" INTEGER REFERENCES "user"("id"),
  "role_id" INTEGER REFERENCES "role"("id"),
  PRIMARY KEY ("user_id", "role_id")
);
```

---

## 5. 파일 구조

```
apps/api/src/
├── auth/
│   ├── core/
│   │   ├── permission.enum.ts        # Phase 3
│   │   └── role-permissions.ts       # Phase 3
│   ├── decorators/
│   │   ├── roles.decorator.ts        # Phase 2
│   │   └── permissions.decorator.ts  # Phase 3
│   ├── guards/
│   │   ├── jwt-auth.guard.ts         # 기존
│   │   ├── roles.guard.ts            # Phase 2
│   │   └── permissions.guard.ts      # Phase 3
│   └── ...
├── user/
│   ├── core/
│   │   ├── role.enum.ts              # Phase 1
│   │   ├── request-user.ts           # 수정
│   │   └── user.entity.ts            # 수정
│   └── ...
```

---

## 6. 구현 우선순위

| Phase | 작업                        | 우선순위 | 예상 시간 |
| ----- | --------------------------- | -------- | --------- |
| 1-1   | Role Enum 생성              | 높음     | 10분      |
| 1-2   | User 엔티티 수정            | 높음     | 15분      |
| 1-3   | RequestUser/JwtPayload 수정 | 높음     | 10분      |
| 1-4   | TokenGenerator 수정         | 높음     | 10분      |
| 1-5   | DB 마이그레이션             | 높음     | 10분      |
| 2-1   | Roles 데코레이터            | 중간     | 10분      |
| 2-2   | RolesGuard                  | 중간     | 20분      |
| 3-\*  | Permission 시스템           | 낮음     | 필요시    |

---

## 7. 보안 고려사항

### 7.1 JWT에 Role 포함 시 주의점

```
⚠️ Role이 변경되어도 기존 JWT는 이전 Role을 유지
```

**해결 방안:**

1. Role 변경 시 해당 사용자의 모든 토큰 무효화
2. 또는 매 요청마다 DB에서 Role 확인 (성능 저하)
3. 또는 JWT 만료 시간을 짧게 설정

### 7.2 권장 구현

```typescript
// Role 변경 시 토큰 무효화
async changeUserRole(userId: number, newRole: Role): Promise<void> {
  await this.userRepo.nativeUpdate({ id: userId }, { role: newRole });
  await this.authTokenStorage.deleteAll(userId);  // 토큰 무효화
}
```

---

## 8. 테스트 시나리오

### 8.1 단위 테스트

```typescript
describe('RolesGuard', () => {
  it('ADMIN 역할이 있으면 ADMIN 전용 엔드포인트 접근 허용', () => { ... });
  it('USER 역할이면 ADMIN 전용 엔드포인트 접근 거부', () => { ... });
  it('@Roles 데코레이터가 없으면 모든 인증된 사용자 허용', () => { ... });
});
```

### 8.2 E2E 테스트

```typescript
describe('Admin API', () => {
  it('관리자 계정으로 사용자 목록 조회 성공', () => { ... });
  it('일반 사용자로 사용자 목록 조회 시 403 Forbidden', () => { ... });
});
```

---

## 9. 결론

**Phase 1 (단순 Role Enum)부터 시작**하여 비즈니스 요구사항에 따라 점진적으로 확장하는 것을 권장합니다.

- 초기: `Role.USER`, `Role.ADMIN` 두 가지로 시작
- 확장: 필요시 `Role.MANAGER`, `Role.OPERATOR` 등 추가
- 고도화: Permission 기반 세분화 (복잡한 권한 요구 시)
