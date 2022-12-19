# KF-BE-TT Outage App

This app retrieves outages from the KF API, filters out any outages that began before a specified date or don't have an ID that is in the list of devices in the site information, and posts the remaining outages for a specific site.

## Prerequisites
- Node.js
- An API key

## Installation
Clone the repository:

    git clone https://github.com/barnesoir/kf-be-tt.git

Install the dependencies:

    npm install

Usage

    npm start YOUR_API_KEY

Testing

    npm t (operates jest with the following flags: --silent --forceExit --detectOpenHandles --runInBand)


The app will output the response from the API when it sends the list of outages to the specified site.

## Configuration

The following constants can be modified in the code:

    SITE_ID: The ID of the site to which the outages will be sent. Currently set to 'norwich-pear-tree'.

    API_KEY: The API key to use for making requests to the API. Currently passed as an argument to the script.

    new Date('2022-01-01T00:00:00.000Z'): The date before which outages will be filtered out. Currently set to January 1, 2022.

Dependencies

- api-wrapper: An internal module containing functions for interacting with the API.
- Jest: A testing framework for JavaScript & TypeScript.
- TS-node: A TypeScript execution environment and REPL for node.js, with source map support.