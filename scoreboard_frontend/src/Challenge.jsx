import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";

/* This is how they all appear together on the homepage -- see ChallengeModal for the dialog box */


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
function getRandomMapPct() {
    return '' + getRandomInt(10,80) + "%";
}


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
      'top': getRandomMapPct(),     // TODO: must specify in each challenge or at least make stable, this code runs every time the tab is selected
      'left': getRandomMapPct(),
      backgroundImage: `url('pics/chaldot.png)`,
  }

  if (solved) {
    classes += "challenge-solved";
  }


  return (
    <div
      className={classes}
      onClick={onClick}
      onKeyPress={() => {}}
      style={styles}
    >
      <div className="challenge-title">{id}</div>
      <div className="challenge-score">{points}</div>
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
