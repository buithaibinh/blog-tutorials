import { ApolloServer } from 'apollo-server';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const typeDefs = `
    type Query{
        ask_AQuestion(question:String):String
    }
`;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

const resolvers = {
  Query: {
    ask_AQuestion: async (_, args, context) => {
      const completion = openai.createCompletion({
        model: 'text-davinci-003',
        prompt: args.question,
        max_tokens: 1000
      });

      let theAnswer;
      await completion.then(async (r) => {
        theAnswer = r.data.choices[0].text;
        console.info(r.data.choices[0].text);
      });

      return theAnswer;
    }
  }
};

const PORT = process.env.PORT || 5001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cache: 'bounded',
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    return { token };
  }
});

server.listen({ port: PORT }).then(() => {
  console.log(`🚀  Server ready at http://localhost:${PORT}`);
});
