import React from 'react';
import logo from './logo.svg';
import './App.css';
import Search from './components/Search';
import { CookiesProvider } from 'react-cookie';


function App() {
  return (
    <CookiesProvider>
      <div className="App">
        <Search></Search>
      </div>
    </CookiesProvider>
  );
}

export default App;
