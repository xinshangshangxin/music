import React from 'react';

import './style.scss'

import { PlayerSong } from '../../helpers/audio/interface';
import SongListItem from './song-item/';

function SongList(props: {songs: Omit<PlayerSong, 'url'>[]}) {
  return (
    <div className="song-list">
      {props.songs.map((song) => {
        return <SongListItem key={song.id + song.provider} song={song} />;
      })}
    </div>
  );
}

export default SongList;
