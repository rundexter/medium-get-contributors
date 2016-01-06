var util = require('./util.js');
var request = require('request').defaults({
    baseUrl: 'https://api.medium.com/'
});

var pickInputs = {
       'publicationId': { key: 'publicationId', validate: {req: true} }
    }, pickOutputs = {
        'publicationId': { keyName: 'data', fields: ['publicationId'] },
        'userId': { keyName: 'data', fields: ['userId'] },
        'role': { keyName: 'data', fields: ['role'] }
    };

module.exports = {

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var inputs = util.pickInputs(step, pickInputs),
            validationErrors = util.checkValidateErrors(inputs, pickInputs),
            token = dexter.environment('medium_access_token');

        if (!token)
            return this.fail('A [medium_access_token] environment variable is required for this module');

        if (validationErrors)
            return this.fail(validationErrors);

        request.get({
            uri: '/v1/publications/' + inputs.publicationId + '/contributors',
            auth: { bearer: token },
            json: true
        }, function (error, response, body) {
            if (error)
                this.fail(error);
            else
                this.complete(util.pickOutputs(body, pickOutputs));
        }.bind(this));
    }
};
