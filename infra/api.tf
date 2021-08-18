locals {
  function_name = "df-http-api-handler"
}
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
data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}
resource "aws_iam_role" "api_lambda" {
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
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
  filename         = data.archive_file.mainv2.output_path
  function_name    = local.function_name
  handler          = "handler"
  role             = aws_iam_role.api_lambda.arn
  runtime          = "nodejs12.x"
  source_code_hash = data.archive_file.mainv2.output_base64sha256
}

resource "aws_apigatewayv2_integration" "default" {
  api_id                 = aws_apigatewayv2_api.df-api.id
  integration_method     = "POST"
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.mainv2.invoke_arn
  payload_format_version = "2.0"
}

## Logging: create group with 30 days retention, THEN create the lambda, and allow it to publish
resource "aws_cloudwatch_log_group" "api_lambda" {
  name              = "/aws/lambda/${local.function_name}"
  retention_in_days = 30
}
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  depends_on = [aws_cloudwatch_log_group.api_lambda] // ensure that the log group exists before the role can be exported and used
  role       = aws_iam_role.api_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Install js dependencies
resource "null_resource" "lambda_dependencies" {
  provisioner "local-exec" {
    command = <<-EOF
      cd ${path.module}/.. &&\
      mkdir ./node_install &&\
      cd ./node_install &&\
      curl https://nodejs.org/dist/latest-v10.x/node-v10.19.0-linux-x64.tar.gz | tar xz --strip-components=1 &&\
      export PATH="$PWD/bin:$PATH" &&\
      cd ../${path.module}/api &&\
      npm install &&\
      npm run build
    EOF
  }

  triggers = {
    index   = sha256(file("${path.module}/api/api.js"))
    package = sha256(file("${path.module}/api/package.json"))
    lock    = sha256(file("${path.module}/api/package-lock.json"))
    node    = sha256(join("", fileset(path.module, "api/**/*.js")))
  }
}

data "null_data_source" "wait_for_lambda_exporter" {
  inputs = {
    lambda_dependency_id = "${null_resource.lambda_dependencies.id}"
    source_dir           = "${path.module}/api/"
  }
}

data "archive_file" "mainv2" {
  output_path = "./api/main.zip"
  source_dir  = data.null_data_source.wait_for_lambda_exporter.outputs["source_dir"]
  type        = "zip"
}

