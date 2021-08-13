resource "aws_s3_bucket" "proteins_bucket" {
  bucket = "df-proteins"
  acl    = "private"
}

resource "aws_iam_role" "upload_to_proteins_role" {
  name = "upload_to_proteins_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_policy" "upload_to_proteins_policy" {
  name        = "upload-to-df-proteins"
  path        = "/"
  description = ""

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "",
        Effect   = "Allow",
        Action   = "s3:PutObject",
        Resource = "${aws_s3_bucket.proteins_bucket.arn}/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "upload_to_proteins_policy_attachment" {
  role       = aws_iam_role.upload_to_proteins_role.name
  policy_arn = aws_iam_policy.upload_to_proteins_policy.arn
}
