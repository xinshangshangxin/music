export const SongSchema = {
  id: {
    type: String,
    required: true,
  },
  privilege: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  lrc: {
    type: String,
  },
  album: {
    type: Object,
  },
  artists: {
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
};
