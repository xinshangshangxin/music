import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { DEFAULT_PEAK_CONFIG } from '../audio/constant';
import { getSongUrl } from '../audio/helper';
import { PeakSong } from '../audio/interface';
import { PoolAudio } from '../audio/pool-audio';
import { PlayerPlay } from './play';

const poolAudio = new PoolAudio();

const player = new PlayerPlay();

player.songChange$
  .pipe(
    switchMap((song) => {
      const poolItem = poolAudio.getSong(
        {
          song,
          peakConfig: { ...DEFAULT_PEAK_CONFIG, duration: Number.MAX_SAFE_INTEGER as 0 },
        },
        of({
          song: {
            ...song,
            url: getSongUrl(song),
            peakStartTime: 0,
            peakDuration: Number.MAX_SAFE_INTEGER,
          } as PeakSong,
          changed: false,
        })
      );

      return player.playSong(poolItem.source$);
    })
  )
  .subscribe(console.log, console.warn);

export { player };
