// https://www.npmjs.com/package/openai
// https://github.com/FrontMatter/web-documentation-nextjs/blob/main/pages/api/ai/title.ts
import dotenv from 'dotenv';
import path from 'path';
import OpenAI from 'openai';

// Specify the path to the user's directory
const userDirectory = process.env.HOME || process.env.USERPROFILE;
const envPath = path.resolve(userDirectory || '', '.env');
const result = dotenv.config({ path: envPath });
const nrOfCharacters = process.env.OPENAI_TITLE_LENGTH;

const title = process.argv[2];

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  try {

    const instruction = `You act as a weblog editor. Suggest engaging blog post titles (5 to 10), with a maximum of ${nrOfCharacters || 60} characters each.

    The desired output format is a simple string. No yapping.

    The content of the blog post is the following:

    ${title}

    `;

    const chatCompletion = await openai.chat.completions.create({
      messages: [{
        role: 'user',
        content: instruction
      }],
      model: 'gpt-3.5-turbo-0125',
    });

    const results = chatCompletion.choices.map((result) => {

      const items = result.message.content;

      if (!items) {
        throw new Error("Input string is null or undefined.");
      }

      console.log(items);

      try {
        const lines = items.split('\n');
        // Map each line to extract the title, removing the numbering and extra quotes
        // const titles = lines.map(line => {
        //   // Use a regular expression to match the title within quotes
        //   const match = line.match(/"\s*(.*)\s*"/);
        //   return match ? match[1] : null; // Return the matched group (title) or null if no match is found
        // }).filter(title => title !== null); // Filter out any null values (in case of no match)

        const titles = lines.map(line => {
          return title.replace(/^"[0-9]*\. (.*)"$/, "$2").trim() || "";
        }).filter(title => title !== null);




        return lines;
      } catch (error) {
        console.error('Error extracting titles:', error);
        return [];
      }

    });

    console.table(results);

  } catch (error) {
    console.error('Error making API request:', error);
  }
}

main();
