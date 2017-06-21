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

  currentAsset: null,

  readyToPlayNewAsset: computed('currentAsset', function() {
    return !this.get('currentAsset');
  }),

  playlist: computed.sort('availableAssets', 'playlistSortingRules'),

  playlistSortingRules: ['playCount:asc', 'priority:asc', 'distance:asc',],

  playlistControl: observer('readyToPlayNewAsset', 'playlist', function() {
    let playlist = this.get('playlist'),
        mixer = this;

    if (!playlist.length) {
      return
    }

    if (this.get('readyToPlayNewAsset')) {
      let asset = playlist.pop();
      let sound = asset.get('howlerSound');
      mixer.set('currentAsset', asset);

      sound.once('play', function() {
        asset.notifyPropertyChange('howlerSound');
      });

      sound.once('end', function() {
        asset.notifyPropertyChange('howlerSound');
        asset.incrementProperty('playCount');
        mixer.set('currentAsset', null);
      });
      sound.play();
      }
  }),

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
        return turf.inside(locationPoint, speaker.get('shape'));
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
            source.notifyPropertyChange('howlerSound');
          },

          onvolume() {
            source.set("playingVolume", sound.volume(soundId));
            source.notifyPropertyChange('howlerSound');

          },

          onfade() {
            console.log('Faded!');
            source.notifyPropertyChange('howlerSound');

          },

          onplay(soundId) {
            source.set('soundId', soundId);
            sound.fade(0, volume, 1000, soundId);
            console.log(`Playing ${sound.src}`);
            playingSources.push(source);
            source.notifyPropertyChange('howlerSound');
          },

          onend() {
            console.log('Finished!');
            playingSources.pop(source);
            source.notifyPropertyChange('howlerSound');
          },

          onpause() {
            console.log('Paused!');
            playingSources.pop(source);
            source.notifyPropertyChange('howlerSound');
          },

          onstop() {
            console.log('Stopped!');
            playingSources.pop(source);
            source.notifyPropertyChange('howlerSound');
          },

          onloaderror() {
            console.log("Couldn't Load Source");
            source.notifyPropertyChange('howlerSound');
          },

          format: ['mp3',]
        });

        sound.once('load', function() {
          sound.volume(0);
          sound.play();
        });

        Ember.set(sound, 'sourceObject', `speaker:${source.get('id')}`);

      }
    })
  })
});
