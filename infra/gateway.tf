resource "aws_api_gateway_rest_api" "df-gateway" {
  name = "df-gateway"

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
            credentials = aws_iam_role.upload_to_proteins_role.arn,
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
    x-amazon-apigateway-binary-media-types = ["*/*"]
  })

  endpoint_configuration {
    types = ["EDGE"]
  }
}

resource "aws_api_gateway_deployment" "df-gateway-deployment" {
  rest_api_id = aws_api_gateway_rest_api.df-gateway.id

  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.df-gateway.body))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "df-gateway-stage" {
  deployment_id = aws_api_gateway_deployment.df-gateway-deployment.id
  rest_api_id   = aws_api_gateway_rest_api.df-gateway.id
  stage_name    = "v1"
}
