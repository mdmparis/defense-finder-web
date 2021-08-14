# Defense Finder Lambda

A small piece of logic that calls defense finder given a certain protein string, wrapped in an AWS Lambda compliant docker file.

## Dev workflow

``` bash
docker build . -t defense-finder-lambda
docker run -p 9000:8080 defense-finder-lambda
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{"protein": "some heavy amino acids"}'
```
