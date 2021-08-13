resource "aws_api_gateway_rest_api" "df-gateway" {
  body = jsonencode({
    openapi = "3.0.1"
    info = {
      title   = "defense-finder"
      version = "1.0"
    }
    paths = {
      "/protein/{protein}" = {
        put = {
          produces = ["application/json"],
          parameters = [
            {
              name     = "protein",
              in       = "path",
              required = true,
              type     = "string"
            }
          ],
          responses = {
            200 = {
              description = "200 response",
              schema = {
                "$ref" = "#/definitions/Empty"
              }
            }
          },
          x-amazon-apigateway-integration = {
            credentials = "arn:aws:iam::187971905951:role/defense-finder-upload-to-s3",
            httpMethod  = "PUT",
            uri         = "arn:aws:apigateway:eu-west-1:s3:path/df-proteins/{key}",
            responses = {
              default = {
                statusCode = "200"
              }
            },
            requestParameters = {
              "integration.request.path.key" = "method.request.path.protein"
            },
            passthroughBehavior = "when_no_match",
            type                = "aws"
          }
        }
      }
    },
    definitions = {
      Empty = {
        type  = "object",
        title = "Empty Schema"
      }
    },
    x-amazon-apigateway-binary-media-types = ["*.faa"]
  })

  name = "example"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}
