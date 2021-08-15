FROM python:3.8-slim AS builder
ARG FUNCTION_DIR="/home/app/"

## Build dependencies
RUN apt update && apt install -y wget build-essential

## Install hmmer from source
RUN wget http://eddylab.org/software/hmmer/hmmer.tar.gz   \
  && tar zxf hmmer.tar.gz  \
  && cd hmmer-3.3.2/ \
  && ./configure  \
  && make  \
  && make install  \
  && cd easel \
  && make install

# Install lambdaric
RUN mkdir -p ${FUNCTION_DIR}
COPY app.py  ${FUNCTION_DIR}
RUN pip install  --target ${FUNCTION_DIR} awslambdaric

# macsyfinder
COPY requirements.txt .
RUN python -m pip install pip==20.2.1 && \
  pip install -r requirements.txt

FROM python:3.8-slim
ARG FUNCTION_DIR="/home/app/"
RUN mkdir -p ${FUNCTION_DIR}
WORKDIR ${FUNCTION_DIR}

# get all binaries and dependencies from build stage
COPY --from=builder /usr/local /usr/local
# get lambdaric from build stage
COPY --from=builder ${FUNCTION_DIR} ${FUNCTION_DIR}

# Install aws lambda runtime
COPY entry.sh /
ADD https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie /usr/bin/aws-lambda-rie
RUN chmod 755 /usr/bin/aws-lambda-rie /entry.sh && \
  macsydata install --org mdmparis defense-finder-models

ENTRYPOINT [ "/entry.sh" ]
CMD ["app.handler"]
