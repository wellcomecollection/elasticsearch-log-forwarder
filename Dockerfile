FROM public.ecr.aws/docker/library/node:18

# Install Terraform (for formatting)
ARG TERRAFORM_VERSION=1.3.6
RUN wget -O /tmp/terraform.zip https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
  unzip -q -o /tmp/terraform.zip -d /usr/local/bin

RUN apt update && apt install git awscli

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . ./

CMD ["true"]
