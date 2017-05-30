import Ember from 'ember';
const { Service, inject, computed, observer} = Ember;
import howler from 'npm:howler';
import turf from 'npm:@turf/turf';
// const {Howl} = howler;

export default Service.extend({

  geolocation: inject.service(),

  useGPS: false,
  tracks: [],
  currentLocation: computed.alias('geolocation.currentLocation'),

  speakers: null,
  assets: null,

  location: [0, 0],

  listenerLocation: computed('currentLocation', 'useGPS', 'location', function() {
    if (this.get('useGPS')) {
      return this.get('currentLocation');
    }
    return this.get('location');
  }),

  playlist: computed.sort('availableAssets', 'playlistSortingRules'),
  playlistSortingRules: ['playCount:asc', 'priority:asc', 'distance:asc',],

  availableAssets: computed('nearbyAssets', function() {
    return this.get('nearbyAssets');
  }),

  nearbyAssets: computed('locationPoint', function() {
    let projectAssets = this.get('assets'),
        loc = this.get('locationPoint'),
        listenerBuffer = turf.buffer(loc, 1, 'miles');

    return projectAssets.filter(asset => {
      return turf.inside(asset.get('point'), listenerBuffer);
    });
  }),

  locationPoint: computed('listenerLocation', function() {
      let lp = this.get('listenerLocation').copy();
      lp.reverse();
      return turf.point(lp);
  }),

  activeSources: computed('speakers', 'assets', 'locationPoint', function() {
      let speakers = this.get('speakers'),
          locationPoint = this.get('locationPoint');

      return speakers.filter(speaker => {
        return turf.inside(locationPoint, speaker.get('geom'));
      });
  }),

  playingSources: [],

  mixSources: observer('listenerLocation', function() {
    let loc = this.get('locationPoint'),
        activeSources = this.get('activeSources'),
        playingSources = this.get('playingSources'),
        sound;

    // remove playing sounds not in active sounds
    playingSources.forEach(playingSource => {
      if (activeSources.indexOf(playingSource) === -1) {

        let soundToStop = playingSource.get('howlerSound'),
            soundId = playingSource.get('soundId');

        soundToStop.once('fade', function() {
          soundToStop.pause(soundId);
        });

        soundToStop.fade(soundToStop.volume(soundId), 0, 1000, soundId);
      }
      });

    activeSources.map(source => {

      let
        volume = source.get('volume'),
        soundId = source.get('soundId');

      if (source.get('howlerSound')) {
        sound = source.get('howlerSound');
        if (!sound.playing()) {
          sound.play(soundId);
        }
        else {
          // fade to new volume
          sound.fade(sound.volume(soundId), volume, 1500, soundId);
        }
      }
      else {
        sound = new Howl({
          src: [source.get('uri')],
          // preload: true,
          // html5: true,
          loop: true,
          autoplay: false,

          onload() {
            console.log('Loaded!');
          },

          onvolume() {
            source.set("playingVolume", sound.volume(soundId));
          },

          onfade() {
            console.log('Faded!');
          },

          onplay(soundId) {
            sound.fade(0, volume, 1000, soundId);
            console.log(`Playing ${sound.src}`);
            playingSources.push(source);
          },

          onend() {
            console.log('Finished!');
            playingSources.pop(source);
          },

          onpause() {
            console.log('Paused!');
            playingSources.pop(source);
          },

          onstop() {
            console.log('Stopped!');
            playingSources.pop(source);
          },

          onloaderror() {
            console.log("Couldn't Load Source")
          },

          format: ['mp3',]
        });

        sound.once('load', function() {
          sound.volume(0);
          sound.play();
        });

        source.set('howlerSound', sound);
      }
    })
  })
});
