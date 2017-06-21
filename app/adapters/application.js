import DRFAdapter from 'ember-django-adapter/adapters/drf';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import config from '../config/environment';

export default DRFAdapter.extend(DataAdapterMixin, {
  authorizer: 'authorizer:token',

  host: config.APP.API_HOST,
  namespace: 'api/2',
  // addTrailingSlashes: false,

  // use PATCH request to update features instead of the default PUT
  updateRecord(store, type, snapshot) {
      const payload = {'data': {}};
      const changedAttributes = snapshot.changedAttributes();

      Object.keys(changedAttributes).forEach((attributeName) => {
        payload.data[attributeName] = changedAttributes[attributeName][1]
        // Do something with the new value and the payload
        // This will depend on what your server expects for a PATCH request
        // payload[attributeName] = changedAttributes[attributeName][1];
      });

      const id = snapshot.id;
      const url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');

      return this.ajax(url, 'PATCH', payload);
    }
});
