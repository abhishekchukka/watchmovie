import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import { useLocalstorage } from "./useLocalStorage";
// const tempMovieData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt0133093",
//     Title: "The Matrix",
//     Year: "1999",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt6751668",
//     Title: "Parasite",
//     Year: "2019",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//   },
// ];

// const tempWatchedData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     runtime: 148,
//     imdbRating: 8.8,
//     userRating: 10,
//   },
//   {
//     imdbID: "tt0088763",
//     Title: "Back to the Future",
//     Year: "1985",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
//     runtime: 116,
//     imdbRating: 8.5,
//     userRating: 9,
//   },
// ];
const key = "b03e3319";
// const query = "spiderman";
export default function App() {
  const [movies, setMovies] = useState([]);
  // const [watched, setWatched] = useLocalstorage([], "store");
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [query, setQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  function addFavs(movie) {
    setWatched((x) => [...x, movie]);
  }
  function handleOnclick(id) {
    setSelectedMovie((selectedId) => (selectedId === id ? null : id));
  }
  function clearOnClick(id) {
    setSelectedMovie(null);
  }
  function removeWatched(id) {
    setWatched((x) => x.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        setLoading(true);
        setErrorMessage("");

        try {
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${key}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) {
            throw new Error("error fetching");
          }

          const data = await res.json();

          if (data.Response === "False") {
            throw new Error(" Movie not found");
          }
          setMovies(data.Search);
          // console.log(data.Search);
          clearOnClick();
          setErrorMessage("");
        } catch (error) {
          console.log(error.message);
          if (error.name !== "AbortError") setErrorMessage(error.message);
        } finally {
          setLoading(false);
        }
      }
      if (query.length < 3) {
        setErrorMessage("type a little more");
        setMovies([]);
        return;
      }

      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {loading && <Loader />}
          {!loading && !errorMessage && (
            <MovieList movies={movies} handleOnclick={handleOnclick} />
          )}
          {!loading && errorMessage && <Errordiv errorMessage={errorMessage} />}
        </Box>
        <Box>
          {selectedMovie ? (
            <MovieDetails
              id={selectedMovie}
              clearOnClick={clearOnClick}
              addFavs={addFavs}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                removeWatched={removeWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
function Errordiv({ errorMessage }) {
  return (
    <div className="error">
      <p>{errorMessage}</p>
    </div>
  );
}
function Loader() {
  return <h2>LOADING..</h2>;
}
function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
function MovieDetails({ id, clearOnClick, addFavs, watched }) {
  const [movie, setMovie] = useState({});
  const [loading, setLoading] = useState(false);
  const [userrating, setUserRating] = useState("");
  const isWatched = watched.map((x) => x.imdbID).includes(id);

  const watchedUserRating = watched.find((x) => x.imdbID === id)?.userRating;
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          clearOnClick();
        }
      }
      document.addEventListener("keydown", callback);
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [clearOnClick]
  );
  function handleAdd() {
    const movieObj = {
      imdbID: id,
      Title: title,
      Year: year,
      Poster: poster,
      runtime: Number(runtime.split(" ").at(0)),
      imdbRating: Number(imdbRating),
      userRating: userrating,
    };
    addFavs(movieObj);
    clearOnClick();
  }
  useEffect(
    function () {
      async function getMovieDetails() {
        try {
          setLoading(true);
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${key}&i=${id}`
          );
          if (!res.ok) {
            throw new Error("Cant fetch the data");
          }

          const data = await res.json();
          console.log(data);
          setMovie(data);
          setLoading(false);
        } catch (err) {
          console.log(err);
        }
      }

      getMovieDetails();
    },
    [id]
  );
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      return function () {
        document.title = "Movie App";
      };
    },
    [title]
  );
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="details">
            <header>
              <button className="btn-back" onClick={clearOnClick}>
                &larr;
              </button>
              <img src={poster} alt={`Poster of ${title} movie`} />
              <div className="details-overview">
                <h2>{title}</h2>
                <p>
                  {released}
                  &bull; {runtime}
                </p>
                <p>{genre}</p>
                <p>
                  <span>⭐</span>
                  {imdbRating} imDB rating
                </p>
              </div>
            </header>
            <section>
              <div className="rating">
                {!isWatched ? (
                  <>
                    {" "}
                    <StarRating
                      maxRating={10}
                      size={24}
                      onSetRating={setUserRating}
                    />
                    {userrating > 0 && (
                      <button className="btn-add" onClick={handleAdd}>
                        Add to Favorites
                      </button>
                    )}
                  </>
                ) : (
                  <h2>
                    You have already rated {watchedUserRating}✨ for this movie
                  </h2>
                )}
              </div>
              <p>
                <em>{plot}</em>
              </p>
              <p>Starring {actors}</p>
              <p>Directed by {director}</p>
            </section>
          </div>
        </>
      )}
    </>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen1, setIsOpen1] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen1 ? "–" : "+"}
      </button>
      {isOpen1 && children}
    </div>
  );
}
// function WatchedBox() {
//   const [isOpen2, setIsOpen2] = useState(true);
//   const [watched, setWatched] = useState(tempWatchedData);
//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>

//         </>
//       )}
//     </div>
//   );
// }
function MovieList({ movies, handleOnclick }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} handleOnclick={handleOnclick} />
      ))}
    </ul>
  );
}
function Movie({ movie, handleOnclick }) {
  return (
    <li key={movie.imdbID} onClick={() => handleOnclick(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMovieList({ watched, removeWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          removeWatched={removeWatched}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, removeWatched }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => removeWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
