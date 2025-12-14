import { Option } from '../option.entity';

export interface OptionPriceCreationArgs {
  price: number;
  option: Option;
  validFrom?: Date;
  validTo?: Date | null;
}
