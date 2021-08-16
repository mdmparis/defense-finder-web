resource "aws_api_gateway_rest_api" "df-gateway" {
  name = "df-gateway"

  endpoint_configuration {
    types = ["EDGE"]
  }
}

resource "aws_api_gateway_deployment" "df-gateway-deployment" {
  rest_api_id = aws_api_gateway_rest_api.df-gateway.id

  triggers = {
    redeployment = filesha1("./protein_resource.tf")
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
