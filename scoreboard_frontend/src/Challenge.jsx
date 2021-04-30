import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";

import { get_chal_pos } from "./utils.js";

/* This is how they all appear together on the homepage -- see ChallengeModal for the dialog box */

/* XXX: TO REMOVE TAGS: remove them from the tooltip */



function Challenge(props) {
  const { authenticated, id, /*item_index,*/ points, solved, tags } = props;

  let onClick = null;
  let classes = "challenge";
  let classes_chalname = "chalname";
  if (authenticated) {
    classes += " challenge-authenticated";
  }
  onClick = () => props.onClick(props);

  const [normal_tags, special_attrs] = tags;

  const [my_pos_top, my_pos_left] = get_chal_pos(special_attrs);
  let styles = { 'top': my_pos_top, 'left': my_pos_left };
  const styles_chalname = { 'top': my_pos_top, 'left': my_pos_left };  /* will overlap, see padding and z-index */

  if (solved) {
    classes += " challenge-solved";
    classes_chalname += " chalname-solved";
    styles.backgroundImage = `url('/pics/radio_green.svg')`;  /* packer issues */
  } else {
    classes += " challenge-unsolved";
    classes_chalname += " chalname-unsolved";
    styles.backgroundImage = `url('/pics/radio_red.svg')`;
  }

  let tooltip = special_attrs.get('emoji') + " " + id + "\nCurrently " + points + " points"
        + "\n" + normal_tags.join(' | ');


  // XXX: make div and position both inside it?
  return (
    <>
    <button
      className={classes}
      onClick={onClick}
      onKeyPress={() => {}}
      style={styles}
      title={tooltip}
      id={id}
    >
    </button>
    <div style={styles_chalname} className={classes_chalname}><label htmlFor={id} title={tooltip}>{id}</label></div>
    </>
  );
}
Challenge.propTypes = exact({
  authenticated: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  //item_index: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  points: PropTypes.number.isRequired,
  solved: PropTypes.bool.isRequired,
  tags: PropTypes.array.isRequired,
});
export default Challenge;
