import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { SimulatePaymentDto } from './dto/simulate-payment.dto';

export interface PaymentRecord {
  id: string;
  order_id: string | null;
  amount: number;
  status: string;
  provider: string;
  last4: string;
  metadata: Record<string, unknown>;
  created_at: string;
  processed_at: string;
}

@Injectable()
export class PaymentsService {
  constructor(@Inject('DATABASE_POOL') private db: any) {}

  async simulate(
    dto: SimulatePaymentDto,
    customerId: string,
  ): Promise<{ paymentId: string; status: string }> {
    const paymentId = uuid();
    const last4 = dto.cardNumber.slice(-4);
    const status = 'succeeded'; // siempre éxito; validación previa garantiza datos correctos

    await this.db.query(
      `INSERT INTO public.payments
         (id, order_id, amount, status, provider, last4, metadata, processed_at)
       VALUES ($1, $2, $3, $4, 'simulator', $5, $6::jsonb, now())`,
      [
        paymentId,
        dto.orderId ?? null,
        dto.amount,
        status,
        last4,
        JSON.stringify({
          customer_id: customerId,
          cardholder_name: dto.cardholderName,
          expiry: dto.expiry,
          // nunca almacenamos cardNumber completo ni CVC
        }),
      ],
    );

    return { paymentId, status };
  }

  async findAll(limit = 50, offset = 0): Promise<PaymentRecord[]> {
    const result = await this.db.query(
      `SELECT * FROM public.payments ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return result.rows;
  }
}
