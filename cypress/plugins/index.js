/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
const { lighthouse, pa11y, prepareAudit } = require("cypress-audit");
const { JwtCreation } = require("@jc21/cypress-jwt-creation");

module.exports = (on, config) => {
  require('@cypress/code-coverage/task')(on, config)
  on("before:browser:launch", (browser = {}, launchOptions) => {
    prepareAudit(launchOptions);
  });
  on("task", JwtCreation(config));
  on("task", {
    lighthouse: lighthouse(), // calling the function is important
    pa11y: pa11y(), // calling the function is important
  });
  return config;
};
