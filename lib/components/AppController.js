import React from "react";
import Markdown from "react-remarkable";
import fs from "fs";
//import md from "node-markdown"
import md from "marked";


fs.readFileSync('./newpost.md', 'utf-8', function(err, data){
  console.log(md(data.toString()))
});


class AppController extends React.Component{
  constructor(props){
    super(props);
    this.state = {  }
  }
  render(){
    return(
      <div className="app">
        <Markdown>
          ## Reasons React is great

          1. Server-side rendering
          2. This totally works:

          Pretty neat!
        </Markdown>
      </div>
    )
  }
}

export default AppController

