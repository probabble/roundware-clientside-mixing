import DS from 'ember-data';
const {attr} = DS;
export default DS.Model.extend({
  name: attr(),
  latitude: attr(),
  longitude: attr(),
  pub_date: attr('date'),
  languages: attr(),
  audio_format: attr('string'),
  auto_submit: attr('boolean'),
  max_recording_length: attr('number'),
  listen_questions_dynamic: attr('boolean'),
  speak_questions_dynamic: attr('boolean'),
  sharing_url: attr('string'),
  sharing_message_loc: attr(),
  out_of_range_message_loc: attr(),
  out_of_range_url: attr('string'),
  recording_radius: attr('number'),
  listen_enabled: attr('boolean'),
  geo_listen_enabled: attr('boolean'),
  speak_enabled: attr('boolean'),
  geo_speak_enabled: attr('boolean'),
  reset_tag_defaults_on_startup: attr('boolean'),
  timed_asset_priority: attr('boolean'),
  legal_agreement_loc:  attr(),
  repeat_mode: attr('string'),
  files_url: attr('string'),
  files_version: attr('string'),
  audio_stream_bitrate: attr('string'),

  ordering: attr('string'),

  demo_stream_enabled: attr('boolean'),
  demo_stream_url: attr('string'),
  demo_stream_message_loc: attr(),

  out_of_range_distance: attr('number')
});
