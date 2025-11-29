/**
 * 재고 트랜잭션 사유
 * 재고 변동이 발생한 구체적인 이유를 나타냅니다.
 */
export enum InventoryTransactionReason {
  // ========== 입고 사유 ==========
  /** WMS 재고 인입 (정상 입고) */
  WMS_INBOUND = 'WMS_INBOUND',
  /** 반품으로 인한 재고 증가 */
  RETURN_RECEIVED = 'RETURN_RECEIVED',
  /** 교환 반품 입고 */
  EXCHANGE_RETURN = 'EXCHANGE_RETURN',
  /** 오배송 회수 */
  WRONG_SHIPMENT_RETURN = 'WRONG_SHIPMENT_RETURN',

  // ========== 출고 사유 ==========
  /** 주문 출고 */
  ORDER_SHIPMENT = 'ORDER_SHIPMENT',
  /** 교환 출고 */
  EXCHANGE_SHIPMENT = 'EXCHANGE_SHIPMENT',
  /** 오발송으로 인한 추가 발송 */
  WRONG_SHIPMENT_RESHIPPING = 'WRONG_SHIPMENT_RESHIPPING',

  // ========== 조정 사유 ==========
  /** 제품 파손으로 인한 차감 */
  DAMAGE = 'DAMAGE',
  /** 분실 */
  LOST = 'LOST',
  /** 유통기한 만료 */
  EXPIRED = 'EXPIRED',
  /** 재고 실사 조정 (증가) */
  INVENTORY_COUNT_PLUS = 'INVENTORY_COUNT_PLUS',
  /** 재고 실사 조정 (감소) */
  INVENTORY_COUNT_MINUS = 'INVENTORY_COUNT_MINUS',
  /** 수동 조정 (관리자) */
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
}

/**
 * 사유별 기본 트랜잭션 타입 매핑
 * 각 사유가 기본적으로 어떤 타입의 트랜잭션인지 정의
 */
export const REASON_TO_DEFAULT_TYPE: Record<
  InventoryTransactionReason,
  'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT'
> = {
  // 입고
  [InventoryTransactionReason.WMS_INBOUND]: 'INBOUND',
  [InventoryTransactionReason.RETURN_RECEIVED]: 'INBOUND',
  [InventoryTransactionReason.EXCHANGE_RETURN]: 'INBOUND',
  [InventoryTransactionReason.WRONG_SHIPMENT_RETURN]: 'INBOUND',

  // 출고
  [InventoryTransactionReason.ORDER_SHIPMENT]: 'OUTBOUND',
  [InventoryTransactionReason.EXCHANGE_SHIPMENT]: 'OUTBOUND',
  [InventoryTransactionReason.WRONG_SHIPMENT_RESHIPPING]: 'OUTBOUND',

  // 조정
  [InventoryTransactionReason.DAMAGE]: 'ADJUSTMENT',
  [InventoryTransactionReason.LOST]: 'ADJUSTMENT',
  [InventoryTransactionReason.EXPIRED]: 'ADJUSTMENT',
  [InventoryTransactionReason.INVENTORY_COUNT_PLUS]: 'ADJUSTMENT',
  [InventoryTransactionReason.INVENTORY_COUNT_MINUS]: 'ADJUSTMENT',
  [InventoryTransactionReason.MANUAL_ADJUSTMENT]: 'ADJUSTMENT',
};
