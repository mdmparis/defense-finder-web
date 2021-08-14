FROM ubuntu
ARG FUNCTION_DIR="/home/app/"
ARG PYTHON_VERSION="3.8"

RUN mkdir -p ${FUNCTION_DIR}
WORKDIR ${FUNCTION_DIR}

# Install python
RUN apt update && apt install -y software-properties-common
RUN add-apt-repository ppa:deadsnakes/ppa -y
RUN apt install -y python${PYTHON_VERSION}
RUN apt install -y python3-pip

# Install aws lambda runtime
RUN python3 -m pip install awslambdaric --target ${FUNCTION_DIR}
ADD https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie /usr/bin/aws-lambda-rie
COPY entry.sh /
RUN chmod 755 /usr/bin/aws-lambda-rie /entry.sh

# Install awscli
RUN apt update && apt install -y curl unzip
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" -s
RUN unzip -q awscliv2.zip
RUN ./aws/install

# Install hmmer
RUN apt-get install hmmer -y

# Install python dependencies
COPY requirements.txt .
RUN  pip3 install -r requirements.txt

# Copy handler function
COPY  app.py  ${FUNCTION_DIR}

# Update models
RUN defense-finder update

ENTRYPOINT [ "/entry.sh" ]
CMD ["app.handler"]
