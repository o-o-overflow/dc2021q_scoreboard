import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";

/* This is how they all appear together on the homepage -- see ChallengeModal for the dialog box */

/* XXX: TO REMOVE TAGS: remove them from the tooltip */

function Challenge(props) {
  const { authenticated, id, item_index, points, solved, tags } = props;

  let onClick = null;
  let classes = "challenge";
  let classes_chalname = "chalname";
  if (authenticated) {
    classes += " challenge-authenticated";
  }
  onClick = () => props.onClick(props);

  let styles = {
      // TODO: must specify in each challenge or at least make stable, this code runs every time the tab is selected
      'top': '' + (15 + 9*item_index) + "%",
      'left': '' + (5 + 14*item_index) + "%",
  }
  const styles_chalname = {
      'top': '' + (15 + 9*item_index) + "%",
      'left': '' + (5 + 14*item_index) + "%",
  }

  if (solved) {
    classes += " challenge-solved";
    classes_chalname += " chalname-solved";
    styles.backgroundImage = `url('/pics/radio_green.svg')`;  /* packer issues */
  } else {
    classes += " challenge-unsolved";
    classes_chalname += " chalname-unsolved";
    styles.backgroundImage = `url('/pics/radio_red.svg')`;
  }

  const tag_names = tags.split(",").map((tag, index) => {
    return tag.trim();
  }).join(' | ');

  let tooltip = "" + id + "\nCurrently " + points + " points"
        + "\n" + tag_names;


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
  item_index: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  points: PropTypes.number.isRequired,
  solved: PropTypes.bool.isRequired,
  tags: PropTypes.string.isRequired,
});
export default Challenge;
