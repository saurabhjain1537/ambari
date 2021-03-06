/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

var App = require('app');

module.exports = {
  installHostComponent: function(hostName, component) {
    var self = this;
    var componentName = component.get('componentName');
    var displayName = component.get('displayName');
    App.ajax.send({
      name: 'host.host_component.add_new_component',
      sender: self,
      data: {
        hostName: hostName,
        component: component,
        data: JSON.stringify({
          RequestInfo: {
            "context": Em.I18n.t('requestInfo.installHostComponent') + " " + displayName
          },
          Body: {
            host_components: [
              {
                HostRoles: {
                  component_name: componentName
                }
              }
            ]
          }
        })
      },
      success: 'addNewComponentSuccessCallback',
      error: 'ajaxErrorCallback'
    });
  },

  /**
   * Success callback for add host component request
   * @param {object} data
   * @param {object} opt
   * @param {object} params
   * @method addNewComponentSuccessCallback
   */
  addNewComponentSuccessCallback: function (data, opt, params) {
    console.log('Send request for ADDING NEW COMPONENT successfully');
    App.ajax.send({
      name: 'common.host.host_component.update',
      sender: App.router.get('mainHostDetailsController'),
      data: {
        hostName: params.hostName,
        componentName: params.component.get('componentName'),
        serviceName: params.component.get('serviceName'),
        component: params.component,
        "context": Em.I18n.t('requestInfo.installNewHostComponent') + " " + params.component.get('displayName'),
        HostRoles: {
          state: 'INSTALLED'
        },
        urlParams: "HostRoles/state=INIT"
      },
      success: 'installNewComponentSuccessCallback',
      error: 'ajaxErrorCallback'
    });
  },

  /**
   * Default error-callback for ajax-requests in current page
   * @param {object} request
   * @param {object} ajaxOptions
   * @param {string} error
   * @param {object} opt
   * @param {object} params
   * @method ajaxErrorCallback
   */
  ajaxErrorCallback: function (request, ajaxOptions, error, opt, params) {
    console.log('error on change component host status');
    App.ajax.defaultErrorHandler(request, opt.url, opt.method);
  },

  downloadClientConfigs: function (data) {
    var isForHost = typeof data.hostName !== 'undefined';
    var url = App.get('apiPrefix') + '/clusters/' + App.router.getClusterName() + '/' +
      (isForHost ? 'hosts/' + data.hostName + '/host_components/' : 'services/' + data.serviceName + '/components/') +
      data.componentName + '?format=client_config_tar';
    try {
      var self = this;
      $.fileDownload(url).fail(function (error) {
        var errorMessage = '';
        var isNoConfigs = false;
        if (error && $(error).text()) {
          var errorObj = JSON.parse($(error).text());
          if (errorObj && errorObj.message && errorObj.status) {
            isNoConfigs = errorObj.message.indexOf(Em.I18n.t('services.service.actions.downloadClientConfigs.fail.noConfigFile')) !== -1;
            errorMessage += isNoConfigs ? Em.I18n.t('services.service.actions.downloadClientConfigs.fail.noConfigFile') :
              Em.I18n.t('services.service.actions.downloadClientConfigs.fail.popup.body.errorMessage').format(data.displayName, errorObj.status, errorObj.message);
          } else {
            errorMessage += Em.I18n.t('services.service.actions.downloadClientConfigs.fail.popup.body.noErrorMessage').format(data.displayName);
          }
          errorMessage += isNoConfigs ? '' : Em.I18n.t('services.service.actions.downloadClientConfigs.fail.popup.body.question');
        } else {
          errorMessage += Em.I18n.t('services.service.actions.downloadClientConfigs.fail.popup.body.noErrorMessage').format(data.displayName) +
            Em.I18n.t('services.service.actions.downloadClientConfigs.fail.popup.body.question');
        }
        App.ModalPopup.show({
          header: Em.I18n.t('services.service.actions.downloadClientConfigs.fail.popup.header').format(data.displayName),
          bodyClass: Ember.View.extend({
            template: Em.Handlebars.compile(errorMessage)
          }),
          secondary: isNoConfigs ? false : Em.I18n.t('common.cancel'),
          onPrimary: function () {
            this.hide();
            if (!isNoConfigs) {
              self.downloadClientConfigs({
                context: Em.Object.create(data)
              })
            }
          }
        });
      });
    } catch (err) {
      var newWindow = window.open(url);
      newWindow.focus();
    }
  }

};