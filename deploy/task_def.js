const ZENDESK_TOKEN = process.env.ZENDESK_TOKEN
const USERNAME = process.env.USERNAME
const REMOTE_URI = process.env.REMOTE_URI
const PG_HOST = process.env.PG_HOST
const PG_USER = process.env.PG_USER
const PG_PASSWORD = process.env.PG_PASSWORD
const PG_NAME = process.env.PG_NAME
const DIALECT = process.env.DIALECT
const ZEN_HOST = process.env.ZEN_HOST
const CIRCLE_BUILD_NUM = process.env.CIRCLE_BUILD_NUM
const COOKIE_PASSWORD = process.env.COOKIE_PASSWORD
const BELL_PASSWORD = process.env.BELL_PASSWORD
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

console.log(`{
  "containerDefinitions": [
    {
      "memory": 900,
      "name": "zen-tractor-app-container",
      "portMappings": [
        {
          "containerPort": 4000,
          "hostPort": 4000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "ZENDESK_TOKEN",
          "value": "${ZENDESK_TOKEN}"
        },
        {
          "name": "USERNAME",
          "value": "${USERNAME}"
        },
        {
          "name": "REMOTE_URI",
          "value": "${REMOTE_URI}"
        },
        {
          "name": "PG_USER",
          "value": "${PG_USER}"
        },
        {
          "name": "PG_PASSWORD",
          "value": "${PG_PASSWORD}"
        },
        {
          "name": "PG_NAME",
          "value": "${PG_NAME}"
        },
        {
          "name": "PG_HOST",
          "value": "${PG_HOST}"
        },
        {
          "name": "DIALECT",
          "value": "${DIALECT}"
        },
        {
          "name": "ZEN_HOST",
          "value": "${ZEN_HOST}"
        },
        {
          "name": "COOKIE_PASSWORD",
          "value": "${COOKIE_PASSWORD}"
        },
        {
          "name": "BELL_PASSWORD",
          "value": "${BELL_PASSWORD}"
        },
        {
          "name": "GOOGLE_CLIENT_ID",
          "value": "${GOOGLE_CLIENT_ID}"
        },
        {
          "name": "GOOGLE_CLIENT_SECRET",
          "value": "${GOOGLE_CLIENT_SECRET}"
        }
      ],
      "image": "REMOVED_IMAGE_NAME:build-${CIRCLE_BUILD_NUM}",
      "cpu": 0
    }
  ],
  "family": "zen-tractor-task-def"
}`)
