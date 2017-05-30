import Ember from 'ember';
import turf from 'npm:@turf/turf';

export default Ember.Component.extend({

  geolocation: Ember.inject.service(),
  geoAudioMixing: Ember.inject.service(),

  tagName: "",
  lat: 38,
  lng: -122,
  zoom: 7,
  tileSource: "https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZWxldmFuIiwiYSI6ImM0akE0cU0ifQ.qHJlb8uJetbIzukKLdk4BQ",
  assets: null,
  speakers: null,

  featureBBox: Ember.computed('assets', 'speakers', function() {
    let speakers = this.get('speakers'),
        assets = this.get('assets'),
        features = [];

        assets.forEach(asset => {
          features.push(turf.point([asset.get('latitude'), asset.get('longitude')]))
        });
        speakers.forEach(speaker => {
          features.push(turf.feature(speaker.get('shape')));
        });

    return turf.bbox(turf.featureCollection(features));
  }),

  bounds: Ember.computed('featureBBox', function() {
    let bbox = this.get('featureBBox');
    return [[bbox[1], bbox[0]], [bbox[3], bbox[2]]]
  }),

  actions: {
    updateListenerLocation(e) {
      let location = e.target.getLatLng(),
          mixer = this.get('geoAudioMixing');

      Ember.setProperties(mixer, {
        location: [location.lat, location.lng]
      });
    }
  }
});
