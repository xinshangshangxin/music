export const SongPeakSchema = {
  id: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  peak: [
    {
      duration: {
        type: Number,
        required: true,
      },
      startTime: {
        type: Number,
        required: true,
      },
    },
  ],
  peaks: [
    {
      precision: {
        type: Number,
        required: true,
      },
      data: {
        type: Array,
        required: true,
      },
    },
  ],
};
