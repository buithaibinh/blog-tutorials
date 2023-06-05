FROM jrottenberg/ffmpeg

RUN apt-get update --yes && \
    apt-get install curl unzip --yes && \
    apt-get clean --yes

# Install AWS v2 cli
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf aws

WORKDIR /tmp/workdir

# Copy entrypoint.sh to workdir
COPY entrypoint.sh entrypoint.sh

# make entrypoint.sh executable by default
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]