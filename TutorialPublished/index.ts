import { EmailClient } from '@azure/communication-email';
import { CosmosClient, Resource } from '@azure/cosmos';
import { AzureFunction, Context } from '@azure/functions';
import * as dotenv from 'dotenv';

dotenv.config();

interface Tutorial {
  title: string;
  description: string;
}

const emailClient = new EmailClient(
  process.env.COMMUNICATION_SERVICE_CONN_STRING,
);
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_PRIMARY_KEY,
});
const container = cosmosClient.database('tutorials').container('subscribers');

const eventGridTrigger: AzureFunction = async function (
  context: Context,
  eventGridEvent: any,
): Promise<void> {
  const { resources } = await container.items.readAll().fetchAll();

  const recipients = resources.map((item: { email: string } & Resource) => {
    return { address: item.email };
  });
  const tutorial = eventGridEvent.data as Tutorial;
  const message = `Tutorial ${tutorial.title} has been updated. Check it out!`;
  const poller = await emailClient.beginSend({
    senderAddress:
      'donotreply@ee3f88af-8920-46e1-9f2f-e8a1afa2d4bd.azurecomm.net',
    content: { subject: 'Tutorial updated', plainText: message },
    recipients: {
      to: recipients,
    },
  });
  await poller.pollUntilDone();
};

export default eventGridTrigger;
