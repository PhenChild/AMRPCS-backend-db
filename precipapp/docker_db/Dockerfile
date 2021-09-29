FROM postgres:12.7
ENV LANG C.UTF-8
ENV TZ=America/Guayaquil
RUN apt update && apt install postgis -y postgresql-12-postgis-3 
COPY ./script/init.sql /docker-entrypoint-initdb.d
