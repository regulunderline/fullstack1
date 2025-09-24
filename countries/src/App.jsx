import { useState, useEffect } from 'react'
import axios from 'axios'
const api_key = import.meta.env.VITE_SOME_KEY

const Output = ({ output, isOnlyOne, isNone, handleSubmit }) => {
  if (output === null){
    return null
  }
  if (isOnlyOne){
    return (
      <div>
        <h1>{output.name}</h1>
        <div>Capital {output.capital}</div>
        <div>Area {output.area}</div>
        <h2>Languages</h2>
        <ul>
          {output.languages.map((language, index) => <li key={index}>{language}</li>)}
        </ul>
        <div><img src={output.flag}/></div>
        <h2>Whether in {output.capital}</h2>
        <div>Tempreture {Math.round(output.tempreture*100)/100} Celsius</div>
        <div><img src={`https://openweathermap.org/img/wn/${output.image}@2x.png`}/></div>
        <div>Wind {output.wind} m/s</div>
      </div>
    )
  }
  if (!isNone){
    return (
      <div>{output}</div>
    )
  }
  return (
    <div>{
      output.map((eachRow, index) => 
        <div key={index}> 
          <form name={eachRow} onSubmit={handleSubmit}>
            {eachRow}
            <button type="submit">Show</button>
          </form>
        </div>)}
    </div>
  )
}

const App = () => {
  const [value, setValue] = useState('')
  const [output, setOutput] = useState([null, false, false])
  const [weather, setWeather] = useState({tempreture : 0 , image : '01d', wind : 0})

  useEffect(() => {
    if (value) {
      console.log('fetching countries')
      axios
        .get(`https://studies.cs.helsinki.fi/restcountries/api/all`)
        .then(response => {
          const responseCountries = response.data.filter((country) => country.name.common.toLowerCase().includes(value.toLowerCase()))
          const responseLength = responseCountries.length
          if (responseLength === 0){
            setOutput([`No countries found`, false, false])
          }
          else {
            if (responseLength > 10){
              setOutput([`Too many matches, specify another filter`, false, false])
            }
            else {
              if (responseLength > 1){
                setOutput([responseCountries.map(country => country.name.common), false, true])
              }
              else {
                setOutput([responseCountries.map(country => {
                  getWeather(country.capital, country.altSpellings[0])
                  return (
                    {
                      name : country.name.common,
                      capital : country.capital,
                      code : country.altSpellings[0],
                      area : country.area,
                      languages : Object.values(country.languages),
                      flag : country.flags.png,
                      tempreture : weather.tempreture,
                      image : weather.image,
                      wind : weather.wind
                    }
                  )
                })[0], true, true])
              }
            }
          }
        })
    }
  }, [value])
  
  useEffect(() => {
    if(output[1] && output[2]){
      const wetherOutput = Object.assign(output[0], {tempreture : weather.tempreture, image : weather.image, wind : weather.wind})
      setOutput([wetherOutput, true, true])
    }
  },[weather])

  const getWeather = (capital, countryCode) => {
    const capitalLocation = {lat : 0, lon : 0}
    const capitalWeather = {tempreture : 0, image : '01d', wind : 0}
    axios
      .get(`http://api.openweathermap.org/geo/1.0/direct?q=${capital},${countryCode}&limit=1&appid=${api_key}`)
      .then(response => {
        capitalLocation.lat = response.data[0].lat
        capitalLocation.lon = response.data[0].lon
      axios
        .get(`https://api.openweathermap.org/data/2.5/weather?lat=${capitalLocation.lat}&lon=${capitalLocation.lon}&appid=${api_key}`)
        .then(response => {
          capitalWeather.tempreture = response.data.main.temp - 273.15
          capitalWeather.image = response.data.weather[0].icon
          capitalWeather.wind = response.data.wind.speed
          setWeather(capitalWeather)
        })
      })
      .catch(error => {
        console.log("wtf")
        capitalWeather.tempreture = 'error'
        capitalWeather.wind = 'error'
      })
  }
  

  const handleChange = (event) => {
    setValue(event.target.value)
  }
  const handleSubmit = (event) => {
    event.preventDefault()
    setValue(event.target.name)
  }

  return (
    <div>
        find countries<input value={value} onChange={handleChange} />
        <Output output={output[0]} isOnlyOne={output[1]} isNone={output[2]} handleSubmit={handleSubmit}/>
    </div>
  )
}

export default App