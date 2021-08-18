#!/bin/bash

zip -r api.zip api/index.js api/node_modules/*
aws s3 cp api.zip s3://df-api/api.zip
rm api.zip
