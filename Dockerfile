FROM openjdk:8-jre
ENV APP_DIR=/home/etl/
RUN addgroup --gid 1000 etl \
&& adduser --quiet --uid 1000 --gid 1000 --shell /bin/bash --home=$APP_DIR --gecos "" --disabled-password etl
USER etl
COPY . $APP_DIR
CMD $APP_DIR/bin/job foo
