# geordle-bot
A simple bot that gets a geoguessr challenge when requested.

## Running locally
Clone this repo into a new project directory and run `npm install`.

Then run `npm run dev` to get the nodemon dev server running.

Finally, run `npm run ngrok` to get an endpoint that redirects internet traffic to the dev server.

Paste the ngrok https link into the _interactions endpoint_ field of the discord bot's settings and hit _Save Changes_.