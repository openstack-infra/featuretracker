#!/bin/sh

mkdir client/components/sdk
cp ../dashboard-project-api/js/lbServices.js client/components/sdk/
grunt serve
