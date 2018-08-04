import React, {Component} from 'react'
import ReactDOM from 'react-dom'

export default class MapContainer extends Component {

  state = {
    locations:[
      {name: "Church of St. Louis of the French", location: {lat: 41.8995, lng: 12.4745}},
      {name: "Basilica of Sant'Agostino", location: {lat: 41.9010, lng: 12.4743}},
      {name: "Basilica of Santa Maria del Popolo", location: {lat: 41.9114, lng: 12.4766}},
      {name: "Doria Pamphilj Gallery", location: {lat: 41.8979, lng: 12.4815}},
      {name: "Borghese Gallery", location: {lat: 41.9142, lng: 12.4921}},
      {name: "Vatican Museums", location: {lat: 41.9064, lng: 12.4536}},
      {name: "National Gallery of Ancient Art", location: {lat: 41.9031, lng: 12.4900}},
      {name: "Capitoline Museums", location: {lat: 41.8929, lng: 12.4825}},
      {name: "Corsini Gallery", location: {lat: 41.8932, lng: 12.4668}}
    ],
    query: '',
    markers: [],
    infowindow: new this.props.google.maps.InfoWindow(),
    highlightedIcon: null
  }

  componentDidMount() {
    this.loadMap()
    this.onclickLocation()
    this.setState({highlightedIcon: this.makeMarkerIcon('FFFF24')})
  }

  loadMap() {
    if (this.props && this.props.google) {
      const {google} = this.props
      const maps = google.maps

      const mapRef = this.refs.map
      const node = ReactDOM.findDOMNode(mapRef)

      const mapConfig = Object.assign({}, {
        center: {lat: 41.8919, lng: 12.5113},
        zoom: 12,
        mapTypeId: 'roadmap'
      })

      this.map = new maps.Map(node, mapConfig)
      this.addMarkers()
    }

  }

  onclickLocation = () => {
    const that = this
    const {infowindow} = this.state

    const displayInfowindow = (e) => {
      const {markers} = this.state
      const markerInd =
        markers.findIndex(m => m.title.toLowerCase() === e.target.innerText.toLowerCase())
      that.populateInfoWindow(markers[markerInd], infowindow)
    }
    document.querySelector('.locations-list').addEventListener('click', function (e) {
      if (e.target && e.target.nodeName === "LI") {
        displayInfowindow(e)
      }
    })
  }

  handleValueChange = (e) => {
    this.setState({query: e.target.value})
  }

  addMarkers = () => {
    const {google} = this.props
    let {infowindow} = this.state
    const bounds = new google.maps.LatLngBounds()

    this.state.locations.forEach((location, ind) => {
      const marker = new google.maps.Marker({
        position: {lat: location.location.lat, lng: location.location.lng},
        map: this.map,
        title: location.name
      })

      marker.addListener('click', () => {
        this.populateInfoWindow(marker, infowindow)
      })
      this.setState((state) => ({
        markers: [...state.markers, marker]
      }))
      bounds.extend(marker.position)
    })
    this.map.fitBounds(bounds)
  }

    // fetch data asynchronously from media wiki api
    fetchFromWikipedia = (marker, infowindow, map) => {
      const search = marker.title.split(' ').join('_')
      const url = 'https://en.wikipedia.org/w/api.php?action=query&origin=*&prop=extracts&exintro&titles=' + search + '&format=json&utf8'
      let extract = ''
      const outerMap = this
      // Using fetch
      fetch( url, {
        method: 'POST',
        headers: new Headers( {
            'Api-User-Agent': 'Example/1.0'
        } )
        // Other init settings such as 'credentials'
      } ).then( function ( response ) {
        if ( response.ok ) {
            return response.json();
        }
        throw new Error( 'Network response was not ok: ' + response.statusText );
      } ).then( function ( data ) {
        // do something with data
        const pages = data.query.pages
        extract = pages[Object.keys(pages)[0]].extract
        const firstParagraph = extract.slice(0, extract.indexOf('</p>') + '</p>'.length)
        const pageLink = `<a href="https://en.wikipedia.org/wiki/${search}">For more information, visit ${search} on Wikipedia website</a>`

        outerMap.fillInfoWindow(marker, infowindow, map, firstParagraph + pageLink)
      });
    }

    // fill infowindow with retrieved wiki data.
    fillInfoWindow = (marker, infowindow, map, wikiData) => {
      infowindow.marker = marker
      // infowindow.setContent('<div>' + marker.title + '</div>' + '<div>' + wikiData + '</div>')
      infowindow.setContent(`<h2>${marker.title}</h2><div>${wikiData}</div>`)
      infowindow.open(map, marker)
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null
      })
    }

    populateInfoWindow = (marker, infowindow, map) => {
      const defaultIcon = marker.getIcon()
      const {highlightedIcon, markers} = this.state
      // Check to make sure the infowindow is not already opened on this marker.
      if (infowindow.marker !== marker) {
        // reset the color of previous marker
        if (infowindow.marker) {
          const ind = markers.findIndex(m => m.title === infowindow.marker.title)
          markers[ind].setIcon(defaultIcon)
        }
        // change marker icon color of clicked marker
        marker.setIcon(highlightedIcon)
        infowindow.marker = marker
        this.fetchFromWikipedia(marker, infowindow, map)
        //infowindow.setContent(`<h3>${marker.title}</h3>`)
        infowindow.open(this.map, marker)
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
          infowindow.marker = null
        })
      }
    }

  makeMarkerIcon = (markerColor) => {
    const {google} = this.props
    let markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21, 34));
    return markerImage;
  }

  render() {
    const {locations, query, markers, infowindow} = this.state
    if (query) {
      locations.forEach((l, i) => {
        if (l.name.toLowerCase().includes(query.toLowerCase())) {
          markers[i].setVisible(true)
        } else {
          if (infowindow.marker === markers[i]) {
            // close the info window if marker removed
            infowindow.close()
          }
          markers[i].setVisible(false)
        }
      })
    } else {
      locations.forEach((l, i) => {
        if (markers.length && markers[i]) {
          markers[i].setVisible(true)
        }
      })
    }
    return (
      <div>
        <div className="container">
          <div className="text-input">
            <input role="search" type='text' placeholder='search'
                   value={this.state.value}
                   onChange={this.handleValueChange}/>
            <ul className="locations-list">{
              markers.filter(m => m.getVisible()).map((m, i) =>
                (<li key={i}>{m.title}</li>))
            }</ul>
          </div>
          <div role="application" className="map" ref="map">
            loading map...
          </div>
        </div>
      </div>
    )
  }
}
