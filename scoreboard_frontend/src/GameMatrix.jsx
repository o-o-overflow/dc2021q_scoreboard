import React from "react";

/* The "Solves" tab:  team Y N N Y N ... for each challenge */

class GameMatrix extends React.Component {
  body() {
    return this.props.teamScoreboardOrder.map((team) => {
      return (
        <tr key={team.name}>
          <td className="sticky-left" key={team.name}>
            {team.name}
          </td>
          {this.solvedRow(new Set(team.solves), team.name)}
        </tr>
      );
    });
  }

  header() {
    const theHeaders = this.challenges.map((id) => {
      return (
        <th key={id} scope="row" title={id}>
          <span className="solves-header-emoji">{this.props.tagsByChallenge[id][1].get('emoji')}</span>
          ({this.props.solvesByChallenge[id] || 0})
        </th>
      );
    });

    return theHeaders;
  }

  solvedRow(solves, teamName) {
    return this.challenges.map((id) => {
      const solved = solves.has(id);
      const tooltip = "" + teamName + " - " + id + " " + (solved ? "solved" : "unsolved");
      const cls = (solved ? "solves-td-yes" : "solves-td-no");
      return <td title={tooltip} key={id} className={cls}>{solved ? "Y" : "N"}</td>; /* TODO: emoji */
    });
  }

  render() {
    this.challenges = [];
    Object.keys(this.props.challenges).map((cat) => {
      return this.props.challenges[cat].map((chall) => {
        return this.challenges.push(chall.id);
      });
    });

    this.challenges.sort();

    return (
      <div className="table-responsive">
        <table className="table table-hover table-sm">
          <thead>
            <tr>
              <th className="sticky-left" scope="column">
                Team
              </th>
              {this.header()}
            </tr>
          </thead>
          <tbody>{this.body()}</tbody>
        </table>
      </div>
    );
  }
}

export default GameMatrix;
