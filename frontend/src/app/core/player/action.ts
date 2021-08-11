import { getSongUrl } from '../audio/helper';
import { PlayerSong } from '../audio/interface';
import { Position, Status } from './interface';
import { PlayerStatus } from './status';

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

  public playAt(position: Position): void;

  public playAt(position: PlayerSong): void;

  public playAt(position: Position | PlayerSong): void {
    if (typeof position === 'object') {
      const index = this.song2index(position);

      this.click$.next(this.position2index(index, true));
    } else {
      this.click$.next(this.position2index(position, true));
    }
  }

  /**
   *
   * @param song PlayerSong
   * @param position next 插入到下一首, end 插入到末尾
   */
  public add(song: Omit<PlayerSong, 'url'>, position: Position = 'current') {
    const oldSong = this.currentSong;
    // 先删除重复歌曲
    const removeIndex = this.songList.findIndex(
      ({ provider, id }) => provider === song.provider && id === song.id
    );
    if (removeIndex >= 0) {
      this.songList.splice(removeIndex, 1);
    }

    const start = this.position2index(position);

    // 再加入歌单
    this.songList.splice(start, 0, { ...song });

    // 更正游标
    this.currentIndex = this.song2index(oldSong);

    this.persistTask$.next();
  }

  public remove(index: number): void;

  public remove(song: PlayerSong): void;

  public remove(item: number | PlayerSong) {
    const oldSong = this.currentSong;

    let deleteIndex: number;
    if (typeof item !== 'number') {
      deleteIndex = this.song2index(item);
    } else {
      deleteIndex = item;
    }

    this.songList.splice(this.getValidIndex(deleteIndex), 1);

    // 正在播放的歌曲被删除, 播放下一首
    if (this.currentIndex === deleteIndex) {
      this.error$.next({ index: this.currentIndex, data: 'delete playing song' });

      if (this.status === Status.paused) {
        this.pause();
      }
    } else {
      this.currentIndex = this.song2index(oldSong);
    }

    this.persistTask$.next();
  }

  public updateSongs(songs: Omit<PlayerSong, 'url'>[]) {
    const wrapList = songs.map((song) => ({
      ...song,
      url: getSongUrl(song, 'ignore'),
    }));

    // 更新列表
    this.songList.length = 0;
    this.songList.push(...wrapList);
  }

  protected loadSongList(
    list: Omit<PlayerSong, 'url'>[],
    currentIndex = 0,
    isPlay = false,
    isLoadNext = true
  ) {
    // 更正游标
    this.currentIndex = currentIndex;
    // 更新列表
    this.updateSongs(list);

    // 保存到storage
    this.persistTask$.next();

    if (this.songList.length && isLoadNext) {
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
      songs = this.songList.slice(start, end);
    } else {
      end = this.getValidIndex(end);

      songs = [...this.songList.slice(start), ...this.songList.slice(0, end)];
    }

    console.info(
      'load songs: ',
      [start, end],
      songs.map(({ name }) => name)
    );

    this.preloadTask$.next(songs);
  }

  public position2index(position: Position, endShiftLeft = false) {
    let index: number;
    switch (position) {
      case 'current':
        index = this.getValidIndex(this.currentIndex);
        if (index === -1) {
          index = 0;
        }
        break;
      case 'next':
        index = this.getValidIndex(this.currentIndex + 1);
        break;
      case 'end':
        index = this.songList.length;
        if (endShiftLeft) {
          index = this.getValidIndex(index - 1);
        }
        break;
      default:
        index = position;
        break;
    }

    return index;
  }

  public song2index(playSong: Pick<PlayerSong, 'id' | 'provider'> | null) {
    if (playSong === null) {
      return -1;
    }

    return this.songList.findIndex(
      (song) => song.id === playSong.id && song.provider === playSong.provider
    );
  }

  public get currentSong() {
    return this.getSong(this.currentIndex);
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

  protected getSong(index: number): PlayerSong | null {
    // eslint-disable-next-line no-param-reassign
    index = this.getValidIndex(index);

    if (index < 0) {
      return null;
    }

    return this.songList[index];
  }
}
