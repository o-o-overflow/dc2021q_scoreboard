import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";

/* This is how they all appear together on the homepage -- see ChallengeModal for the dialog box */


function Challenge(props) {
  const { authenticated, id, item_index, points, solved } = props;

  let onClick = null;
  let classes = "challenge";
  if (authenticated) {
    classes += " challenge-authenticated";
  }
  onClick = () => props.onClick(props);

  let styles = {
      // TODO: must specify in each challenge or at least make stable, this code runs every time the tab is selected
      'top': '' + (15 + 9*item_index) + "%",
      'left': '' + (5 + 14*item_index) + "%",
      backgroundImage: `url('/pics/radio_red.svg')`,
  }
  const styles_chalname = {
      // TODO: somehow this is not the same as above?!? Accumulates changes? WTF...
      'top': '' + (15 + 9*item_index) + "%",
      'left': '' + (5 + 14*item_index) + "%",
  }

  if (solved) {
    classes += "challenge-solved";
    styles.backgroundImage = `url('/pics/radio_green.svg')`;
  }

  // TODO: better tooltip
  let tooltip = "" + id + "\nCurrently " + points + " points";


  // TODO: make div and position both inside it?
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
    <div style={styles_chalname} className="chalname"><label htmlFor={id}>{id}</label></div>
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
