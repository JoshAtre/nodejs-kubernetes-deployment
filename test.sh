#!/bin/bash
token=`curl -X POST -H "Authorization: Basic dGVzdHVzZXI6cGFzc3dvcmQ=" localhost:3000/login | jq -r '.token'`
curl -v -H "Authorization: Bearer $token" localhost:8080/secure
