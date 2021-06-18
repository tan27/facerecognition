import React, { Component } from 'react'
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';
import './App.css';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';

const app = new Clarifai.App({
 apiKey: '9b734cf17c51440898f602a0a1c562c0'
});

const particlesOptions = {
  particles: {
    number: {
      value: 50,
      density: {
        enable:true,
        value_area: 800
      }
    },
    move: {
      radius: 4
    }
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

loadUser = (data) => {
  this.setState({user: {
    id: data.id,
    name: data.name,
    email: data.email,
    entries: data.entries,
    joined: data.joined
  }})
}

// componentDidMount() {
//   fetch('http://localhost:3000/')
//     .then(response => response.json())
//     .then(console.log)
// }

calculateFaceLocation = (data) => {
  const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
  const image = document.getElementById('inputimage');
  const width = Number(image.width);
  const height = Number(image.height);
  return {
    leftCol: clarifaiFace.left_col * width,
    topRow: clarifaiFace.top_row * height,
    rightCol: width - (clarifaiFace.right_col * width),
    bottomRow: height - (clarifaiFace.bottomRow * height)
  }
}

displayFaceBox = (box) => {
  this.setState({box: box})
}


// reads input of input box
onInputChange = (e) => {
  this.setState({input: e.target.value});
}
//set image displayed to the input url
onButtonSubmit = () => {
  this.setState=({imageUrl: this.state.input});
  app.models.predict(
    'c0c0ac362b03416da06ab3fa36fb58e3', 
    this.state.input)
  .then( response => {
    if (response) {
    fetch('http://localhost:3000/image', { //fetching to update
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
      id: this.state.user.id
      })
    })
    .then(response => response.json()) // updating rank entry
    .then(count => {
      this.setState(Object.assign(this.state.user, {entries: count}))
    })
  }
    this.displayFaceBox(this.calculateFaceLocation(response))
})
  .catch(err => console.log(err));
}

onRouteChange = (route) => {
  if (route === 'signout') {
    this.setState({isSignedIn: false})
  } else if (route === 'home') {
    this.setState({isSignedIn: true})
  }
  this.setState({route: route});
}

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
          <Particles className='particles'
          params={particlesOptions}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home'
          ? <div>
              <Logo />
              <Rank
                name={this.state.user.name}
                entries={this.state.user.entries}
              />
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={box} imageUrl={imageUrl} />
            </div>
          : (
              route === 'signin'
              ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
        }
      </div>
    );
  }
}


export default App;
