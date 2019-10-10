import fetch from 'node-fetch';

export default {
  Query: {
    allPublicEvents: async (parent, args, { models }) => {
      try {
        // TODO(mime): obviously, this needs caching of some sort. Would need a dataloader in the real world.
        const response = await fetch('https://api.mobilize.us/v1/events');
        const json = await response.json();
        const data = json.data;

        return data;
      } catch (ex) {
        return [];
      }
    },
  },
};
