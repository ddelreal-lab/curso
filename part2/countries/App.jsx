import { useEffect, useState } from 'react'
import axios from 'axios'

const apiUrl = 'https://studies.cs.helsinki.fi/restcountries/api/all'
const weatherApiUrl = 'https://api.openweathermap.org/data/2.5/weather'
const weatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY

const Weather = ({ capital }) => {
	const [weather, setWeather] = useState(null)
	const [error, setError] = useState(null)

	useEffect(() => {
		setWeather(null)
		setError(null)

		if (!weatherApiKey) {
			setError('Set VITE_OPENWEATHER_API_KEY to load weather data')
			return
		}

		axios
			.get(weatherApiUrl, {
				params: {
					q: capital,
					units: 'metric',
					appid: weatherApiKey
				}
			})
			.then(response => setWeather(response.data))
			.catch(() => setError('Unable to load weather data'))
	}, [capital])

	if (error) {
		return <p>{error}</p>
	}

	if (!weather) {
		return <p>Loading weather...</p>
	}

	const weatherDescription = weather.weather[0]

	return (
		<div>
			<h3>Weather in {capital}</h3>
			<p>temperature {weather.main.temp} Celsius</p>
			<img
				src={`https://openweathermap.org/img/wn/${weatherDescription.icon}@2x.png`}
				alt={weatherDescription.description}
			/>
			<p>wind {weather.wind.speed} m/s</p>
		</div>
	)
}

const Country = ({ country }) => {
	const languages = Object.values(country.languages ?? {})
	const capital = country.capital?.[0]

	return (
		<div>
			<h2>{country.name.common}</h2>
			<p>capital {country.capital?.join(', ')}</p>
			<p>area {country.area}</p>
			<h3>languages:</h3>
			<ul>
				{languages.map(language => <li key={language}>{language}</li>)}
			</ul>
			<img src={country.flags.svg} alt={`Flag of ${country.name.common}`} />
			{capital && <Weather capital={capital} />}
		</div>
	)
}

const App = () => {
	const [countries, setCountries] = useState([])
	const [search, setSearch] = useState('')
	const [error, setError] = useState(null)

	useEffect(() => {
		axios
			.get(apiUrl)
			.then(response => setCountries(response.data))
			.catch(() => setError('Unable to load country data'))
	}, [])

	const handleSearchChange = event => setSearch(event.target.value)
	const query = search.trim().toLowerCase()
	const matches = countries.filter(country =>
		country.name.common.toLowerCase().includes(query)
	)

	return (
		<div>
			<label>
				find countries
				<input value={search} onChange={handleSearchChange} />
			</label>

			{error && <p>{error}</p>}
			{!error && query && matches.length > 10 && (
				<p>Too many matches, specify another filter</p>
			)}
			{!error && query && matches.length === 0 && (
				<p>No matches</p>
			)}
			{!error && query && matches.length > 1 && matches.length <= 10 && (
				<ul>
					{matches.map(country => (
						<li key={country.cca3}>
							{country.name.common}
							<button type="button" onClick={() => setSearch(country.name.common)}>
								show
							</button>
						</li>
					))}
				</ul>
			)}
			{!error && query && matches.length === 1 && (
				<Country country={matches[0]} />
			)}
		</div>
	)
}

export default App
