import DS from 'ember-data';
const { attr } = DS;
import Ember from 'ember';
import turf from 'npm:@turf/turf';

export default DS.Model.extend({

  // asset geom is stored with lat/long points
  // the radius of the asset is defined in the project
  //
  description: attr(),
  latitude: attr('number'),
  longitude: attr('number'),
  filename: attr(),
  file: attr(),
  volume: attr(),
  submitted: attr('boolean'),
  created: attr('date'),
  weight: attr('number'),
  loc_caption: attr(),
  project: attr(),
  language: attr(),
  loc_description: attr(),
  loc_alt_text: attr(),
  media_type: attr(),
  audio_length_in_seconds: attr(),
  tag_ids: attr(),
  session_id: attr(),

  //
  playCount: 0,

  point: Ember.computed('latitude', 'longitude', function() {
    return turf.point([this.get('latitude'), this.get('longitude')]);
  }),

  distance: Ember.computed('point', 'geoAudioMixing.locationPoint', function() {
    return turf.distance(this.get('point'), this.get('geoAudioMixing.locationPoint'), 'meters');
  })
});
