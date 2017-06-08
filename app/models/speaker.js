import DS from 'ember-data';
import Ember from 'ember';
import turf from 'npm:@turf/turf';

const {attr, Model} = DS;

export default Model.extend({

  active: attr('boolean'),
  code: attr(),
  maxvolume: attr('number'),
  minvolume: attr('number'),
  uri: attr("string"),
  backupuri: attr("string"),
  shape: attr(),
  boundary: attr(),
  attenuation_distance: attr("number"),
  attenuation_border: attr(),
  project_id: attr(),

  mixer: Ember.inject.service('geoAudioMixing'),

  geom: Ember.computed('shape', function() {
    return turf.multiPolygon(this.get('shape.coordinates'));
  }),

  boundaryLine: Ember.computed('geom', function() {
    let geom = this.get("geom");
    return turf.polygonToLineString(geom);
  }),

  attenuationBorder: Ember.computed('boundaryLine', function() {
     let geom = this.get('geom');
     return turf.buffer(geom, this.get('attenuation_distance') * -1, 'meters')
  }),

  distanceFromPoint(point) {
    let coords = point;

    let closestPoints = this.get('boundaryLine.features').map(boundaryLine => {
      return turf.pointOnLine(boundaryLine, coords);
    });

    let closestPoint = turf.nearest(coords, turf.featureCollection(closestPoints));

    return turf.distance(closestPoint, coords);
  },

  attenuationPct: null,
  _howlerSound: null,

  howlerSound: Ember.computed(function() {
    return window.Howler._howls.filter(howl => {
      return howl.sourceObject === `speaker:${this.get('id')}`
    }).get('firstObject');
  }),

  soundId: null,
  playingVolume: null,

  volume: Ember.computed('attenuation', 'minvolume', 'maxvolume', function() {

    let min = this.get('minvolume'),
        max = this.get('maxvolume'),
        range = max - min,
        pct_attenuated = this.get('attenuation');
    return max - (pct_attenuated * range);

  }),

  isActive: Ember.computed('shape', 'mixer.locationPoint', function() {
    return turf.inside(this.get('mixer.locationPoint'), this.get('geom'));
  }),

  isAttenuated: Ember.computed('shape', 'attenuationBorder', 'mixer.locationPoint', function() {
    return this.get('isActive') && !(turf.inside(this.get('mixer.locationPoint'), this.get('attenuationBorder.geometry')))
  }),

  distance: Ember.computed('shape', 'mixer.locationPoint', function() {
    let coords = this.get('mixer.locationPoint'),
        boundary = this.get('boundaryLine'),

        closestPoints = boundary.features.map(boundaryLine => {
          return turf.pointOnLine(boundaryLine, coords);
        }),
        closestPoint = turf.nearest(coords, turf.featureCollection(closestPoints));

    return turf.distance(closestPoint, coords);
  }),

  attenuation: Ember.computed('shape', 'mixer.locationPoint', function() {

    if (!this.get('isAttenuated')) {
      return 0;
    }

    let distance = this.get('distance'),
        attenuation_dist = this.get('attenuation_distance');

    if (distance > 0) {
      return (attenuation_dist - distance * 1000) / attenuation_dist;
    }
    return 0;
  })
});
