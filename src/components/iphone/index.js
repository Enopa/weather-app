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
	fetchWeatherData = () => {
		// API URL with a structure of : ttp://api.wunderground.com/api/key/feature/q/country-code/city.json
		var url = "http://api.openweathermap.org/data/2.5/weather?q=Moscow&units=metric&APPID=477fb4cf822217d9f24260aa91ebb19b";
		$.ajax({
			url: url,
			dataType: "jsonp",
			success : this.parseResponse,
			error : function(req, err){ console.log('API call failed ' + err); }
		})

		// once the data grabbed, hide the button
		this.setState({ display: false});

		
	}

	renderBuddy() {
		return (
			<Buddy className='buddyinfo' buddyInfo={this.state.buddyInfo}/> 
		);
	}
     
	// the main render method for the iphone component
	render() {
		// check if temperature data is fetched, if so add the sign styling to the page
		const tempStyles = this.state.temp ? `${style.temperature} ${style.filled}` : style.temperature;
		const d = new Date();
		var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
		const date = d.toLocaleDateString("en-US", options);
		const percentage = (this.state.temp / 35) * 100;

		// display all weather data
		return (
			<div class={ style.container }>
				<div class={ style.header }>
				    {this.state.display ? null : <img class={style.buddypic} src="buddy.png" alt="Square Smiley Face" width="100"/>}
				    <div class={style.buddy}>{this.state.temp != 0  ? this.renderBuddy() : null }</div>
					{this.state.display ? null : <img class={style.icon} src={this.state.imageIcon} alt="Icon" width="80"/>}
					<div class={style.date}>{this.state.display ? null : date}</div>
					<div class={ style.city }>{ this.state.locate }</div>
					<div class={ style.conditions }>{ this.state.cond }</div>
					{this.state.display ? null : <div class={style.circle} style={{width: 250}}><CircularProgressbar styles={buildStyles({pathColor: this.state.tempColor, textColor:'#252525'})} value={percentage} text={`${this.state.temp + '°'}`}/></div>}
					<div class={ style.percent }>{ this.state.display ? null : this.state.cloudy + "%"}</div>
					{this.state.display ? null : <img class={style.drop} src="rainDrop.png" alt="Rain Drop Icon" width="25"/>}
					<canvas id='Canvas' class={style.Canvas}></canvas>
					
				</div>
				<div class={ style.details }></div>
				<div class= { style_iphone.container }> 
					{ this.state.display ? <Button class={ style_iphone.button } clickFunction={ this.fetchWeatherData }/ > : null }
				</div>
			</div>
		);
	}

	parseResponse = (parsed_json) => {
		var location = parsed_json['name'];
		var temp_c = parsed_json['main']['temp'];
		var conditions = parsed_json['weather']['0']['description'];
		var wind = parsed_json['wind']['speed'];
		var clouds = parsed_json['clouds']['all'];
		var icon = parsed_json['weather']['0']['icon'];


		const canvas = document.getElementById('Canvas')

		console.log(canvas)
		const ctx = canvas.getContext('2d')
		
		canvas.height = innerHeight
		canvas.width = innerWidth

		console.log(innerHeight, innerWidth)
		let increment = 0

		let waveColour = [temp_c*6.375];

		
        
		//Checking certain information to display for the buddy info
		var b_info = [];
		if (temp_c > 25)
		{
			b_info.push("Hot one out today, drop the coat and maybe grab some sunscreen!");
		}
		if (temp_c < 10)
		{
			b_info.push("Brrrr, it is chilly out today. Maybe pop a coat and scarf on!")
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
			b_info.push("Looks like its raining, time to grab an umbrella!")
			waveColour.push(255);
		}

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
			imageIcon: "http://openweathermap.org/img/wn/" + icon + "@2x.png"
		});    

		waveColour.push((waveColour[0]+waveColour[1])/2);

		console.log(waveColour)

		console.log(innerWidth)
		
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
			increment += 0.01
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

