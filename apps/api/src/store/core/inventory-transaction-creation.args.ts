import type { Inventory } from './inventory.entity';
import type { InventoryTransactionReason } from './inventory-transaction-reason.enum';
import type { InventoryReferenceType } from './inventory-transaction.entity';

/**
 * 재고 트랜잭션 생성 기본 Args
 */
interface BaseTransactionArgs {
  /** 재고 엔티티 */
  inventory: Inventory;
  /** 트랜잭션 사유 */
  reason: InventoryTransactionReason;
  /** 변동 전 수량 (Repository에서 반환받은 값) */
  previousQuantity: number;
  /** 변동 후 수량 (Repository에서 반환받은 값) */
  currentQuantity: number;
  /** 참조 타입 (주문, WMS 입고, 반품 등) */
  referenceType?: InventoryReferenceType;
  /** 참조 ID (연관된 엔티티의 ID) */
  referenceId?: string;
  /** 비고 (추가 설명) */
  note?: string;
  /** 처리자 ID (관리자 또는 시스템) */
  processedBy?: string;
}

/**
 * 입고 트랜잭션 생성 Args
 */
export interface CreateInboundTransactionArgs extends BaseTransactionArgs {
  /** 변동량 (양수) */
  quantityChange: number;
}

/**
 * 출고 트랜잭션 생성 Args
 */
export interface CreateOutboundTransactionArgs extends BaseTransactionArgs {
  /** 변동량 (양수로 전달, 내부에서 음수로 변환) */
  quantityChange: number;
}

/**
 * 조정 트랜잭션 생성 Args
 */
export interface CreateAdjustmentTransactionArgs extends BaseTransactionArgs {
  /** 조정량 (양수: 증가, 음수: 감소) */
  adjustmentQuantity: number;
}
