import { getSongUrl } from '../audio/helper';
import { PlayerSong } from '../audio/interface';
import { Status } from './interface';
import { PlayerStatus } from './status';

type Position = number | 'next' | 'end';

export class PlayerAction extends PlayerStatus {
  public setVolume(value: number) {
    this.volume = value;

    this.setAudioVolume(value);
  }

  public pause() {
    this.status = Status.paused;

    if (this.rxAudio) {
      this.rxAudio.pause();
    }
  }

  public previous(): void {
    if (!this.songList.length) {
      return;
    }

    this.click$.next(this.getValidIndex(this.currentIndex - 1));
  }

  public next(): void {
    if (!this.songList.length) {
      return;
    }

    this.end$.next();
  }

  public playAt(position: Position): void {
    this.click$.next(this.position2index(position, true));
  }

  /**
   *
   * @param song PlayerSong
   * @param position next 插入到下一首, end 插入到末尾
   */
  public add(song: Omit<PlayerSong, 'url'>, position: Position = 'end') {
    const start = this.position2index(position);

    // 先删除重复歌曲
    const removeIndex = this.songList.findIndex(
      ({ provider, id }) => provider === song.provider && id === song.id,
    );
    if (removeIndex >= 0) {
      this.songList.splice(removeIndex, 1);
    }

    // 再加入歌单
    this.songList.splice(start, 0, {
      ...song,
      url: getSongUrl(song),
    });
    this.persistTask$.next();
  }

  public remove(index: number) {
    this.songList.splice(index, 1);
    this.persistTask$.next();
  }

  public loadSongList(list: PlayerSong[], currentIndex = 0, isPlay = false) {
    // 更正游标
    this.currentIndex = currentIndex;
    // 更新列表
    this.songList.length = 0;
    this.songList.push(...list);

    // 保存到storage
    this.persistTask$.next();

    if (this.songList.length) {
      // 触发歌曲载入
      this.loadNextSongs();
    }

    if (isPlay && this.songList.length) {
      this.playAt(this.currentIndex);
    }
  }

  public loadNextSongs(offset = 0): void {
    const start = this.getValidIndex(this.currentIndex + offset);
    let end = start + this.config.preloadLen + 1;

    let songs: PlayerSong[] = [];

    if (end <= this.songList.length) {
      console.info('loadNextSongs: preload song index: ', [start, end]);

      songs = this.songList.slice(start, end);
    } else {
      end = this.getValidIndex(end);
      console.info(
        'loadNextSongs: preload song index: ',
        [start, 'end'],
        [0, end],
      );

      songs = [
        ...this.songList.slice(start),
        ...this.songList.slice(0, end),
      ];
    }

    console.info('load songs: ', songs.map(({ name }) => name));

    this.preloadTask$.next(songs);
  }

  protected getValidIndex(nu: number): number {
    if (!this.songList.length) {
      return -1;
    }

    // 往前选择
    // eslint-disable-next-line no-param-reassign
    nu += this.songList.length;
    if (nu < 0) {
      return -1;
    }

    return nu % this.songList.length;
  }

  protected setIndex(nu: number): number {
    this.currentIndex = this.getValidIndex(nu);
    // 游标变更了, 错误标志位也要重置
    this.errorStatus.nu = 0;

    return this.currentIndex;
  }

  protected setIndexStep(step: number): number {
    return this.setIndex(this.currentIndex + step);
  }

  protected setAudioVolume(value: number) {
    if (this.rxAudio) {
      this.rxAudio.volume = value;
    }
  }

  private position2index(position: Position, isPlay = false) {
    let index: number;
    if (position === 'next') {
      index = this.getValidIndex(this.currentIndex + 1);
    } else if (position === 'end') {
      index = this.songList.length;

      if (isPlay) {
        index -= 1;
      }
    } else {
      index = position;
    }

    return index;
  }
}
