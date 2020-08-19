const AWS = require('aws-sdk');
const https = require('https');
const url = require('url');
const WebsiteHelper = require('./website-helper.js');

exports.handler = (event, context, callback) => {
console.log('Received event:', JSON.stringify(event, null, 2));

    let responseStatus = 'FAILED';
    let responseData = {};

    if (event.RequestType === 'Delete') {
            sendResponse(event, callback, context.logStreamName, 'SUCCESS');
    }

    if (event.RequestType === 'Create') {
        if (event.ResourceProperties.customAction === 'configureWebsite') {
            console.log('Starting to copy the files');
            let _websiteHelper = new WebsiteHelper();

            _websiteHelper.copyWebSiteAssets(event.ResourceProperties,
                function(err, data) {
                    if (err) {
                        responseData = {
                            Error: 'Copy of website assets failed'
                        };
                        console.log([responseData.Error, ':\n', err].join(''));
                    } else {
                        responseStatus = 'SUCCESS';
                        responseData = {};
                    }

                    sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                });

        }
        //sendResponse(event, callback, context.logStreamName, 'SUCCESS');
        }
    
    
};

/**
 * Sends a response to the pre-signed S3 URL
 */

let sendResponse = function(event, callback, logStreamName, responseStatus, responseData) {
    const responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: `See the details in CloudWatch Log Stream: ${logStreamName}`,
        PhysicalResourceId: logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData,
    });

    console.log('RESPONSE BODY:\n', responseBody);
    const parsedUrl = url.parse(event.ResponseURL);
    const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: 'PUT',
        headers: {
            'Content-Type': '',
            'Content-Length': responseBody.length,
        }
    };

    const req = https.request(options, (res) => {
        console.log('STATUS:', res.statusCode);
        console.log('HEADERS:', JSON.stringify(res.headers));
        callback(null, 'Successfully sent stack response!');
    });

    req.on('error', (err) => {
        console.log('sendResponse Error:\n', err);
        callback(err);
    });

    req.write(responseBody);
    req.end();
};