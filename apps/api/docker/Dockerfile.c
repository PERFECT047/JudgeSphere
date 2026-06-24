FROM gcc:13-bookworm AS base

RUN groupadd -r judge && useradd -r -g judge -m -d /home/judge judge

COPY run.sh /home/judge/run.sh
RUN chown judge:judge /home/judge/run.sh && chmod +x /home/judge/run.sh

USER judge
WORKDIR /home/judge

ENTRYPOINT ["/home/judge/run.sh"]