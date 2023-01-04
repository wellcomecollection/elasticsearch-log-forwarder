locals {
  shared_infra   = data.terraform_remote_state.platform_shared.outputs
  catalogue_vpcs = data.terraform_remote_state.catalogue_account.outputs

  data_stream_name              = local.shared_infra["elasticsearch_log_forwarder_data_stream_name"]
  kinesis_stream_arn            = local.shared_infra["elasticsearch_log_forwarder_kinesis_arn"]
  ec_privatelink_sg_id          = local.shared_infra["ec_platform_privatelink_sg_id"]
  developer_vpc_private_subnets = local.catalogue_vpcs["catalogue_vpc_delta_private_subnets"]
  vpc_id                        = local.catalogue_vpcs["catalogue_vpc_delta_id"]
}
