import { Observable, Subject } from 'rxjs';

import { PlayerSong } from '../audio/interface';
import { RxAudio } from '../audio/rx-audio';
import { Config } from './interface';

export class PlayerBase {
  // 当前播放下标
  public currentIndex = -1;

  // 当前播放列表
  public songList: PlayerSong[] = [];

  // 选择了列表中第几首歌播放
  public click$ = new Subject<number>();

  // 当前歌曲播放结束
  public end$ = new Subject<any>();

  // 当前歌曲播放错误
  public error$ = new Subject<Event>();

  // 当前歌曲信息有变更
  public persistTask$ = new Subject<PlayerSong>();

  // 歌曲预载入列表有变更
  public preloadTask$ = new Subject<PlayerSong[]>();

  // 切换其它歌曲
  public songChange$: Observable<PlayerSong>;

  // 当前歌曲正常播放了
  public played$ = new Subject<void>();

  // 配置, 需要手动配置
  public config: Config;

  // 当前音频对象
  public rxAudio: RxAudio | undefined;

  // 当前音量
  public volume: number;

  // 错误状态
  protected errorStatus = {
    nu: 0,
    continuous: 0,
  };
}
