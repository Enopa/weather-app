// import preact
import { h, render, Component } from 'preact';
// import stylesheets for ipad & button
import style from './style';
import style_iphone from '../button/style_iphone';
// import jquery for API calls
import $ from 'jquery';
// import the Button component
import Button from '../button';
import ReactPropTypes from 'proptypes';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


export default class Iphone extends Component {
    //var Iphone = React.createClass({

	// a constructor with initial set states
	constructor(props){
		super(props);
		// temperature state
		this.state.temp = "";
		// button display state
		this.setState({ display: true});
	}

	// a call to fetch weather data via wunderground
	fetchWeatherData = (location) => {
		// API URL with a structure of : ttp://api.wunderground.com/api/key/feature/q/country-code/city.json
		//Edited this from the boiler plate to ensure that an error window is shown if the user inputs an incorrect city
		var url = "http://api.openweathermap.org/data/2.5/weather?q=" + location + "&units=metric&APPID=3ade289044e1debf629af13a4c323f84";
		$.ajax({
			url: url,
			dataType: "jsonp",
			success : this.parseResponse,
			error : function(req, err){ console.log('API call failed ' + err); alert("Not a valid city");}
		})
	}


	//Displays the first screen the user will see when they enter the app
	//An input field as well as instructions so it is clear what the user must enter
	inputDisplay() 
	{
		return(
	     <div class={style.inputDisplay}>
			<p><strong>Please enter a city with it's Country Code:</strong></p>
			<p>e.g. London, GB</p>
			<input class={style.inputBox} id="city" type="text" size="20"/>
			<br></br>
			<button class={style.submitButton} onClick={() => this.fetchWeatherData(document.getElementById("city").value)}> Display Weather</button>
		</div>
		);
		
		
	}

	//Displays the custom buddy class
	renderBuddy() {
		return (
			<Buddy className='buddyinfo' buddyInfo={this.state.buddyInfo}/> 
		);
	}
     
	// the main render method for the iphone component
	render() {
		// check if temperature data is fetched, if so add the sign styling to the page
		const tempStyles = this.state.temp ? `${style.temperature} ${style.filled}` : style.temperature;
		//Date retrieval and formatting
		const d = new Date();
		var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
		const date = d.toLocaleDateString("en-US", options);
		//Temperature converted into a percentage so that it can be used with the radial temperature bar
		//Highest temperature is 35, this is way above average and usually indicates very hot weather
		const percentage = (this.state.temp / 35) * 100;

		// display all weather data
		return (
			<div class={ style.container }>
				<div class={ style.header }>
				    {this.state.display ? null : <img class={style.buddypic} src="buddy.png" alt="Square Smiley Face" width="100"/>}
				    <div class={style.buddy}>{this.state.temp != 0  ? this.renderBuddy() : null }</div>
					{this.state.display ? null : <img class={style.icon} src={this.state.imageIcon} alt="Icon" width="80"/>}
					<div class={style.date}>{this.state.display ? null : date}</div>					
					{this.state.display ? null : <div class={ style.city }> { this.state.locate }</div>}
					{this.state.display ? null : <button class={style.switchButton} onClick={() => location.reload()}>Switch Location</button>}
					<div class={ style.conditions }>{ this.state.cond }</div>
					{this.state.display ? null : <div class={style.circle} style={{width: 250}}><CircularProgressbar styles={buildStyles({pathColor: this.state.tempColor, textColor:'#252525'})} value={percentage} text={`${this.state.temp + '°'}`}/></div>}
					<div class={ style.percent }>{ this.state.display ? null : this.state.cloudy + "%"}</div>
					{this.state.display ? null : <img class={style.drop} src="rainDrop.png" alt="Rain Drop Icon" width="25"/>}
					{this.state.display ? null : <img class={style.windSpeed} src="windSpeed.png" alt="Wind Speed Icon" width="25"/>}
					{this.state.display ? null : <p class={style.Speed}>Wind Speed: {Math.round(this.state.w_speed)}mps</p>}
				    <canvas id='Canvas' class={style.Canvas}></canvas>
				</div>

				<div> 
					{ this.state.display ? this.inputDisplay()  : null }
				</div>
				
			</div>
		);
	}

	parseResponse = (parsed_json) => {
		//we had to retrieve a few extra variables from the json file
		var location = parsed_json['name'];
		//Temperature rounded to 1 to make it easier to read for the user
		var temp_c = Math.round(parsed_json['main']['temp']);
		var conditions = parsed_json['weather']['0']['description'];
		var wind = parsed_json['wind']['speed'];
		var clouds = parsed_json['clouds']['all'];
		var icon = parsed_json['weather']['0']['icon'];
		var barColour = "#375f00";

		//Initialising variables for our canvas
		const canvas = document.getElementById('Canvas')
		const ctx = canvas.getContext('2d')
		canvas.height = innerHeight
		canvas.width = innerWidth
		let increment = 0
		let waveColour = [temp_c*6.375];
        
        
		//Checking certain information to display for the buddy info
		//Will be pushed to an array which the user can cycle through 
		var b_info = [];
		if (temp_c > 25)
		{
			b_info.push("Hot one out today, drop the coat and maybe grab some sunscreen!");
			barColour = '#FF0000';
		}
		if (temp_c < 10)
		{
			b_info.push("Brrrr, it is chilly out today. Maybe pop a coat and scarf on!")
			barColour = '#0000FF';
			
		}
		switch (conditions)
		{
			case "snow":
				b_info.push("Time to make a snowman! Look like its snowing out today, wrap up warm and watch out for ice");
				waveColour.push(128);
				break;
			case "mist":
				b_info.push("It's misty out today, stay extra vigilint");
				waveColour.push(74);
				break;
		}
        

		if (conditions.includes("rain"))
		{
			b_info.push("Looks like its raining, time to grab an umbrella!");
			waveColour.push(255);

		}

		//If there are no unique weather conditions, the buddy will display one general thing
		if (b_info.length == 0)
		{
			b_info.push("Looks like the weather is acting fairly normal today, have a great day!");	
			waveColour.push(30);
		}

		// set states for fields so they could be rendered later on
		this.setState({
			locate: location,
			temp: temp_c,
			cond : conditions,
			w_speed: wind,
			buddyInfo: b_info,
			cloudy: clouds,
			//The API allowed us to grab icons for the weather, of which we utilised
			imageIcon: "http://openweathermap.org/img/wn/" + icon + "@2x.png",
			tempColor: barColour,
			//Display set to false in parse response instead, to ensure the API call succeeded
			display: false
		});   

		//Creating the wave and animating it
		//Speed is affected by the wind speed
		waveColour.push((waveColour[0]+waveColour[1])/2);

		function animate()  { 
			ctx.beginPath()
			ctx.moveTo(0, innerHeight)
			ctx.clearRect(0,0,innerWidth, innerHeight)
			ctx.fillRect(0,innerHeight*0.75,innerWidth, innerHeight)

			for (let i = 0; i < innerWidth; i++) {
				let wave1 = Math.sin(i * 0.01 - increment)
      			let wave2 = Math.sin(i * 0.02 - increment)
      			let wave3 = Math.sin(i * 0.015 - increment)

    			ctx.lineTo(i * 2.5, innerHeight - 400 + wave1 * wave2 * wave3 * 200)
			}
				 
			ctx.lineWidth = 10
			increment += 0.01 * wind
			ctx.fillStyle = `rgb(${waveColour[0]}, ${waveColour[1]}, ${waveColour[2]})`;
			ctx.fill()
			ctx.closePath()
			requestAnimationFrame(animate)
		}

		animate()	

	}
	

	
}

//Buddy component, button that displays a parent state array. 
class Buddy extends Component {
	constructor(props) 
	{
		super(props);
		this.state = {
			info: this.props.buddyInfo
		}
	}

	render () 
	{
		return (			
			<button class={style.buddyButton} onClick={() => this.moreInfo()}>{this.state.info[0]}</button>
		)
	}

	moreInfo() 
	{ 
		var array = this.state.info.slice(1)
		array.push(this.state.info[0])
		this.setState({info: array})	
	}
}