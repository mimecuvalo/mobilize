import { gql } from 'apollo-server-express';

// Keep in sync with both models/user.js and migrations/[date]-create-user.js
export default gql`
  type Slot {
    id: ID!
    start_date: Int!
    end_date: Int!
  }

  type Geo {
    latitude: Float
    longitude: Float
  }

  type Location {
    venue: String!
    address_lines: [String!]!
    locality: String!
    region: String!
    postal_code: String!
    location: Geo!
    congressional_district_value: String
    state_leg_district_value: String
    state_senate_district_value: String
  }

  type Event {
    id: ID!
    description: String!
    timezone: String!
    title: String!
    summary: String!
    featured_image_url: String!
    timeslots: [Slot!]!
    location: Location
    event_type: String
    created_date: Int!
    modified_date: Int!
    browser_url: String!

    # Other fields
    # accessibility_notes
    # accessibility_status
    # address_visibility
    # contact
    # created_by_volunteer_host
    # event_campaign
    # high_priority
    # sponsor
    # tags
    # timezone
    # virtual_action_url
    # visibility
  }

  extend type Query {
    allPublicEvents(offset: Int!): [Event]
  }
`;
