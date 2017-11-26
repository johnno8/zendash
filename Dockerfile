FROM node:6.9.1

RUN mkdir /zendesk_metrics_extractor/

WORKDIR /zendesk_metrics_extractor/

ADD . /zendesk_metrics_extractor/

RUN npm install

EXPOSE 4000

CMD ["npm","start"]