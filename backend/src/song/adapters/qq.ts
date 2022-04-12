const qq = {
  provider: 'qq',
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
    url: 'http://c.y.qq.com/soso/fcgi-bin/client_search_cp',
    qs: {
      format: 'json', // 返回json格式
      n: 10, // 一页显示多少条信息
      p: 1, // 第几页
      w: '{{keyword}}', // 搜索关键词
      cr: 1, // 不知道这个参数什么意思，但是加上这个参数你会对搜索结果更满意的
      g_tk: 5381,
      t: 0,
    },

    result: '[.data.song.list[] | { id: .songmid, name: .songname, artists: .singer, album: {name: .albumname, img: ("https://y.qq.com/music/photo_new/T002R300x300M000" + .albummid + ".jpg") } }]',
  },
  url: {
    url: 'https://thewind.xyz/api/download',
    formData: { songid: '{{id}}', src: 'QQ', quality: 'LQ' },

    result: '.downloadLinkMap.LQ',
  },
};

export default qq;
