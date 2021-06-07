export const environment = {
  production: true,
  backendUrl: '',
  proxyUrl: '//music.xinshangshangxin.com/proxy',

  build: {
    when: new Date().toISOString(),
    sha: process.env.SHA || 'no-sha',
  },
};
