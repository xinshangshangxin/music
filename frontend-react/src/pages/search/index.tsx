import React, { useEffect, useState } from 'react';
import { from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import './style.scss';

import { sdk } from '../../apollo';
import { BottomNav } from '../../components/bottom-nav';
import SongList from '../../components/song-list';
import { TopNav } from '../../components/top-nav';
import { PlayerSong } from '../../helpers/audio/interface';
import { player } from '../../helpers/player';
import { searchSubject } from '../../helpers/singleton';

export function Search() {
  const [songs, setSongs] = useState<Omit<PlayerSong, 'url'>[]>([]);

  useEffect(() => {
    const s = searchSubject
      .pipe(
        switchMap((v) => {
          if (!v) {
            return of({ search: player.songList });
          }

          return from(sdk.search({ keyword: v }));
        })
      )
      .subscribe((songList) => {
        setSongs(songList.search);
      });

    return () => {
      s.unsubscribe();
    };
  });

  return (
    <div className="layout">
      <TopNav />
      <div className="main">
        <SongList songs={songs} />
      </div>

      <div className="play-bar">
        <BottomNav />
      </div>
    </div>
  );
}
