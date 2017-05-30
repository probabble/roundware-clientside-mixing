import DRFAdapter from 'ember-django-adapter/adapters/drf';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import config from '../config/environment';

export default DRFAdapter.extend(DataAdapterMixin, {
  authorizer: 'authorizer:token',

  host: config.APP.API_HOST,
  namespace: 'api/2',
  // addTrailingSlashes: false,

});
