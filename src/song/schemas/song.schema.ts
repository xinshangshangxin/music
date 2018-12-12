export const SongSchema = {
  id: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  lrc: {
    type: String,
    required: true,
  },
  album: {
    type: Object,
    required: true,
  },
  artist: {
    type: Array,
  },
  duration: {
    type: Number,
  },
  klyric: {
    type: String,
  },
  extra: {
    type: Object,
  },
  peak: {
    type: Object,
  },
};
