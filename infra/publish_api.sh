#!/bin/bash

cd api
zip -r api.zip index.js node_modules/*
aws s3 cp api.zip s3://df-api/api.zip
cd ..
