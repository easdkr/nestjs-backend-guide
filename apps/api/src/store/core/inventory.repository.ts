import { EntityRepository } from '@mikro-orm/postgresql';
import { Inventory } from './inventory.entity';

/**
 * 재고 수량 변경 결과
 */
export interface QuantityUpdateResult {
  success: boolean;
  previousQuantity: number;
  currentQuantity: number;
}

/**
 * Inventory 커스텀 리포지토리
 *
 * 모든 재고 수량 변경은 원자적 UPDATE 쿼리로 수행합니다.
 * 이를 통해 동시성 문제를 방지합니다.
 */
export class InventoryRepository extends EntityRepository<Inventory> {
  /**
   * 재고 증가 (원자적)
   *
   * UPDATE inventory
   * SET quantity = quantity + :amount
   * WHERE id = :id
   * RETURNING quantity
   */
  async increaseQuantity(
    inventoryId: number,
    amount: number,
  ): Promise<QuantityUpdateResult> {
    if (amount <= 0) {
      throw new Error('증가량은 양수여야 합니다.');
    }

    const knex = this.getEntityManager().getKnex();

    // 현재 수량 먼저 조회
    const current = await knex('inventory')
      .where('id', inventoryId)
      .select('quantity')
      .first<{ quantity: number }>();

    if (!current) {
      throw new Error('재고를 찾을 수 없습니다.');
    }

    const previousQuantity = current.quantity;

    // 원자적 증가
    await knex('inventory')
      .where('id', inventoryId)
      .update({
        quantity: knex.raw('quantity + ?', [amount]),
        updated_at: new Date(),
      });

    return {
      success: true,
      previousQuantity,
      currentQuantity: previousQuantity + amount,
    };
  }

  /**
   * 재고 감소 (원자적, 조건부)
   *
   * UPDATE inventory
   * SET quantity = quantity - :amount
   * WHERE id = :id AND quantity >= :amount
   *
   * 재고가 부족하면 업데이트되지 않음
   */
  async decreaseQuantity(
    inventoryId: number,
    amount: number,
  ): Promise<QuantityUpdateResult> {
    if (amount <= 0) {
      throw new Error('감소량은 양수여야 합니다.');
    }

    const knex = this.getEntityManager().getKnex();

    // 현재 수량 조회 + 조건부 업데이트를 하나의 트랜잭션으로
    const result = await knex.raw<{
      rows: { previous_quantity: number; current_quantity: number }[];
    }>(
      `
      UPDATE inventory
      SET quantity = quantity - ?,
          updated_at = NOW()
      WHERE id = ? AND quantity >= ?
      RETURNING quantity + ? as previous_quantity, quantity as current_quantity
      `,
      [amount, inventoryId, amount, amount],
    );

    if (result.rows.length === 0) {
      // 재고 부족으로 업데이트 실패
      const current = await knex('inventory')
        .where('id', inventoryId)
        .select('quantity')
        .first<{ quantity: number }>();

      return {
        success: false,
        previousQuantity: current?.quantity ?? 0,
        currentQuantity: current?.quantity ?? 0,
      };
    }

    return {
      success: true,
      previousQuantity: result.rows[0].previous_quantity,
      currentQuantity: result.rows[0].current_quantity,
    };
  }

  /**
   * 재고 예약 (원자적, 조건부)
   *
   * 가용 재고(quantity - reserved_quantity)가 충분할 때만 예약
   */
  async reserve(
    inventoryId: number,
    amount: number,
  ): Promise<{ success: boolean; availableQuantity: number }> {
    if (amount <= 0) {
      throw new Error('예약량은 양수여야 합니다.');
    }

    const knex = this.getEntityManager().getKnex();

    const result = await knex.raw<{ rows: { reserved_quantity: number }[] }>(
      `
      UPDATE inventory
      SET reserved_quantity = reserved_quantity + ?,
          updated_at = NOW()
      WHERE id = ? AND (quantity - reserved_quantity) >= ?
      RETURNING reserved_quantity
      `,
      [amount, inventoryId, amount],
    );

    if (result.rows.length === 0) {
      const current = await knex('inventory')
        .where('id', inventoryId)
        .select(knex.raw('quantity - reserved_quantity as available_quantity'))
        .first<{ available_quantity: number }>();

      return {
        success: false,
        availableQuantity: current?.available_quantity ?? 0,
      };
    }

    return {
      success: true,
      availableQuantity: 0, // 예약 성공 시 가용 재고는 계산 필요 없음
    };
  }

  /**
   * 예약 해제 (원자적)
   */
  async releaseReservation(
    inventoryId: number,
    amount: number,
  ): Promise<{ success: boolean }> {
    if (amount <= 0) {
      throw new Error('해제량은 양수여야 합니다.');
    }

    const knex = this.getEntityManager().getKnex();

    const result = await knex.raw<{ rowCount: number }>(
      `
      UPDATE inventory
      SET reserved_quantity = reserved_quantity - ?,
          updated_at = NOW()
      WHERE id = ? AND reserved_quantity >= ?
      `,
      [amount, inventoryId, amount],
    );

    return { success: result.rowCount > 0 };
  }

  /**
   * 예약 확정 (원자적)
   *
   * 예약된 수량을 실제 재고에서 차감
   * reserved_quantity 감소 + quantity 감소
   */
  async confirmReservation(
    inventoryId: number,
    amount: number,
  ): Promise<QuantityUpdateResult> {
    if (amount <= 0) {
      throw new Error('확정량은 양수여야 합니다.');
    }

    const knex = this.getEntityManager().getKnex();

    const result = await knex.raw<{
      rows: { previous_quantity: number; current_quantity: number }[];
    }>(
      `
      UPDATE inventory
      SET quantity = quantity - ?,
          reserved_quantity = reserved_quantity - ?,
          updated_at = NOW()
      WHERE id = ? AND reserved_quantity >= ?
      RETURNING quantity + ? as previous_quantity, quantity as current_quantity
      `,
      [amount, amount, inventoryId, amount, amount],
    );

    if (result.rows.length === 0) {
      const current = await knex('inventory')
        .where('id', inventoryId)
        .select('quantity')
        .first<{ quantity: number }>();

      return {
        success: false,
        previousQuantity: current?.quantity ?? 0,
        currentQuantity: current?.quantity ?? 0,
      };
    }

    return {
      success: true,
      previousQuantity: result.rows[0].previous_quantity,
      currentQuantity: result.rows[0].current_quantity,
    };
  }

  /**
   * 재고 조정 (원자적)
   *
   * 양수면 증가, 음수면 감소
   * 감소 시 재고가 부족하면 실패
   */
  async adjust(
    inventoryId: number,
    adjustmentQuantity: number,
  ): Promise<QuantityUpdateResult> {
    if (adjustmentQuantity === 0) {
      throw new Error('조정량은 0이 아니어야 합니다.');
    }

    const knex = this.getEntityManager().getKnex();

    if (adjustmentQuantity > 0) {
      // 증가
      return this.increaseQuantity(inventoryId, adjustmentQuantity);
    }

    // 감소 (절대값 사용)
    const absAmount = Math.abs(adjustmentQuantity);

    const result = await knex.raw<{
      rows: { previous_quantity: number; current_quantity: number }[];
    }>(
      `
      UPDATE inventory
      SET quantity = quantity - ?,
          updated_at = NOW()
      WHERE id = ? AND quantity >= ?
      RETURNING quantity + ? as previous_quantity, quantity as current_quantity
      `,
      [absAmount, inventoryId, absAmount, absAmount],
    );

    if (result.rows.length === 0) {
      const current = await knex('inventory')
        .where('id', inventoryId)
        .select('quantity')
        .first<{ quantity: number }>();

      return {
        success: false,
        previousQuantity: current?.quantity ?? 0,
        currentQuantity: current?.quantity ?? 0,
      };
    }

    return {
      success: true,
      previousQuantity: result.rows[0].previous_quantity,
      currentQuantity: result.rows[0].current_quantity,
    };
  }
}
