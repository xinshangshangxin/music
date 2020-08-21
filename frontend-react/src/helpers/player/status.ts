import { PlayerBase } from './base';
import { Status } from './interface';

export class PlayerStatus extends PlayerBase {
  // 当前状态
  public status = Status.paused;

  public get isPaused() {
    return this.status === Status.paused;
  }
}
