import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Enum,
  Index,
} from '@mikro-orm/core';
import { Inventory } from './inventory.entity';
import { InventoryTransactionType } from './inventory-transaction-type.enum';
import { InventoryTransactionReason } from './inventory-transaction-reason.enum';
import type {
  CreateInboundTransactionArgs,
  CreateOutboundTransactionArgs,
  CreateAdjustmentTransactionArgs,
} from './inventory-transaction-creation.args';

/**
 * 재고 참조 타입
 * 트랜잭션과 연관된 외부 엔티티 타입
 */
export enum InventoryReferenceType {
  /** 주문 */
  ORDER = 'ORDER',
  /** WMS 입고 */
  WMS_RECEIPT = 'WMS_RECEIPT',
  /** 반품 */
  RETURN = 'RETURN',
  /** 교환 */
  EXCHANGE = 'EXCHANGE',
  /** 재고 실사 */
  INVENTORY_COUNT = 'INVENTORY_COUNT',
  /** 관리자 조정 */
  ADMIN = 'ADMIN',
}

/**
 * 재고 트랜잭션 엔티티
 * 모든 재고 변동 이력을 기록합니다.
 *
 * 설계 원칙:
 * 1. 모든 재고 변동은 반드시 트랜잭션으로 기록
 * 2. 변동 전/후 수량을 저장하여 추적 가능
 * 3. 참조 정보를 통해 원인이 되는 엔티티 추적 가능
 */
@Entity()
@Index({ properties: ['inventory', 'createdAt'] })
@Index({ properties: ['referenceType', 'referenceId'] })
export class InventoryTransaction {
  @PrimaryKey()
  id: number;

  @ManyToOne(() => Inventory)
  inventory: Inventory;

  /**
   * 트랜잭션 유형 (입고/출고/조정)
   */
  @Enum(() => InventoryTransactionType)
  type: InventoryTransactionType;

  /**
   * 트랜잭션 사유 (상세 이유)
   */
  @Enum(() => InventoryTransactionReason)
  reason: InventoryTransactionReason;

  /**
   * 변동 수량
   * - 양수: 재고 증가
   * - 음수: 재고 감소
   */
  @Property({ type: 'integer' })
  quantity: number;

  /**
   * 변동 전 재고 수량
   */
  @Property({ type: 'integer' })
  previousQuantity: number;

  /**
   * 변동 후 재고 수량
   */
  @Property({ type: 'integer' })
  currentQuantity: number;

  /**
   * 참조 타입 (주문, WMS 입고, 반품 등)
   */
  @Enum({ items: () => InventoryReferenceType, nullable: true })
  referenceType?: InventoryReferenceType;

  /**
   * 참조 ID (연관된 엔티티의 ID)
   */
  @Property({ type: 'varchar', length: 100, nullable: true })
  @Index()
  referenceId?: string;

  /**
   * 비고 (추가 설명)
   */
  @Property({ type: 'text', nullable: true })
  note?: string;

  /**
   * 처리자 ID (관리자 또는 시스템)
   */
  @Property({ type: 'varchar', length: 100, nullable: true })
  processedBy?: string;

  @Property()
  createdAt: Date = new Date();

  /**
   * 팩토리 메서드: 입고 트랜잭션 생성
   */
  static createInbound(
    args: CreateInboundTransactionArgs,
  ): InventoryTransaction {
    const tx = new InventoryTransaction();
    tx.inventory = args.inventory;
    tx.type = InventoryTransactionType.INBOUND;
    tx.reason = args.reason;
    tx.quantity = Math.abs(args.quantityChange);
    tx.previousQuantity = args.previousQuantity;
    tx.currentQuantity = args.currentQuantity;
    tx.referenceType = args.referenceType;
    tx.referenceId = args.referenceId;
    tx.note = args.note;
    tx.processedBy = args.processedBy;
    return tx;
  }

  /**
   * 팩토리 메서드: 출고 트랜잭션 생성
   */
  static createOutbound(
    args: CreateOutboundTransactionArgs,
  ): InventoryTransaction {
    const tx = new InventoryTransaction();
    tx.inventory = args.inventory;
    tx.type = InventoryTransactionType.OUTBOUND;
    tx.reason = args.reason;
    tx.quantity = -Math.abs(args.quantityChange);
    tx.previousQuantity = args.previousQuantity;
    tx.currentQuantity = args.currentQuantity;
    tx.referenceType = args.referenceType;
    tx.referenceId = args.referenceId;
    tx.note = args.note;
    tx.processedBy = args.processedBy;
    return tx;
  }

  /**
   * 팩토리 메서드: 조정 트랜잭션 생성
   */
  static createAdjustment(
    args: CreateAdjustmentTransactionArgs,
  ): InventoryTransaction {
    const tx = new InventoryTransaction();
    tx.inventory = args.inventory;
    tx.type = InventoryTransactionType.ADJUSTMENT;
    tx.reason = args.reason;
    tx.quantity = args.adjustmentQuantity;
    tx.previousQuantity = args.previousQuantity;
    tx.currentQuantity = args.currentQuantity;
    tx.referenceType = args.referenceType;
    tx.referenceId = args.referenceId;
    tx.note = args.note;
    tx.processedBy = args.processedBy;
    return tx;
  }

  /**
   * 재고 증가 여부
   */
  get isIncrease(): boolean {
    return this.quantity > 0;
  }

  /**
   * 재고 감소 여부
   */
  get isDecrease(): boolean {
    return this.quantity < 0;
  }
}
