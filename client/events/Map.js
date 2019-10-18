import React, { PureComponent } from 'react';

const USA = {lat: 39.881002, lng: -99.825682};

export default class Map extends PureComponent {
  componentDidMount() {
    this.markerCluster = null;
    this.map = new window.google.maps.Map(document.getElementById('map'), {
      zoom: 3,
      center: USA,
    });

    this.setMarkers();
  }

  componentDidUpdate() {
    this.setMarkers();
  }

  setMarkers() {
    if (this.markerCluster) {
      this.markerCluster.clearMarkers();
    }

    const locations = this.props.events
        .map(event => event.location ?
          {
            lat: event.location.location.latitude,
            lng: event.location.location.longitude,
            title: event.title,
            browser_url: event.browser_url,
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
        content: `<span style='color: #000'><a href="${location.browser_url}">${location.title}</a></span>`,
      });
      window.google.maps.event.addListener(marker, 'click', function() {
        infoWindow.open(this.map, marker);
      });

      return marker;
    });

    // Add a marker clusterer to manage the markers.
    this.markerCluster = new window.MarkerClusterer(this.map, markers,
        {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
  }

  render() {
    return (
      <div className={this.props.className}>
        <div id="map" style={{ width: '100%', height: '100%' }} />
        <script src="https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js" />
        <script src="https://maps.googleapis.com/maps/api/js?key=INSERT_API_KEY_HERE&callback=initMap" />
      </div>
    );
  }
}