resource "aws_api_gateway_resource" "protein-resource" {
  rest_api_id = aws_api_gateway_rest_api.df-gateway.id
  parent_id   = aws_api_gateway_rest_api.df-gateway.root_resource_id
  path_part   = "protein"
}

resource "aws_api_gateway_resource" "protein-id" {
  rest_api_id = aws_api_gateway_rest_api.df-gateway.id
  parent_id   = aws_api_gateway_resource.protein-resource.id
  path_part   = "{protein}"
}

resource "aws_api_gateway_method" "put-protein" {
  rest_api_id   = aws_api_gateway_rest_api.df-gateway.id
  resource_id   = aws_api_gateway_resource.protein-id.id
  http_method   = "PUT"
  authorization = "NONE"
  request_parameters = {
    "method.request.path.protein" = true
  }
}

resource "aws_api_gateway_integration" "protein-s3-put" {
  rest_api_id = aws_api_gateway_rest_api.df-gateway.id
  resource_id = aws_api_gateway_resource.protein-id.id
  http_method = aws_api_gateway_method.put-protein.http_method

  request_parameters = {
    "integration.request.path.key" = "method.request.path.protein"
  }

  type                    = "AWS"
  uri                     = "arn:aws:apigateway:eu-west-3:s3:path/df-proteins/{key}"
  integration_http_method = "PUT"
  passthrough_behavior    = "WHEN_NO_MATCH"
  content_handling        = "CONVERT_TO_BINARY"
}

