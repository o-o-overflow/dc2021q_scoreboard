import React from "react";
import ReactModal from "react-modal";
import { Route } from "react-router-dom";
import ChallengeMenu from "./ChallengeMenu";
import ChallengeModal from "./ChallengeModal";
import GameMatrix from "./GameMatrix";
import LogInModal from "./LogInModal";
import Navbar from "./Navbar";
import Rules from "./Rules";
import Scoreboard from "./Scoreboard";

ReactModal.setAppElement("#root");

const LOCAL_STORAGE_ACCESS_TOKEN = "dc29_access_token";
const LOCAL_STORAGE_REFRESH_TOKEN = "dc29_refresh_token";
const LOCAL_STORAGE_TEAM = "dc29_team";

function challengePoints(solvers, category) {
  if (!Number.isInteger(solvers) || solvers < 2) return 500;
  return parseInt(100 + 400 / (1 + 0.08 * solvers * Math.log(solvers)), 10);
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accessToken:
        window.localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN) || "",
      challenges: {},
      intervalID: -1,
      lastSolveTimeByTeam: {},
      openedByCategory: {},
      solvesByChallenge: {},
      pointsByTeam: {},
      refreshToken:
        window.localStorage.getItem(LOCAL_STORAGE_REFRESH_TOKEN) || "",
      showChallengeId: "",
      showModal: null,
      solvesByTeam: {},
      team: window.localStorage.getItem(LOCAL_STORAGE_TEAM) || "",
      teams: {},
      teamScoreboardOrder: [],
      unopened: {},
    };
    this.categoryByChallenge = {};
  }

  componentDidMount() {
    this.loadChallenges();
    this.loadTeams();
    const challengesIntervalId = setInterval(this.loadChallenges, 60000);
    this.setState({ challengesIntervalId: challengesIntervalId });
  }

  componentWillUnmount() {
    clearInterval(this.state.challengesIntervalId);
  }

  setAuthentication = (data) => {
    this.setState({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      team: data.team,
    });
    window.localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN, data.access_token);
    window.localStorage.setItem(
      LOCAL_STORAGE_REFRESH_TOKEN,
      data.refresh_token
    );
    window.localStorage.setItem(LOCAL_STORAGE_TEAM, data.team);
    this.handleCloseModal();
    this.loadChallenges();
  };

  handleCloseModal = () => {
    this.setState({ showModal: null });
  };

  handleLogOut = () => {
    this.setState({
      accessToken: "",
      refreshToken: "",
      showModal: null,
      team: "",
    });
    window.localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN);
    window.localStorage.removeItem(LOCAL_STORAGE_REFRESH_TOKEN);
    window.localStorage.removeItem(LOCAL_STORAGE_TEAM);
    this.loadChallenges();
  };

  handleOpenChallengeModal = (event) => {
    if (this.state.accessToken === "") {
      this.setState({
        showChallengeId: event.id,
        showModal: "logIn",
      });
    } else {
      this.setState({
        showChallengeId: event.id,
        showModal: "challenge",
      });
    }
  };

  handleOpenLogInModal = () => {
    this.setState({
      showModal: "logIn",
    });
  };

  handleTokenExpired = (success_callback) => {
    const requestData = {
      token: this.state.refreshToken,
    };
    fetch(`${process.env.REACT_APP_BACKEND_URL}/token_refresh`, {
      body: JSON.stringify(requestData),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })
      .then((response) =>
        response.json().then((body) => ({ body, status: response.status }))
      )
      .then(({ body, status }) => {
        if (status !== 200) {
          console.log(status);
          console.log(body.message);
          alert("You have unexpectedly been logged out.");
          this.handleLogOut();
          return;
        }
        this.setState({
          accessToken: body.message.access_token,
        });
        success_callback();
      })
      .catch((error) => {
        console.log(error);
        alert("An unexpected error occurred. Sorry about that. Try logging in again.");
      });
  };

  loadChallenges = () => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/challenges`, { method: "GET" })
      .then((response) =>
        response.json().then((body) => ({ body, status: response.status }))
      )
      .then(({ body, status }) => {
        if (status !== 200) {
          console.log(status);
          console.log(body.message);
          return;
        }
        this.processChallenges(body.message);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  loadTeams = () => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/teams`, { method: "GET" })
      .then((response) =>
        response.json().then((body) => ({ body, status: response.status }))
      )
      .then(({ body, status }) => {
        if (status !== 200) {
          console.log(status);
          console.log(body.message);
          return;
        }
        this.setState({ teams: body.message.teams });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  processChallenges = (data) => {
    const lastSolveTimeByTeam = {};
    const solvesByChallenge = {};
    const solvesByTeam = {};
    const solvesByTeamChallengeTime = {};
    data.solves.forEach(([id, team, time]) => {
      if (id in solvesByChallenge) {
        solvesByChallenge[id] += 1;
      } else {
        solvesByChallenge[id] = 1;
      }

      if (team in solvesByTeam) {
        lastSolveTimeByTeam[team] = Math.max(lastSolveTimeByTeam[team], time);
        solvesByTeam[team].push(id);
        if (!(team in solvesByTeamChallengeTime)) {
          solvesByTeamChallengeTime[team] = {};
        }
        solvesByTeamChallengeTime[team][id] = time;
      } else {
        lastSolveTimeByTeam[team] = time;
        solvesByTeam[team] = [id];
        if (!(team in solvesByTeamChallengeTime)) {
          solvesByTeamChallengeTime[team] = {};
        }
        solvesByTeamChallengeTime[team][id] = time;
      }
    });

    const pointsByChallenge = {};
    const challenges = {};
    data.open.forEach(([id, tags, category, _openTime]) => {
      this.categoryByChallenge[id] = tags;
      pointsByChallenge[id] = challengePoints(solvesByChallenge[id], category);

      const object = {
        id,
        points: pointsByChallenge[id],
        solved: (solvesByTeam[this.state.team] || []).includes(id),
        tags,
      };
      console.assert(category === "haiku");
      if (category in challenges) {
        challenges[category].push(object);
      } else {
        challenges[category] = [object];
      }
    });

    const pointsByTeam = {};
    Object.keys(solvesByTeam).forEach((team) => {
      let points = 0;
      solvesByTeam[team].forEach((id) => {
        points += pointsByChallenge[id];
      });
      pointsByTeam[team] = points;
    });

    const teamScoreboardOrder = Object.keys(pointsByTeam).map((name) => ({
      lastSolveTime: lastSolveTimeByTeam[name],
      name,
      points: pointsByTeam[name],
      solves: solvesByTeam[name],
    }));
    teamScoreboardOrder.sort((a, b) => {
      if (a.points === b.points) {
        return a.lastSolveTime - b.lastSolveTime;
      }
      return b.points - a.points;
    });

    this.setState({
      challenges,
      lastSolveTimeByTeam,
      pointsByTeam,
      teamScoreboardOrder,
      solvesByTeam,
      solvesByChallenge,
      unopened: data.unopened_by_category,
    });
  };

  render() {
    const teamSolves = this.state.solvesByTeam[this.state.team] || [];
    const solved = teamSolves.includes(this.state.showChallengeId);
    return (
      <>
        <Navbar
          authenticated={this.state.accessToken !== ""}
          handleLogOut={this.handleLogOut}
          handleOpenLogInModal={this.handleOpenLogInModal}
          team={this.state.team}
        />
        <main role="main" className="container-fluid">
          <Route
            exact
            path="/"
            render={() => (
              <ChallengeMenu
                authenticated={this.state.accessToken !== ""}
                challenges={this.state.challenges}
                onClick={this.handleOpenChallengeModal}
                onUnload={this.handleCloseModal}
                unopened={this.state.unopened}
              />
            )}
          />
          <Route exact path="/rules" component={Rules} />
          <Route
            exact
            path="/scoreboard"
            render={() => (
              <Scoreboard
                categoryByChallenge={this.categoryByChallenge}
                lastSolveTimeByTeam={this.state.lastSolveTimeByTeam}
                pointsByTeam={this.state.pointsByTeam}
                solvesByTeam={this.state.solvesByTeam}
                teamScoreboardOrder={this.state.teamScoreboardOrder}
                team={this.state.team}
                teams={this.state.teams}
              />
            )}
          />
          <Route
            exact
            path="/solves"
            render={() => (
              <GameMatrix
                challenges={this.state.challenges}
                solvesByChallenge={this.state.solvesByChallenge}
                teamScoreboardOrder={this.state.teamScoreboardOrder}
              />
            )}
          />

          <ReactModal
            className="login-modal"
            contentLabel="Log In Modal"
            isOpen={this.state.showModal === "logIn"}
            onRequestClose={this.handleCloseModal}
          >
            <LogInModal
              onClose={this.handleCloseModal}
              setAuthentication={this.setAuthentication}
            />
          </ReactModal>
          <ReactModal
            className="challenge-modal"
            contentLabel="Challenge Modal"
            isOpen={this.state.showModal === "challenge"}
            onRequestClose={this.handleCloseModal}
          >
            <ChallengeModal
              challengeId={this.state.showChallengeId}
              onClose={this.handleCloseModal}
              onTokenExpired={this.handleTokenExpired}
              onSolve={this.loadChallenges}
              solved={solved}
              numSolved={
                this.state.solvesByChallenge[this.state.showChallengeId] || 0
              }
              token={this.state.accessToken}
              challenges={this.state.challenges}
            />
          </ReactModal>
        </main>
      </>
    );
  }
}
export default App;
