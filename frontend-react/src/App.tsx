import './App.scss';

import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { player } from './helpers/player';
import { demoSongs } from './helpers/player/demo';
import { Search } from './pages/search';

export default function App() {
  player.loadSongList(demoSongs);

  return (
    <Router>
      <Switch>
        <Route path="/about"></Route>
        <Route path="/topics"></Route>
        <Route path="/">
          <Search />
        </Route>
      </Switch>
    </Router>
  );
}
