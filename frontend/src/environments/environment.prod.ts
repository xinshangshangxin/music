export const environment = {
  production: true,
  backendUrl: '',
  proxyUrl: '//proxy.music.xinshangshangxin.com',

  build: {
    when: new Date().toISOString(),
    sha: process.env.SHA || 'no-sha',
  },
};
