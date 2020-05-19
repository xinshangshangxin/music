export const environment = {
  production: true,
  backendUrl: '//music.xinshangshangxin.com',
  proxyUrl: '//proxy.music.xinshangshangxin.com',

  build: {
    when: new Date().toISOString(),
    sha: process.env.SHA || 'no-sha',
  },
};
