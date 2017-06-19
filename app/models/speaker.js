import DS from 'ember-data';
import Ember from 'ember';
import turf from 'npm:@turf/turf';

const {attr, Model} = DS;
const {computed, inject} = Ember;

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

  geoJSON: computed('shape', 'active', 'uri', 'backupuri', 'maxvolume', 'minvolume', 'code', 'project_id', {
    get(key) {
      return {
        type: 'Feature',
        properties: {
          active: this.get('active'),
          uri: this.get('uri'),
          backupuri: this.get('backupuri'),
          maxvolume: this.get('maxvolume'),
          minvolume: this.get('minvolume'),
          code: this.get('code'),
          project_id: this.get('project_id')
        },
        geometry: this.get('shape')
      };
    },
    set(key, value) {
      this.set('shape', value.geometry);
    }
  }),

  mixer: inject.service('geoAudioMixing'),

  boundaryLine: computed('shape', function() {
    let geom = this.get("shape");
    return turf.polygonToLineString(geom);
  }),

  attenuationBorder: computed('shape', 'attenuation_distance', function() {
     let geom = this.get('shape');
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

  howlerSound: computed(function() {
    return window.Howler._howls.filter(howl => {
      return howl.sourceObject === `speaker:${this.get('id')}`
    }).get('firstObject');
  }),

  soundId: null,
  playingVolume: null,

  volume: computed('attenuation', 'minvolume', 'maxvolume', function() {

    let min = this.get('minvolume'),
        max = this.get('maxvolume'),
        range = max - min,
        pct_attenuated = this.get('attenuation');
    return max - (pct_attenuated * range);

  }),

  isActive: computed('shape', 'mixer.locationPoint', function() {
    return turf.inside(this.get('mixer.locationPoint'), this.get('shape'));
  }),

  isAttenuated: computed('attenuationBorder', 'mixer.locationPoint', function() {
    return this.get('isActive') && !(turf.inside(this.get('mixer.locationPoint'), this.get('attenuationBorder.geometry')))
  }),

  distance: computed('boundaryLine', 'mixer.locationPoint', function() {
    let coords = this.get('mixer.locationPoint'),
        boundary = this.get('boundaryLine'),

        closestPoints = boundary.features.map(boundaryLine => {
          return turf.pointOnLine(boundaryLine, coords);
        }),
        closestPoint = turf.nearest(coords, turf.featureCollection(closestPoints));

    return turf.distance(closestPoint, coords);
  }),

  attenuation: computed('attenuationBorder', 'mixer.locationPoint', function() {

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
