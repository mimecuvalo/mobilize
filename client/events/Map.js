import React, { PureComponent } from 'react';

const USA = {lat: 39.881002, lng: -99.825682};

export default class Map extends PureComponent {
  componentDidMount() {
    const map = new window.google.maps.Map(document.getElementById('map'), {
      zoom: 3,
      center: {lat: 39.881002, lng: -99.825682},
    });

    const locations = this.props.events
        .map(event => event.location ?
          {
            lat: event.location.location.latitude,
            lng: event.location.location.longitude,
            title: event.title,
          }
          : null
        )
        .filter(e => !!e && !!e.lat && !!e.lng);

    // Create an array of alphabetical characters used to label the markers.
    const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Add some markers to the map.
    const markers = locations.map((location, i) => {
      const marker = new window.google.maps.Marker({
        position: location,
        label: labels[i % labels.length],
        title: location.title,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<span style='color: #000'>${location.title}</span>`,
      });
      window.google.maps.event.addListener(marker, 'click', function() {
        infoWindow.open(map, marker);
      });

      return marker;
    });

    // Add a marker clusterer to manage the markers.
    const markerCluster = new window.MarkerClusterer(map, markers,
        {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
  }

  render() {
    return (
      <div className={this.props.className}>
        <div id="map" style={{ width: '100%', height: '100%' }} />
        <script src="https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js" />
        <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAkO301dUlrXRUf1BiuTVBGKINgSZsUg_o&callback=initMap" />
      </div>
    );
  }
}