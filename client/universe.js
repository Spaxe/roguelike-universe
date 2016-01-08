import React from "react";
import load from "load-json-xhr";

export const Universe = React.createClass({

  getInitialState() {
    return {
      games: []
    };
  },

  componentDidMount() {

    load('http://localhost:8002/api/v1/roguelikes', (err, data) => {
      this.setState({ games: data });
    });

  },

  render() {

    let gamesList = this.state.games.map( game => {
      return (
        <div key={game.id}>{game.title}</div>
      );
    });

    return (
      <div>
        <h1>roguelike mrraa</h1>
        {gamesList}
      </div>
    );

  }

});