import { Product } from '../product.entity';

export interface OptionGroupCreationArgs {
  name: string;
  required: boolean;
  product: Product;
}
