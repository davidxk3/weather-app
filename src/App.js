import "./App.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { MdOutlineArrowDropDownCircle } from "react-icons/md";
import { AiOutlineCloseCircle } from "react-icons/ai";

const App = () => {
  const [location, setLocation] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [names, setNames] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  const fetchData = async () => {
    let alreadyExist = false;

    // Prevents another API call if name already exists (checks for exact typing)
    for (const history of searchHistory) {
      if (history.location.name.toLowerCase() === location.toLowerCase()) {
        setWeatherData(history);
        alreadyExist = true;
        break;
      }
    }
    if (!alreadyExist && location !== "") {
      const options = {
        method: "GET",
        url: "https://weatherapi-com.p.rapidapi.com/forecast.json",
        params: {
          q: location,
          days: "3",
        },
        headers: {
          "X-RapidAPI-Key": process.env.REACT_APP_API_KEY,
          "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
        },
      };

      try {
        const response = await axios(options);
        setWeatherData(response.data);
        // Checks after another API call (whatever location is autocorrected to) and makes sure it already doesn't exist
        for (let i = 0; i < names.length; i++) {
          if (names[i].props.children === response.data.location.name) {
            return;
          }
        }

        const historyName = (
          <p key={names.length} className="history_item transition" onClick={mobileBarOff}>
            {response.data.location.name}
          </p>
        );
        setNames((prevNames) => [...prevNames, historyName]);
        setSearchHistory((prevSearchHistory) => [
          ...prevSearchHistory,
          response.data,
        ]);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (names.length > 0) {
      const historyItems = document.querySelectorAll(".history_item");
      requestAnimationFrame(() => {
        historyItems[names.length - 1].classList.remove("transition");
      });
    }
  }, [names]);

  const handleSubmit = () => {
    const tempBtnContainer = document.querySelector(".temperature_btn_container");
    const temperatures = document.querySelectorAll(".temp_btn");
    tempBtnContainer.classList.remove("hidden");
    temperatures.forEach(function (temperature) {
      temperature.classList.remove("hidden");
    });
    fetchData();
  };

  const updateTemperature = () => {
    if (!weatherData) return; // Check if weatherData is null
    const activeButton = document.querySelector(".temp_btn.active");

    if (activeButton.innerHTML === "C°") {
      document.querySelector(".temperature").innerHTML =
        weatherData.current.temp_c;
      document.querySelector(".feels_like").innerHTML =
        weatherData.current.feelslike_c;

      const forecast = document.querySelectorAll(".forecast_temperature");
      forecast[0].innerHTML = weatherData.current.temp_c;
      for (let i = 1; i < forecast.length; i++) {
        forecast[i].innerHTML =
          weatherData.forecast.forecastday[i - 1].day.avgtemp_c;
      }

      document.querySelectorAll(".temperature_span").forEach(function (degree) {
        degree.innerHTML = "C°";
      });
    } else {
      document.querySelector(".temperature").innerHTML =
        weatherData.current.temp_f;
      document.querySelector(".feels_like").innerHTML =
        weatherData.current.feelslike_f;

      const forecast = document.querySelectorAll(".forecast_temperature");
      forecast[0].innerHTML = weatherData.current.temp_f;
      for (let i = 1; i < forecast.length; i++) {
        forecast[i].innerHTML =
          weatherData.forecast.forecastday[i - 1].day.avgtemp_f;
      }

      document.querySelectorAll(".temperature_span").forEach(function (degree) {
        degree.innerHTML = "F°";
      });
    }
  };

  const setTemperature = () => {
    const temperatures = document.querySelectorAll(".temp_btn");
    const celsius = temperatures[0];
    const fahrenheit = temperatures[1];

    celsius.addEventListener("click", function () {
      celsius.classList.add("active");
      fahrenheit.classList.remove("active");
      updateTemperature();
    });

    fahrenheit.addEventListener("click", function () {
      celsius.classList.remove("active");
      fahrenheit.classList.add("active");
      updateTemperature();
    });

    updateTemperature();
  };

  useEffect(() => {
    setTemperature();
    const container = document.querySelector('.container');
    if (container) {
      container.classList.add('transition');
      requestAnimationFrame(() => {
        container.classList.remove('transition');
      });
    }
  }, [weatherData]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      document.querySelector(".submit_btn").click();
    }
  };

  // Click on any of the history items to bring up their weather data
  useEffect(() => {
    const historyItems = document.querySelectorAll(".history_item");
    historyItems.forEach((item) => {
      item.addEventListener("click", function (event) {
        const historyItem = event.target;
        const index = Array.from(historyItems).indexOf(historyItem);
        setWeatherData(searchHistory[index]);
      });
    });
  }, [searchHistory]);

  // Mobile responsive bar
  const mobileResponsive = () => {
    if (names.length > 0) {
      const mobileBar = document.querySelector(".drop_menu");
      const closeMobileMenu = document.querySelector(".close_menu");
      const mobileNav = document.querySelector(".mobile_nav");
      const container = document.querySelector(".container");
      const history = document.querySelector(".history_container");
      const main = document.querySelector(".main");
      if (window.innerWidth <= 1600) {
        mobileBar.classList.remove("hidden");
        closeMobileMenu.classList.add("hidden");
        if (history) {
          history.classList.add("hidden");
          container.classList.add("mobile");
          main.classList.add("mobile");
        }
      } else {
        mobileBar.classList.add("hidden");
        mobileNav.classList.add("hidden");
        if (history) {
          history.classList.remove("hidden");
          container.classList.remove("mobile");
          main.classList.remove("mobile");
        }
      }
    }
  };

  const historyResponsive = () => {
    const mobileHistory = document.querySelector(".mobile_nav");
    const regularHistory = document.querySelector(".history_container");
    const history = document.querySelector(".history_items");
    if (window.innerWidth <= 1600 && mobileHistory && history) {
      mobileHistory.appendChild(history);
    } else {
      if (regularHistory && history) {
        regularHistory.appendChild(history);
      }
    }
  };

  useEffect(() => {
    mobileResponsive();
    historyResponsive();
  }, [weatherData]);

  window.addEventListener("resize", function () {
    mobileResponsive();
    historyResponsive();
  });

  const mobileBarOn = () => {
    const mobileNav = document.querySelector(".mobile_nav");
    const onIcon = document.querySelector(".drop_menu");
    const offIcon = document.querySelector(".close_menu");

    if (window.innerWidth <= 1600) {
      mobileNav.classList.remove("hidden");
      onIcon.classList.add("hidden");
      offIcon.classList.remove("hidden");
    }
  };

  const mobileBarOff = () => {
    const mobileNav = document.querySelector(".mobile_nav");
    const onIcon = document.querySelector(".drop_menu");
    const offIcon = document.querySelector(".close_menu");

    if (window.innerWidth <= 1600) {
      mobileNav.classList.add("hidden");
      onIcon.classList.remove("hidden");
      offIcon.classList.add("hidden");
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav_logo">
          <h1>DL Weather</h1>
        </div>
        <MdOutlineArrowDropDownCircle
          className="drop_menu hidden"
          onClick={mobileBarOn}
        />
        <AiOutlineCloseCircle
          className="close_menu hidden"
          onClick={mobileBarOff}
        />
      </nav>

      <nav className="mobile_nav hidden">
        <h1 className="history_heading mobile">Search History</h1>
      </nav>

      <ul className="temperature_btn_container hidden">
        <li className="nav_item">
          <button className="temp_btn active hidden">C°</button>
        </li>
        <li className="nav_item">
          <button className="temp_btn hidden">F°</button>
        </li>
      </ul>

      <div className="get_info">
        <input
          className="userLocation"
          type="text"
          id="location"
          value={location}
          placeholder="Enter city"
          onChange={(e) => setLocation(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSubmit} className="submit_btn">
          <FaSearch className="search_icon" />
        </button>
      </div>

      {weatherData && (
        <div className="container">
          <div className="main">
            <div className="weather_card primary">
              <h1 className="location_name">
                {weatherData.location.name}, {weatherData.location.country}
              </h1>
              <h3 className="date">
                {weatherData.location.localtime.substring(0, 10)}
              </h3>
              <h3 className="card_text">
                {weatherData.current.condition.text}
              </h3>
              <div className="temperature_container">
                <h1 className="temperature">{weatherData.current.temp_c}</h1>
                <h1 className="temperature_span">C°</h1>
              </div>
              <img
                src={`https:${weatherData.current.condition.icon}`}
                className="weather_icon"
                alt="icon"
              />
            </div>

            <div className="weather_card">
              <h1 className="right_now">
                Today in {weatherData.location.name}
              </h1>

              <div className="weather_items">
                <div className="weather_item">
                  <h1 className="card_text">Feels like</h1>
                  <div className="temperature_container">
                    <h1 className="feels_like">
                      {weatherData.current.feelslike_c}
                    </h1>
                    <h1 className="temperature_span">C°</h1>
                  </div>
                </div>

                <div className="weather_item">
                  <h3 className="card_text">Wind:</h3>
                  <h1 className="card_info">
                    {weatherData.current.gust_mph} mph
                  </h1>
                </div>

                <div className="weather_item">
                  <h3 className="card_text">Humidity:</h3>
                  <h1 className="card_info">{weatherData.current.humidity}%</h1>
                </div>

                <div className="weather_item">
                  <h3 className="card_text">UV Index:</h3>
                  <h1 className="card_info">{weatherData.current.uv}/11</h1>
                </div>

                <div className="weather_item">
                  <h3 className="card_text">Sunrise:</h3>
                  <h1 className="card_info">
                    {weatherData.forecast.forecastday[0].astro.sunrise}
                  </h1>
                </div>

                <div className="weather_item">
                  <h3 className="card_text">Sunset:</h3>
                  <h1 className="card_info">
                    {weatherData.forecast.forecastday[0].astro.sunset}
                  </h1>
                </div>

                <div className="weather_item">
                  <h3 className="card_text">Moonrise:</h3>
                  <h1 className="card_info">
                    {weatherData.forecast.forecastday[0].astro.moonrise}
                  </h1>
                </div>

                <div className="weather_item">
                  <h3 className="card_text">Moonset:</h3>
                  <h1 className="card_info">
                    {weatherData.forecast.forecastday[0].astro.moonset}
                  </h1>
                </div>

                <div className="weather_item">
                  <h3 className="card_text">Moon phase:</h3>
                  <h1 className="card_info">
                    {weatherData.forecast.forecastday[0].astro.moon_phase}
                  </h1>
                </div>
              </div>
            </div>

            <div className="weather_card">
              <h1 className="forecast_title">Weather Forecast</h1>
              <div className="weather_forecast">
                <div className="forecast_item">
                  <h1 className="forecast_date">Today</h1>
                  <h3 className="card_text">
                    {weatherData.current.condition.text}
                  </h3>
                  <div className="temperature_container">
                    <h1 className="forecast_temperature">
                      {weatherData.current.temp_c}
                    </h1>
                    <h1 className="temperature_span">C°</h1>
                  </div>
                  <img
                    src={`https:${weatherData.current.condition.icon}`}
                    alt="weather icon"
                  />
                </div>

                <div className="forecast_item">
                  <h1 className="forecast_date">
                    {weatherData.forecast.forecastday[0].date}
                  </h1>
                  <h3 className="card_text">
                    {weatherData.forecast.forecastday[0].day.condition.text}
                  </h3>
                  <div className="temperature_container">
                    <h1 className="forecast_temperature">
                      {weatherData.forecast.forecastday[0].day.avgtemp_c}
                    </h1>
                    <h1 className="temperature_span">C°</h1>
                  </div>
                  <img
                    src={`https:${weatherData.forecast.forecastday[0].day.condition.icon}`}
                    alt="weather icon"
                  />
                </div>
                <div className="forecast_item">
                  <h1 className="forecast_date">
                    {weatherData.forecast.forecastday[1].date}
                  </h1>
                  <h3 className="card_text">
                    {weatherData.forecast.forecastday[1].day.condition.text}
                  </h3>
                  <div className="temperature_container">
                    <h1 className="forecast_temperature">
                      {weatherData.forecast.forecastday[1].day.avgtemp_c}
                    </h1>
                    <h1 className="temperature_span">C°</h1>
                  </div>
                  <img
                    src={`https:${weatherData.forecast.forecastday[1].day.condition.icon}`}
                    alt="weather icon"
                  />
                </div>

                <div className="forecast_item">
                  <h1 className="forecast_date">
                    {weatherData.forecast.forecastday[2].date}
                  </h1>
                  <h3 className="card_text">
                    {weatherData.forecast.forecastday[2].day.condition.text}
                  </h3>
                  <div className="temperature_container">
                    <h1 className="forecast_temperature">
                      {weatherData.forecast.forecastday[2].day.avgtemp_c}
                    </h1>
                    <h1 className="temperature_span">C°</h1>
                  </div>
                  <img
                    src={`https:${weatherData.forecast.forecastday[2].day.condition.icon}`}
                    alt="weather icon"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="history">
            <div className="history_container">
              <h1 className="history_heading">Search History</h1>
              <div className="history_items">{names}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
