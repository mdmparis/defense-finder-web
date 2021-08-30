module "lambda_function_container_image" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "protein_handler_lambda"
  description   = ""

  create_package = false
  publish        = true

  image_uri    = "187971905951.dkr.ecr.eu-west-3.amazonaws.com/mdmparis/defense-finder:2.12"
  package_type = "Image"

  attach_policies    = true
  number_of_policies = 2
  policies = [
    aws_iam_policy.upload_to_results_policy.arn,
    aws_iam_policy.read_proteins_policy.arn
  ]

  allowed_triggers = {
    ProteinsS3 = {
      service    = "s3"
      source_arn = aws_s3_bucket.proteins_bucket.arn
    }
  }

  environment_variables = {
    results_bucket = aws_s3_bucket.results_bucket.id
  }

  timeout                           = local.handler.timeout_seconds
  memory_size                       = local.handler.memory_size
  reserved_concurrent_executions    = local.handler.reserved_concurrent_executions
  cloudwatch_logs_retention_in_days = local.handler.log_retention_days
}
