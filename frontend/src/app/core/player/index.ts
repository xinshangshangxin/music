import { tap } from 'rxjs/operators';
import { PlayerPlay } from './play';

export class Player extends PlayerPlay {
  constructor() {
    super();

    this.tryAddMediaSession();
  }

  private tryAddMediaSession() {
    try {
      navigator.mediaSession.setActionHandler('play', () => {
        this.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause();
        navigator.mediaSession.playbackState = 'paused';
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this.next();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        this.previous();
      });

      this.play$
        .pipe(
          tap(() => {
            navigator.mediaSession.playbackState = 'playing';

            const song = this.currentSong;
            if (!song) {
              return;
            }

            // @ts-ignore
            navigator.mediaSession.metadata = new MediaMetadata({
              title: song.name,
              artist:
                (song.artists &&
                  song.artists
                    .map(({ name }) => {
                      return name;
                    })
                    .join('&')) ||
                '',
              album: (song.album && song.album.name) || '',
              artwork: song.album ? [{ src: song.album.img }] : []
            });
          })
        )
        .subscribe(
          () => {},
          e => {
            console.warn('play watch failed', e);
          }
        );

      // @ts-ignore
      navigator.mediaSession.setActionHandler('togglePlay', () => {
        if (this.status === 'paused') {
          this.play();
        } else {
          this.pause();
        }
      });
    } catch (e) {
      console.warn('add mediaSession failed', e);
    }
  }
}
