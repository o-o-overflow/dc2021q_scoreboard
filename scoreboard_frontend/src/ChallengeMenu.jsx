import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";
import ChallengeSection from "./ChallengeSection";

/* There's actually only one section, but things are in ChallengeSection */



class ChallengeMenu extends React.Component {
  constructor(props) {
    super(props);

    this.sectionOrder = ["haiku"];
  }

  componentWillUnmount = () => {
    this.props.onUnload();
  };

  buildSections = (sectionTitle) => {
    const openChallenges = this.props.challenges[sectionTitle] || [];
    const unopenedChallenges = Array.from(
      Array(this.props.unopened[sectionTitle] || 0),
      (_, i) => ({ unopened: i + 1000 })
    );
    return (
      <ChallengeSection
        authenticated={this.props.authenticated}
        challenges={openChallenges.concat(unopenedChallenges)}
        key={sectionTitle}
        onClick={this.props.onClick}
        title={sectionTitle}
      />
    );
  };
//<img src="pics/map.jpg" className="thebigmap" alt="" />
/*
        <footer className="chalmenu-footer">
          <a href="https://discord.gg/defcon" target="_blank" rel="noopener noreferrer">
              Chat with us on Discord
          </a>
          <span className="sepbar">|</span>
          <a href="https://oooverflow.io/" rel="noreferrer">OOO</a>
          <span className="sepbar">|</span>
          <a href="https://defcon.org/" rel="noreferrer">DEF CON</a>
          <span className="sepbar">|</span>
          <span className="tagline">You can't stop the signal</span>
        </footer>
*/

  render() {
    const sections = this.sectionOrder.map(this.buildSections);
    return (
      <>
        <div id="thebigdiv">
            {sections}
        </div>
        <footer className="chalmenu-footer">
          <a href="https://discord.gg/defcon" target="_blank" rel="noopener noreferrer">
          You can't stop the signal
          </a>
        </footer>
      </>
    );
  }
}
ChallengeMenu.propTypes = exact({
  authenticated: PropTypes.bool.isRequired,
  challenges: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.object))
    .isRequired,
  onClick: PropTypes.func.isRequired,
  onUnload: PropTypes.func.isRequired,
  unopened: PropTypes.objectOf(PropTypes.number).isRequired,
});
export default ChallengeMenu;
