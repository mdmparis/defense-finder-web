# Create API
resource "aws_apigatewayv2_api" "df-api" {
  name          = "df-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["*"]
  }
}

# Add default stage with autodeploy
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.df-api.id
  name        = "$default"
  auto_deploy = true
}

# create default route
resource "aws_apigatewayv2_route" "default" {
  api_id             = aws_apigatewayv2_api.df-api.id
  route_key          = "$default"
  authorization_type = "NONE"
  target             = "integrations/${aws_apigatewayv2_integration.default.id}"
}

# Create role for lambda
resource "aws_iam_role" "api_lambda" {
  name = "api_lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "upload_to_proteins_policy_attachment" {
  role       = aws_iam_role.api_lambda.name
  policy_arn = aws_iam_policy.upload_to_proteins_policy.arn
}

resource "aws_iam_role_policy_attachment" "read_proteins_policy_attachment" {
  role       = aws_iam_role.api_lambda.name
  policy_arn = aws_iam_policy.read_proteins_policy.arn
}

# define main lambda
resource "aws_lambda_function" "mainv2" {
  filename      = data.archive_file.mainv2.output_path
  function_name = "df-http-api-handler"
  handler       = "handler"
  role          = aws_iam_role.api_lambda.arn
  runtime       = "nodejs12.x"
  source_code_hash = data.archive_file.mainv2.output_base64sha256
}

data "archive_file" "mainv2" {
  output_path = "./api/main.zip"
  source_file = "./api/api.js"
  type        = "zip"
}

resource "aws_apigatewayv2_integration" "default" {
  api_id                 = aws_apigatewayv2_api.df-api.id
  integration_method     = "POST"
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.mainv2.invoke_arn
  payload_format_version = "2.0"
}
