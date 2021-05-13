FROM ghcr.io/linuxserver/baseimage-alpine:3.12

LABEL maintainer="NitriKx"

RUN \
 echo "**** install build packages ****" && \
 apk add --no-cache --virtual=build-dependencies \
	curl \
	nodejs-npm && \
 echo "**** install runtime packages ****" && \
 apk add --no-cache \
	findutils \
	nodejs-current \
	sudo && \
 npm config set unsafe-perm true && \
 echo "**** install ombi-senscritique ****"

COPY dist/ /app/ombi-senscritique/

RUN ln -s /config/data /app/ombi-senscritique/data && \
 echo "**** install node modules ****" && \
 npm ci --prefix /app/ombi-senscritique && \
 echo "**** cleanup ****" && \
 apk del --purge build-dependencies && \
 rm -rf /root /tmp/* && \
 mkdir -p /root

# add local files
COPY root/ /

# ports
EXPOSE 3582

VOLUME /config