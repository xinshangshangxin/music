import './style.scss';

import { IconButton } from '@material-ui/core';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import React, { useEffect, useState } from 'react';
import { debounceTime } from 'rxjs/operators';

import { player } from '../../helpers/player';
import { useEventHandler } from '../../rx';

function BottomNav() {
  const [song, setSong] = useState(player.currentSong);

  useEffect(() => {
    const s = player.songChange$.subscribe(() => {
      setSong(player.currentSong);
    });

    return () => {
      s.unsubscribe();
    };
  });

  const [paused, setPaused] = useState(player.isPaused);
  useEffect(() => {});

  const [onClick, click$] = useEventHandler();

  useEffect(() => {
    const s = click$.pipe(debounceTime(100)).subscribe(() => {
      console.info('player.isPaused: ', player.isPaused);
      if (!player.isPaused) {
        player.pause();
        setPaused(true);
      } else {
        player.play();
        setPaused(false);
      }
    });

    return () => {
      s.unsubscribe();
    };
  });

  const [onPre, pre$] = useEventHandler();
  useEffect(() => {
    const s = pre$.subscribe(() => {
      player.next();
    });

    return () => {
      s.unsubscribe();
    };
  });

  const [onNext, next$] = useEventHandler();
  useEffect(() => {
    const s = next$.subscribe(() => {
      player.next();
    });

    return () => {
      s.unsubscribe();
    };
  });

  return (
    <div className="play-bar">
      <div className="bottom">
        <div className="left">
          <div className="cover">
            <img src={song?.album?.img || undefined} alt="img" />
          </div>

          <div className="info">
            <div className="song-name">{song?.name}</div>

            <div className="singers">
              {song?.artists
                ?.map(({ name }) => {
                  return name;
                })
                .join(', ')}
            </div>
          </div>
        </div>

        <div className="center">
          <div className="controls">
            <IconButton className="previous" onClick={onPre}>
              <SkipPreviousIcon />
            </IconButton>

            <div className="play-btn" onClick={onClick}>
              {paused ? (
                <IconButton>
                  <PlayArrowIcon />
                </IconButton>
              ) : (
                <IconButton>
                  <PauseIcon />
                </IconButton>
              )}
            </div>

            <IconButton className="next" onClick={onNext}>
              <SkipNextIcon />
            </IconButton>
          </div>
        </div>

        <div className="right"></div>
      </div>
    </div>
  );
}

export { BottomNav };
