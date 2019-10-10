import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import Button from '@material-ui/core/Button';
import { defineMessages, F, FormattedDate, injectIntl } from '../../shared/i18n';
import React, { PureComponent } from 'react';
import styles from './Event.module.css';

const messages = defineMessages({
  img: { msg: 'featured image' },
});

class Event extends PureComponent {
  render() {
    const { event } = this.props;
    const imageAriaLabel = this.props.intl.formatMessage(messages.img);

    return(
      <a href={event.browser_url} className={styles.event} style={{backgroundImage: `url(${event.featured_image_url})`}}>
        {event.featured_image_url ? <img src={event.featured_image_url} alt={imageAriaLabel} /> : null}
        <span>
          <span className={styles.eventType}>{event.event_type.replace(/_/, ' ')}</span>
          <h2>{event.title}</h2>
          { event.location?.address_lines ? <span className={styles.address}>{event.location.address_lines.join('\n')}</span> : null}
          <span className={styles.timeslots}>
            <F
              msg="{count, plural, =0 {no times} one {{startTime}} other {# times between {start} — {end}}}"
              values={{
                count: event.timeslots.length,
                start: <FormattedDate value={event.timeslots[0].start_date * 1000} month="long" day="2-digit" />,
                startTime: <FormattedDate value={event.timeslots[0].start_date * 1000}
                  month="long" day="2-digit" day="2-digit" hour="2-digit" minute="2-digit" />,
                end: <FormattedDate
                  value={event.timeslots[event.timeslots.length - 1].end_date * 1000} month="long" day="2-digit" />,
              }}
            />
          </span>

          <Button>
            <F msg="Sign up" />
            &nbsp;
            <ArrowForwardIcon />
          </Button>
        </span>
        <span className={styles.clear} />
      </a>
    );
  }
}

export default injectIntl(Event);