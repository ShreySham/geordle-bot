require('dotenv').config();
const express = require('express');
const getChallengeLink =  require('./geoguessr.js');
const GEOGUESSR_COMMAND = require('./commands.js');
const { 
  VerifyDiscordRequest, 
  DiscordRequest 
} = require('./utils.js');
const {
  InteractionResponseType,
  InteractionType,
} = require('discord-interactions');


class JsonResponse extends Response {
  constructor(body, init) {
    const jsonBody = JSON.stringify(body);
    init = init || {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };
    super(jsonBody, init);
  }
}
// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.get('/', () => {
    return new JsonResponse("Hello World! This bot is live!");
});

app.post('/interactions', async function (request, result) {
  // Interaction type and data
  const { type, id, data } = request.body;
  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return result.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    if (
      data.name.toLowerCase() == GEOGUESSR_COMMAND.name.toLowerCase()
    ) {
      console.log("Handling challenge request");
      result.send({
          type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        });
      const challengeUrl = await getChallengeLink();
      const endpoint = `/webhooks/${process.env.APP_ID}/${request.body.token}`;
      await DiscordRequest(endpoint, 
        {
          method: 'POST',
          body: {
            content: `Here is your geoguessr challenge: ${challengeUrl}`,
          },
        }
      );
      return;
    } else {
      console.error("Unknown Command");
      return new JsonResponse({ error: "Unknown Type" }, { status: 400 });
    }
  }
  console.error("Unknown Type");
  return new JsonResponse({ error: "Unknown Type" }, { status: 400 });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});