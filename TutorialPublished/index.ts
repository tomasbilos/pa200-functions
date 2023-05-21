import { EmailClient } from '@azure/communication-email';
import { AzureFunction, Context } from '@azure/functions';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new EmailClient(process.env.COMMUNICATION_SERVICE_CONN_STRING);

const eventGridTrigger: AzureFunction = async function (
  context: Context,
  eventGridEvent: any,
): Promise<void> {
  const recipients = [];
  const poller = await client.beginSend({
    senderAddress: '',
    content: { subject: 'Tutorial updated', plainText: '' },
    recipients: {
      to: [],
    },
  });
  await poller.pollUntilDone();
};

export default eventGridTrigger;
