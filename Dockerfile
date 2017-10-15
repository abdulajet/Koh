FROM node:6-alpine
RUN sed -i -e 's/v3\.4/edge/g' /etc/apk/repositories \
  && apk add --update graphicsmagick \
  && rm -rf /var/cache/apk/*
COPY package.json /usr/src/app/
RUN cd /usr/src/app && npm i
COPY . /usr/src/app
WORKDIR /usr/src/app
CMD [ "npm", "start" ]
