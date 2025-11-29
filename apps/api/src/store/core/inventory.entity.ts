/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  Unique,
} from '@mikro-orm/core';
import type { Rel } from '@mikro-orm/core';
import { Option } from './option.entity';
import { InventoryTransaction } from './inventory-transaction.entity';
import { Product } from '@api/store/core/product.entity';

/**
 * 재고 엔티티
 * 상품(또는 옵션) 단위의 현재 재고 상태를 관리합니다.
 *
 * - quantity: 실제 물리적 재고 수량
 * - reservedQuantity: 예약된 수량 (주문 확정 대기 중)
 * - availableQuantity: 가용 재고 (quantity - reservedQuantity)
 */
@Entity()
@Unique({ properties: ['product', 'option'] })
export class Inventory {
  @PrimaryKey()
  id: number;

  @ManyToOne(() => Product)
  product: Rel<Product>;

  /**
   * 옵션별 재고 관리가 필요한 경우 사용
   * null이면 상품 단위 재고
   */
  @ManyToOne(() => Option, { nullable: true })
  option?: Option;

  /**
   * 실제 물리적 재고 수량
   */
  @Property({ type: 'integer', default: 0 })
  quantity: number = 0;

  /**
   * 예약된 수량 (주문 확정 대기 중인 수량)
   * 결제 완료 후 출고 전까지 예약 상태로 관리
   */
  @Property({ type: 'integer', default: 0 })
  reservedQuantity: number = 0;

  /**
   * 재고 트랜잭션 이력
   */
  @OneToMany(
    () => InventoryTransaction,
    (tx: InventoryTransaction) => tx.inventory,
  )
  transactions = new Collection<Rel<InventoryTransaction>>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  /**
   * 가용 재고 (판매 가능 수량)
   */
  get availableQuantity(): number {
    return this.quantity - this.reservedQuantity;
  }

  // ==================== 검증 메서드 (읽기 전용) ====================
  // 실제 수량 변경은 InventoryRepository의 원자적 메서드를 사용하세요.

  /**
   * 재고 증가 가능 여부 확인
   */
  canIncrease(amount: number): boolean {
    return amount > 0;
  }

  /**
   * 재고 감소 가능 여부 확인
   */
  canDecrease(amount: number): boolean {
    return amount > 0 && this.quantity >= amount;
  }

  /**
   * 예약 가능 여부 확인
   */
  canReserve(amount: number): boolean {
    return amount > 0 && this.availableQuantity >= amount;
  }

  /**
   * 예약 해제 가능 여부 확인
   */
  canReleaseReservation(amount: number): boolean {
    return amount > 0 && this.reservedQuantity >= amount;
  }

  /**
   * 예약 확정 가능 여부 확인
   */
  canConfirmReservation(amount: number): boolean {
    return amount > 0 && this.reservedQuantity >= amount;
  }

  /**
   * 재고가 충분한지 확인
   */
  hasAvailableStock(amount: number): boolean {
    return this.availableQuantity >= amount;
  }
}
