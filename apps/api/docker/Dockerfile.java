FROM eclipse-temurin:21-jdk-bookworm AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r judge && useradd -r -g judge -m -d /home/judge judge

USER judge
WORKDIR /home/judge

COPY --chown=judge:judge run.sh /home/judge/run.sh
RUN chmod +x /home/judge/run.sh

ENTRYPOINT ["/home/judge/run.sh"]