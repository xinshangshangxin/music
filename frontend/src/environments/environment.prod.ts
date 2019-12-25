export const environment = {
  production: true,
  backendUrl: '//music.xinshangshangxin.com',
  proxyUrl: '//musicproxy.leanapp.cn',

  build: {
    when: new Date().toISOString(),
    sha: process.env.SHA || 'no-sha',
  },
};
