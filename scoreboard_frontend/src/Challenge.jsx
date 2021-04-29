import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";

/* This is how they all appear together on the homepage -- see ChallengeModal for the dialog box */

/* XXX: TO REMOVE TAGS: remove them from the tooltip */


const PRESET_CHAL_POSITIONS = {
    0: ["37%","48%"],  // ~= Milan
    1: ["42%","14%"],  // ~= socal
}

function rnd_float(seed)
{
    /* from v8 -- Robert Jenkins' 32 bit integer hash function.
     * overkill, but all things I found are either terrible
     * (like, linear on the seed), or ten pages long */
    seed = seed & 0xffffffff
    seed = (seed + 0x7ed55d16 + (seed << 12)) & 0xffffffff
    seed = (seed ^ 0xc761c23c ^ (seed >>> 19)) & 0xffffffff
    seed = (seed + 0x165667b1 + (seed << 5)) & 0xffffffff
    seed = ((seed + 0xd3a2646c) ^ (seed << 9)) & 0xffffffff
    seed = (seed + 0xfd7046c5 + (seed << 3)) & 0xffffffff
    seed = (seed ^ 0xb55a4f09 ^ (seed >>> 16)) & 0xffffffff
    return (seed & 0xfffffff) / 0x10000000;
}
function random_map_pct(seed)
{
    const f = rnd_float(seed);
    const i = Math.floor(f*10);
    return 5 + i*9;
}
function get_chal_pos(id, item_index)
{
    /* If we have a preference, use it */
    var preset = PRESET_CHAL_POSITIONS[item_index];
    if (preset)
        return preset;
    /* Otherwise make one up, hoping it won't collide */
    /* Doesn't work that well, we should try not to use it */
    return [
      '' + random_map_pct(item_index) + "%",
      '' + random_map_pct(item_index+47) + "%"
    ];
}


function Challenge(props) {
  const { authenticated, id, item_index, points, solved, tags } = props;

  let onClick = null;
  let classes = "challenge";
  let classes_chalname = "chalname";
  if (authenticated) {
    classes += " challenge-authenticated";
  }
  onClick = () => props.onClick(props);

  const [my_pos_top, my_pos_left] = get_chal_pos(id, item_index);
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
