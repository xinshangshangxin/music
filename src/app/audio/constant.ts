import { PeakConfig } from './interface';

export const defaultPeakConfig: PeakConfig = {
  maxVolume: 1,
  minVolume: 0.2,
  duration: 20,
  layIn: 2,
  layOut: 3,
  before: 6,
  after: 4,
  precision: 10,
};
