import { useEffect, useState } from 'react'
import axios from 'axios'

const App = () => {
  const [countries, setCountries] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
  }, [])

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
    setSelectedCountry(null)
    setWeather(null)
  }

  const showCountry = (country) => {
    setSelectedCountry(country)
    setWeather(null)
  }

  const countriesToShow = countries.filter(country =>
    country.name.common.toLowerCase().includes(search.toLowerCase())
  )

  const country = selectedCountry || (
    countriesToShow.length === 1 ? countriesToShow[0] : null
  )

  useEffect(() => {
    if (!country || !country.capital) {
      return
    }

    const apiKey = import.meta.env.VITE_WEATHER_API_KEY
    const capital = country.capital[0]

    if (!apiKey) {
      console.log('Weather API key is missing')
      return
    }

    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(capital)}&appid=${apiKey}&units=metric`
      )
      .then(response => {
        setWeather(response.data)
      })
      .catch(error => {
        console.error('Could not get weather data', error)
        setWeather(null)
      })
  }, [country])

  let content = null

  if (search === '') {
    content = null
  } else if (countriesToShow.length > 10) {
    content = <p>Too many matches, specify another filter</p>
  } else if (countriesToShow.length > 1 && !selectedCountry) {
    content = (
      <ul>
        {countriesToShow.map(country =>
          <li key={country.cca3}>
            {country.name.common}{' '}
            <button onClick={() => showCountry(country)}>
              show
            </button>
          </li>
        )}
      </ul>
    )
  } else if (country) {
    content = (
      <div>
        <h1>{country.name.common}</h1>

        <p>
          capital {country.capital?.[0]}
        </p>

        <p>
          area {country.area}
        </p>

        <h2>languages:</h2>

        <ul>
          {Object.values(country.languages || {}).map(language =>
            <li key={language}>{language}</li>
          )}
        </ul>

        <img
          src={country.flags.png}
          alt={`Flag of ${country.name.common}`}
          width="200"
        />

        <h2>Weather in {country.capital?.[0]}</h2>

        {weather && (
          <div>
            <p>
              temperature {weather.main.temp} Celsius
            </p>

            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />

            <p>
              wind {weather.wind.speed} m/s
            </p>
          </div>
        )}

        {!weather && (
          <p>Loading weather...</p>
        )}
      </div>
    )
  } else {
    content = <p>No country found</p>
  }

  return (
    <div>
      <div>
        find countries:{' '}
        <input
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {content}
    </div>
  )
}

export default App