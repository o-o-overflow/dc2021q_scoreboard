import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";

/* This is how they all appear together on the homepage -- see ChallengeModal for the dialog box */


function getMapTop(item_i) { return '' + (15 + 9*item_i) + "%"; }
function getMapLeft(item_i) { return '' + (5 + 14*item_i) + "%"; }


function Challenge(props) {
  const { authenticated, id, points, solved, tags, item_index } = props;

  let onClick = null;
  let classes = "challenge";
  if (authenticated) {
    classes += " challenge-authenticated";
    onClick = () => props.onClick(props); /* this somehow bubbles up to opening the modal by setting a state */
  } else {
      /* TODO: "Gotta login to see that" */
      /* We should somehow go up to handleOpenLogInModal and/or change handleOpenChallengeModal */
    onClick = () => props.onClick(props);
  }


  var styles = {
      // TODO: must specify in each challenge or at least make stable, this code runs every time the tab is selected
      'top': getMapTop(item_index),
      'left': getMapLeft(item_index),
      backgroundImage: `url('/pics/tower_red.svg')`,
  }

  if (solved) {
    classes += "challenge-solved";
    styles.backgroundImage = `url('/pics/tower_green.svg')`;
  }

  // TODO: better tooltip
  let tooltip = "" + id + "\nCurrently " + points + " points";

  return (
    <div
      className={classes}
      onClick={onClick}
      onKeyPress={() => {}}
      style={styles}
      title={tooltip}
    >
    </div>
  );
}
Challenge.propTypes = exact({
  authenticated: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  points: PropTypes.number.isRequired,
  solved: PropTypes.bool.isRequired,
  item_index: PropTypes.number.isRequired,
});
export default Challenge;
