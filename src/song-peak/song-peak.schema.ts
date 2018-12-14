export const SongPeakSchema = {
  id: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  peakStartTime: {
    type: Number,
    required: true,
  },
  peakEndTime: {
    type: Number,
    required: true,
  },
};
