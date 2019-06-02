import PropTypes from "prop-types";
import React from "react";
import ChallengeSection from "./ChallengeSection";

class ChallengeMenu extends React.Component {
  constructor(props) {
    super(props);

    this.sectionOrder = [
      "amuse bouche",
      "appetizers",
      "from the grill",
      "signature dishes",
      "fruits and desserts"
    ];
  }

  componentWillUnmount = () => {
    this.props.onUnload();
  };

  buildSections = sectionTitle => {
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

  render() {
    const sections = this.sectionOrder.map(this.buildSections);
    return <div className="row">{sections}</div>;
  }
}
ChallengeMenu.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  challenges: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.object))
    .isRequired,
  onClick: PropTypes.func.isRequired,
  onUnload: PropTypes.func.isRequired,
  unopened: PropTypes.objectOf(PropTypes.number).isRequired
};
export default ChallengeMenu;
