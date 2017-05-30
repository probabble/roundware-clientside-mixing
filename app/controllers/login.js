import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),

  actions: {
    authenticate() {
      this.set('errorMessage', null);
      let credentials = this.getProperties('identification', 'password'),
        authenticator = 'authenticator:jwt';

      this.get('session').authenticate(authenticator, credentials).then(token => {
        let session = this.get('session');
      }, err => {
        this.set('errorMessage', err.non_field_errors);
      });
    }
  }
});
