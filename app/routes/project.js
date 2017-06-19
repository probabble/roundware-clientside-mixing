import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model(params) {
    return Ember.RSVP.hash({
      project: this.store.findRecord('project', params.project_id),
      assets: this.store.query('asset', {project_id: params.project_id}),
      speakers: this.store.query('speaker', {project_id: params.project_id})
    });
  }
});
