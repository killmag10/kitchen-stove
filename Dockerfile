FROM openjdk:8-jre
ENV APP_DIR=/home/etl/

COPY . $APP_DIR
RUN addgroup --gid 1000 etl \
&& adduser --quiet --uid 1000 --gid 100 --shell /bin/bash --home=$APP_DIR --gecos "" --disabled-password etl  \
&& chown -R etl:etl $APP_DIR
USER etl
CMD $APP_DIR/bin/job foo
