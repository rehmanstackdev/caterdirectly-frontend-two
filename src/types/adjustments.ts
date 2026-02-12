
export type AdjustmentType = 'fixed' | 'percentage';
export type AdjustmentMode = 'surcharge' | 'discount';

export interface CustomAdjustment {
  id: string;           // client-side uuid
  label: string;        // description shown to client
  type: AdjustmentType; // 'fixed' | 'percentage'
  mode: AdjustmentMode; // 'surcharge' | 'discount'
  value: number;        // fixed amount (USD) or percentage value (e.g. 10 => 10%)
  taxable?: boolean;    // if true, contributes to tax base; default true
}
