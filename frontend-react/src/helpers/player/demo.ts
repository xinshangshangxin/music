import { Provider } from '../../apollo/graphql';
import { PlayerSong } from '../audio/interface';

export const demoSongs: Omit<PlayerSong, 'url'>[] = [
  {
    id: '6e490acfb95e6fc8870b5c7d0ea40c23',
    name: '你就不要想起我',
    provider: Provider.Kugou,
    artists: [
      {
        id: '6046',
        name: '田馥甄',
      },
    ],
    album: {
      id: '965595',
      name: '渺小',
      img: 'http://imge.kugou.com/stdmusic/400/20160713/20160713100013479508.jpg',
    },
    duration: 282,
    privilege: 'allow',
    peakDuration: 35,
    peakStartTime: 185,
  },
  {
    id: '1770409076',
    name: '魔鬼中的天使',
    provider: Provider.Xiami,
    artists: [
      {
        id: '78523',
        name: '田馥甄',
      },
    ],
    album: {
      id: '459960',
      name: 'My Love',
      img: 'http://img.xiami.net/images/album/img72/801972/4599601526801972_3.jpg',
    },
    peakStartTime: 166.6,
    duration: null,
    privilege: 'allow',
    peakDuration: 35,
  },
  {
    id: '296885',
    name: '寂寞寂寞就好',
    provider: Provider.Netease,
    artists: [
      {
        id: '9548',
        name: '田馥甄',
      },
    ],
    album: {
      id: '29447',
      name: 'To Hebe',
      img: 'https://p1.music.126.net/_o12jScXd17VO79VCsitbA==/109951163167534993.jpg',
    },
    peakStartTime: 87.9,
    duration: 275.12,
    privilege: 'allow',
    peakDuration: 35,
  },
];
