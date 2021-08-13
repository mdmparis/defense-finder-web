resource "aws_lambda_function" "protein_handler_lambda" {
  function_name = "protein_handler"
  role          = aws_iam_role.protein_handler_role.arn
  image_uri     = "public.ecr.aws/j8j2r4q6/mdmparis/defense-finder"
  package_type  = "Image"
}

resource "aws_iam_role" "protein_handler_role" {
  name = "protein_handler"

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

resource "aws_iam_role_policy_attachment" "upload_to_results_policy_attachment" {
  role       = aws_iam_role.protein_handler_role.name
  policy_arn = aws_iam_policy.upload_to_results_policy.arn
}
