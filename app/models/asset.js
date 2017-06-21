import DS from 'ember-data';
const { attr } = DS;
import Ember from 'ember';
import turf from 'npm:@turf/turf';
import howler from 'npm:howler';

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

  uri: attr(),

  //
  playCount: 0,

  howlerSound: Ember.computed(function() {

    // look up the howler sound from the Howler global
    let sound = howler.Howler._howls.filter(howl => {
      return howl.sourceObject === `asset:${this.get('id')}`
    }).get('firstObject');

    if (!sound) {
      // if it doesn't already exist, return a new Howler sound
      let source = this;
      sound = new howler.Howl({
        src: [source.get('file')],
        // preload: true,
        // html5: true,
        loop: false,
        autoplay: false,

        onload() {
          source.notifyPropertyChange('howlerSound');
        },

        onvolume() {
          source.set("playingVolume", sound.volume(source.get('soundId')));
          source.notifyPropertyChange('howlerSound');
        },

        onfade() {
          source.notifyPropertyChange('howlerSound');
        },

        onplay(soundId) {
          source.set('soundId', soundId);
          source.notifyPropertyChange('howlerSound');
        },

        onend() {
          source.notifyPropertyChange('howlerSound');
        },

        onpause() {
          source.notifyPropertyChange('howlerSound');
        },

        onstop() {
          source.notifyPropertyChange('howlerSound');
        },

        onloaderror() {
          source.notifyPropertyChange('howlerSound');
        },

        format: ['mp3',]
      });
      Ember.set(sound, 'sourceObject', `asset:${source.get('id')}`);
    }
    return sound;
  }),

  point: Ember.computed('latitude', 'longitude', function() {
    return turf.point([this.get('longitude'), this.get('latitude')]);
  }),

  distance: Ember.computed('point', 'geoAudioMixing.locationPoint', function() {
    return turf.distance(this.get('point'), this.get('geoAudioMixing.locationPoint'), 'meters');
  })
});
