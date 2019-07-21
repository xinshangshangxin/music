import { fromEvent, merge, Observable, Subject, throwError } from 'rxjs';
import { mapTo, takeUntil, tap, startWith } from 'rxjs/operators';

interface InputWord {
  word: string;
  offset: number;
  duration: number;
}

interface Word extends InputWord {
  ele: HTMLSpanElement;
  playing: boolean;
}

interface Line {
  ele: HTMLParagraphElement;
  playing: boolean;
  words: Word[];
}

export class Lrc {
  private readonly lineClassName = 'line';
  private readonly playingClassName = 'playing';
  private readonly wordClassName = ['word', 'purple'];

  private lines: Line[] = [];
  private currentLine = 0;
  private currentWord = 0;
  private audio: HTMLAudioElement | undefined;
  private parent: HTMLElement = document.createElement('div');

  private lastDestroy$ = new Subject<void>();

  private mergeRange = [0, 1];
  private running = false;

  constructor(audio?: HTMLAudioElement) {
    this.audio = audio;
  }

  public setContainer(ele: HTMLElement) {
    this.parent = ele;
  }

  public getKLrc(inputLine: InputWord[][], audio = this.audio): Observable<any> {
    this.lastDestroy$.next();

    if (!audio) {
      return throwError('no audio ele');
    }

    this.audio = audio;

    this.changeLrc(inputLine);
    this.reset();

    return merge(
      fromEvent(this.audio, 'play').pipe(
        startWith(null),
        mapTo(true)
      ),
      merge(fromEvent(this.audio, 'pause'), fromEvent(this.audio, 'error'), this.lastDestroy$).pipe(
        mapTo(false)
      )
    ).pipe(
      // throttleTime(100),
      tap((running) => {
        this.running = running;
        this.requestAnimationFrameCheck();
      }),
      takeUntil(this.lastDestroy$)
    );

    // return fromEvent(this.audio, 'timeupdate').pipe(
    //   // throttleTime(100),
    //   tap(() => {
    //     this.check();
    //   }),
    //   takeUntil(this.lastDestroy$)
    // );
  }

  private requestAnimationFrameCheck() {
    window.requestAnimationFrame(() => {
      this.check();

      if (this.running) {
        this.requestAnimationFrameCheck();
      }
    });
  }

  private deepCloneInputLines(inputLines: InputWord[][]): InputWord[][] {
    return inputLines.map((line) => {
      return line.map((item) => {
        return { ...item };
      });
    });
  }

  private wrapInput(inputLines: InputWord[][]): Line[] {
    return this.deepCloneInputLines(inputLines).map((line) => {
      const words: Word[] = [];

      line.forEach((item, index) => {
        const nextItem = line[index + 1];

        if (
          nextItem &&
          item.duration < this.mergeRange[0] &&
          item.duration + nextItem.duration < this.mergeRange[1]
        ) {
          nextItem.word = item.word + nextItem.word;
          nextItem.duration = item.duration + nextItem.duration;
          nextItem.offset = item.offset;
        } else {
          words.push({
            ele: document.createElement('span'),
            playing: false,
            ...item,
          });
        }
      });

      return {
        ele: document.createElement('p'),
        playing: false,
        words,
      };
    });
  }

  private changeLrc(inputLine: InputWord[][]) {
    this.lines = this.wrapInput(inputLine);

    const fragment = document.createDocumentFragment();

    this.lines.forEach((line) => {
      line.ele.classList.add(this.lineClassName);

      line.words.forEach((item) => {
        const { word, ele } = item;

        ele.classList.add(...this.wordClassName);
        ele.textContent = word;
        line.ele.appendChild(ele);
      });

      fragment.appendChild(line.ele);
    });

    // 先清除
    while (this.parent.firstChild) {
      this.parent.firstChild.remove();
    }

    // 再添加
    this.parent.appendChild(fragment);
  }

  private reset() {
    this.currentLine = 0;
    this.currentWord = 0;

    this.lines.forEach((line, index) => {
      line.playing = false;
      line.ele.classList.remove(this.playingClassName);

      const lastWord = line.words[line.words.length - 1];
      if (this.audio && lastWord.offset + lastWord.duration < this.audio.currentTime) {
        return;
      }

      this.clearLineState(index, false);
    });
  }

  private clearLineState(index = this.currentLine - 1, checkUpLayer = true) {
    const line = this.lines[index];
    if (line && line.playing) {
      line.words.forEach((item) => {
        item.playing = false;
        item.ele.style.animation = '';
      });

      line.playing = false;
      line.ele.classList.remove(this.playingClassName);
    }

    if (!checkUpLayer) {
      return;
    }

    // 如果上上行还没清除, 要去清除下
    const upLayerLine = this.lines[index - 1];
    if (upLayerLine && upLayerLine.playing) {
      this.clearLineState(index - 1);
    }
  }

  private check() {
    const line = this.lines[this.currentLine];

    // 没有歌词了
    if (!line) {
      return;
    }

    const word = line.words[this.currentWord];

    // 没有单字了, 下一行检查
    if (!word) {
      this.currentWord = 0;
      this.currentLine += 1;
      this.check();
      return;
    }

    const { currentTime } = this.audio as HTMLAudioElement;
    const { offset, duration, playing, ele } = word;

    // 还没到这个字
    if (offset > currentTime) {
      return;
    }

    // 当前行正在播放
    if (!line.playing) {
      line.playing = true;
      line.ele.classList.add(this.playingClassName);
      this.parent.style.transform = `translateY(${-this.currentLine * 40 + 100}px)`;

      // 清除上一行的状态
      this.clearLineState();
    }

    // 到下一个单字了
    if (offset + duration <= currentTime) {
      // 当前这个单字没有初始化
      if (!playing) {
        ele.style.animation = `cover 0s linear 0s 1 normal forwards running`;
        word.playing = true;
      }

      this.currentWord += 1;
      this.check();
      return;
    }

    // 已经设置过了
    if (playing) {
      return;
    }

    let d = offset + duration - currentTime;
    // 在当前这个字
    ele.style.animation = `cover ${d}s linear 0s 1 normal forwards running`;
    word.playing = true;

    this.currentWord += 1;
  }
}
