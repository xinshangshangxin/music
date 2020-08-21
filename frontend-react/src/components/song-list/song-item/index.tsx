import './style.scss';

import React, { useEffect } from 'react';

import { player } from '../../../helpers/player';
import { useEventHandler } from '../../../rx';
import { SongListItemProps } from '../../interface';

export function SongListItem(props: SongListItemProps) {
  const [onClick, click$] = useEventHandler();

  useEffect(() => {
    const subscription = click$.subscribe(() => {
      const index = player.song2index(props.song);
      console.info('====', index, player.songList);

      if (index === -1) {
        player.add(props.song, 'end');
        player.playAt('end');
      } else {
        player.playAt(index);
      }
    }, console.warn);

    return () => {
      subscription.unsubscribe();
    };
  });

  return (
    <div className="song-box">
      <span className="song-info" onClick={onClick}>
        <img className="logo" src="assets/logos/kugou.png" alt="logo" />
        <span className="song-name">{props.song.name}</span>

        <span className="song-artists">
          {props.song.artists
            ?.map(({ name }) => {
              return name;
            })
            .join(', ')}
        </span>

        <span className="song-control">
          <i className="material-icons"></i>
        </span>
      </span>
    </div>
  );
}

export default SongListItem;
