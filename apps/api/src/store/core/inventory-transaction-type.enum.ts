/**
 * 재고 트랜잭션 유형
 * - INBOUND: 재고 증가 (입고)
 * - OUTBOUND: 재고 감소 (출고)
 * - ADJUSTMENT: 재고 조정 (실사, 수동 조정 등)
 */
export enum InventoryTransactionType {
  /** 입고 - 재고 증가 */
  INBOUND = 'INBOUND',
  /** 출고 - 재고 감소 */
  OUTBOUND = 'OUTBOUND',
  /** 조정 - 재고 실사 또는 수동 조정 */
  ADJUSTMENT = 'ADJUSTMENT',
}
