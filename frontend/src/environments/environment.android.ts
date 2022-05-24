export const environment = {
  production: true,
  backendUrl: 'https://music.xinshangshangxin.com',
  // proxyUrl: '//music.xinshangshangxin.com/proxy',
  proxyUrl: 'http://localhost:22519/proxy',

  build: {
    when: new Date().toISOString(),
    sha: process.env.SHA || 'no-sha',
  },
};
