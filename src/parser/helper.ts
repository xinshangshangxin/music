function splitLine(content: string) {
  return content
    .split(/[\r\n]/)
    .map((s) => {
      return s.trim();
    })
    .filter((s) => {
      return !!s;
    });
}

const baseInfoRegExpMap = {
  ti: /^\[ti:([\s\S]*?)\]/,
  ar: /^\[ar:([\s\S]*?)\]/,
  al: /^\[al:([\s\S]*?)\]/,
  by: /^\[by:([\s\S]*?)\]/,
  offset: /^\[offset:([\s\S]*?)\]/,
};

export { splitLine, baseInfoRegExpMap };
