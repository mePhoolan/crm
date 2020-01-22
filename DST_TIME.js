import React, { Component } from "react";
import axios from "axios";

export class Home extends Component {
  state = { data: [] };

  fetchData = async () => {
    let ui = [];
    let response = await axios.get(
      "http://5ddcff9ff40ae700141e8b53.mockapi.io/Card"
    );
    console.log(response);

    response.data.forEach(async value => {
      ui.push(this.renderCard(value.title, value.img));
    });
    this.setState({
      data: ui
    });

    console.log(this.state.data);
  };

  componentWillMount() {
    this.fetchData();
  }

  render() {
    console.log("gufhfgkhdfgggffgkfggf");
    return (
      <div>
        <h1>this is my first Home </h1>
        {this.state.data}
      </div>
    );
  }
  renderCard = (title, image) => {
    return (
      <div>
        <img
          src={image}
          style={{
            height: "200px",
            width: "200px"
          }}
        />
        <h5>{title}</h5>
        <div>{this.toDSTTime(cms.updated_date)}</div>
      </div>
    );
  };

  toDSTTime = time => {
    let newTime = "";
    let d = moment(time);

    if (d.isDST()) {
      newTime = moment(time)
        .zone("-04.00")
        .format("YYYY-MM-DD");
    } else {
      newTime = moment(time)
        .zone("-05.00")
        .format("YYYY-MM-DD");
    }

    return newTime;
  }
}
