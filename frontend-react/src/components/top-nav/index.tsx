import './style.scss';

import { IconButton } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import SettingsIcon from '@material-ui/icons/Settings';
import React from 'react';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { searchSubject } from '../../helpers/singleton';
import { useEventHandler } from '../../rx';

export function TopNav() {
  const [onKeyUp, keyUp$] = useEventHandler<any>();

  keyUp$
    .pipe(
      map((e) => {
        return e.target.value as string;
      }),
      map((data) => (data || '').trim()),
      debounceTime(300),
      distinctUntilChanged()
    )
    .subscribe((data) => {
      console.info(data);
      searchSubject.next(data);
    }, console.warn);

  return (
    <div className="top-nav">
      <Button>Music</Button>

      <div className="search">
        <TextField type="text" placeholder="歌曲/歌手" onKeyUp={onKeyUp} />
      </div>

      <IconButton aria-label="delete" size="small">
        <SettingsIcon fontSize="inherit" />
      </IconButton>
    </div>
  );
}
