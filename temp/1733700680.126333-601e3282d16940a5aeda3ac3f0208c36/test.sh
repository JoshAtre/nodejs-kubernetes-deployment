#!/bin/bash

# Test locally
# token=`curl -X POST -H "Authorization: Basic dGVzdHVzZXI6cGFzc3dvcmQ=" localhost:3000/login | jq -r '.token'`
# curl -v -H "Authorization: Bearer $token" localhost:8080/secure

# Test LB in GCP
token=`curl -X POST -H "Authorization: Basic dGVzdHVzZXI6cGFzc3dvcmQ=" -H "Content-Length: 0" http://34.107.170.82/login -s | jq -r '.token'`
curl -H "Authorization: Bearer $token" http://34.107.170.82/secure
