const qq = {
  provider: 'adapterQQ',
  request: {
    json: true,
    timeout: 10000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
    },
    rejectUnauthorized: false,
  },
  search: {
    url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
    method: 'POST',
    json: true,
    body: {
      'music.search.SearchCgiService': {
        method: 'DoSearchForQQMusicDesktop',
        module: 'music.search.SearchCgiService',
        param: {
          num_per_page: 10,
          page_num: 1,
          query: '{{keyword}}',
          search_type: 0,
        },
      },
    },

    result:
      '[.["music.search.SearchCgiService"].data.body.song.list[] | {id: .mid, name: .name, artists: .singer, album: {name: .album.name, img: ("https://y.qq.com/music/photo_new/T002R300x300M000" + .album.mid + ".jpg")}}]',
  },
  song: {
    url: 'http://u.y.qq.com/cgi-bin/musicu.fcg',
    qs: {
      data:
        '{"songinfo":{"method":"get_song_detail_yqq","module":"music.pf_song_detail_svr","param":{"song_mid":"{{id}}"}}}',
    },

    result: `.songinfo.data.track_info | {
      id: .mid, 
      name: .name, 
      artists: .singer, 
      album: {
        id: .album.mid,
        name: .album.name,
        img: ("https://y.qq.com/music/photo_new/T002R300x300M000" + .album.mid + ".jpg")
      }
    }`,
  },
  url: {
    url: 'https://thewind.xyz/api/download',
    formData: { songid: '{{id}}', src: 'QQ', quality: 'LQ' },

    result: '.downloadLinkMap.LQ',
  },
};

export default qq;
