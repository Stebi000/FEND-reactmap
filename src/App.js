import React, { Component } from 'react';
import { GoogleApiWrapper } from 'google-maps-react'
import './App.css';
import MapContainer from './MapContainer'

class App extends Component {

render() {
  return (
    <div>
      <a className="menu" tabIndex="0">   
      </a>
      <h1 className="heading">Find Caravaggio Masterpieces in Rome</h1>
      <MapContainer google={this.props.google} />
    </div>
  );
}
}

export default GoogleApiWrapper({
apiKey: 'AIzaSyAp3he4L12kp1R8lGehHkLmhUSLSTYKHko'
})(App)
