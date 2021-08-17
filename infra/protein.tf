resource "aws_s3_bucket" "proteins_bucket" {
  bucket = "df-proteins"
  acl    = "private"
}

resource "aws_iam_policy" "upload_to_proteins_policy" {
  name        = "upload-to-df-proteins"
  path        = "/"
  description = ""

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "",
        Effect   = "Allow",
        Action   = "s3:PutObject",
        Resource = "${aws_s3_bucket.proteins_bucket.arn}/*"
      }
    ]
  })
}

resource "aws_iam_policy" "read_proteins_policy" {
  name        = "read-df-proteins"
  path        = "/"
  description = ""

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "",
        Effect   = "Allow",
        Action   = "s3:GetObject",
        Resource = "${aws_s3_bucket.proteins_bucket.arn}/*"
      }
    ]
  })
}

resource "aws_s3_bucket_notification" "protein_notification" {
  bucket = aws_s3_bucket.proteins_bucket.id

  lambda_function {
    lambda_function_arn = module.lambda_function_container_image.lambda_function_arn
    events              = ["s3:ObjectCreated:*"]
  }
}
