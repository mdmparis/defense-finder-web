locals {
  api = {
    rate_limit             = 5  // req/s
    burst_limit            = 10 // req/s
    log_retention_days     = 30
    lambda_timeout_seconds = 3
  }
  proteins = {
    ttl_days = 1
  }
  results = {
    ttl_days = 1
  }
  handler = {
    timeout_seconds                = 600
    memory_size                    = 10240
    reserved_concurrent_executions = 5
    log_retention_days             = 30
  }
}
