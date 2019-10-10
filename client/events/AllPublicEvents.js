import Event from './Event';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import Map from './Map';
import React, { PureComponent } from 'react';
import styles from './AllPublicEvents.module.css';

// This is an Apollo/GraphQL decorator for the Home component which passes the query result to the props.
// It's a more complex example that lets you grab the props value of the component you're looking at.
@graphql(
  gql`
    query AllPublicEvents {
      allPublicEvents {
        id
        description
        timezone
        title
        summary
        featured_image_url
        timeslots {
          id
          start_date
          end_date
        }
        location {
          venue
          address_lines
          locality
          region
          postal_code
          location {
            latitude
            longitude
          }
          congressional_district_value
          state_leg_district_value
          state_senate_district_value
        }
        event_type
        created_date
        modified_date
        browser_url
      }
    }
  `,
  {
    options: ({ match: { url } }) => ({
      variables: {
        str: url,
      },
    }),
  }
)
class AllPublicEvents extends PureComponent {
  render() {
    if (this.props.data.loading) {
      return null;
    }

    return (
      <article className={styles.eventsAndMap}>
        <ul className={styles.events}>
          {this.props.data.allPublicEvents.map(event => (
            <li key={event.id}><Event event={event} /></li>
          ))}
        </ul>
        <Map className={styles.map} events={this.props.data.allPublicEvents} />
      </article>
    );
  }
}

export default AllPublicEvents;
