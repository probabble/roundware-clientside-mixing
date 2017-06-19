import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
const {RSVP, Route, inject} = Ember;

export default Route.extend(AuthenticatedRouteMixin, {
  session: inject.service(),
  geolocation: inject.service(),
  geoAudioMixing: inject.service(),

  model(params) {
    return RSVP.hash({
      projects: this.store.findAll('project'), // , {session_id: 1}).get('firstObject'),
      assets: this.store.findAll('asset'),
      speakers: this.store.findAll('speaker')
    });
  },

  afterModel(model) {
    let geoAudioService =  this.get('geoAudioMixing');

    geoAudioService.init();
    geoAudioService.set('speakers', model.speakers);
    geoAudioService.set('assets', model.assets);
  },

  actions: {
    trackLocation() {
      this.get('geolocation').trackLocation().then((result) => {
        this.set('geoAudioMixing.useGPS', true);
      });
    }
  }
});
