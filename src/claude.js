import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function labelEmail(labelChoices, email)
{
    const message = await client.messages.create({
        model: 'claude-sonnet-5',
        max_tokens: 300,
        system: getSystemPrompt(labelChoices),
        messages: [
            {
                role: "user",
                content: `Subject: ${email.subject}\n\nBody: ${email.body}`
            }
        ]
    });
    // console.log(email);
    // console.log(message.content[0])
    const block = message.content[0];
    return block.text;
    // return getSystemPrompt(labelChoices);
}

function getSystemPrompt(labelChoices)
{
    const baseMessage = `You are organizing incoming emails to the inbox of an HVAC business owner. Given a subject and body, respond with `;
    let fullMessage = baseMessage;

    for(let i = 0; i < labelChoices.length - 1; i++)
    {
        fullMessage = fullMessage + `"` + labelChoices[i] + `", `;
    }

    fullMessage = fullMessage + `or "` + labelChoices[labelChoices.length - 1] + `"`;
    return fullMessage;
}