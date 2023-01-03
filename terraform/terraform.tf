terraform {
  required_version = ">= 1.0"

  backend "s3" {
    role_arn = "arn:aws:iam::760097843905:role/platform-developer"

    bucket         = "wellcomecollection-platform-infra"
    key            = "terraform/platform-infrastructure/elasticsearch-log-forwarder.tfstate"
    dynamodb_table = "terraform-locktable"
    region         = "eu-west-1"
  }
}

provider "aws" {
  region = "eu-west-1"

  default_tags {
    tags = {
      TerraformConfigurationURL = "https://github.com/wellcomecollection/elasticsearch-log-forwarder/tree/main/terraform"
    }
  }

  assume_role {
    role_arn = "arn:aws:iam::760097843905:role/platform-developer"
  }
}

data "terraform_remote_state" "platform_shared" {
  backend = "s3"

  config = {
    role_arn = "arn:aws:iam::760097843905:role/platform-read_only"
    bucket         = "wellcomecollection-platform-infra"
    key            = "terraform/platform-infrastructure/shared.tfstate"
    region         = "eu-west-1"
  }
}

data "terraform_remote_state" "catalogue_account" {
  backend = "s3"

  config = {
    role_arn = "arn:aws:iam::760097843905:role/platform-read_only"

    bucket = "wellcomecollection-platform-infra"
    key    = "terraform/platform-infrastructure/accounts/catalogue.tfstate"
    region = "eu-west-1"
  }
}

