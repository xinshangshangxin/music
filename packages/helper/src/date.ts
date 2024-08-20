const MILLISECONDS_MINUTE = 60 * 1000;
const MILLISECONDS_HOUR = 60 * MILLISECONDS_MINUTE;
const MILLISECONDS_DAY = 24 * MILLISECONDS_HOUR;

// 日期格式化
function formatDate(fmt: string, date = new Date()) {
  const o = {
    '([yY]+)': date.getFullYear(),
    '(M+)': date.getMonth() + 1, // 月份
    '([dD]+)': date.getDate(), // 日
    '([hH]+)': date.getHours(), // 小时
    '(m+)': date.getMinutes(), // 分
    '(s+)': date.getSeconds(), // 秒
    '([qQ]+)': Math.floor((date.getMonth() + 3) / 3), // 季度
    '(S+)': date.getMilliseconds(), // 毫秒
  };
  Object.keys(o).forEach((key) => {
    if (new RegExp(key).test(fmt)) {
      const v = o[key as '(s+)'];

      // eslint-disable-next-line regexp/no-legacy-features
      const match = RegExp.$1;
      if (/y/i.test(match) || match.length > 1) {
        fmt = fmt.replace(match, `00${v}`.substr(-match.length));
      } else {
        fmt = fmt.replace(match, `00${v}`.substr(-`${v}`.length));
      }
    }
  });
  return fmt;
}

export { formatDate, MILLISECONDS_DAY, MILLISECONDS_HOUR, MILLISECONDS_MINUTE };
